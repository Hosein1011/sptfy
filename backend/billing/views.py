import secrets
from datetime import timedelta
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.models import User
from accounts.permissions import IsAdmin
from .models import PaymentTransaction, Subscription, SubscriptionPlan
from .serializers import PaymentTransactionSerializer, SubscriptionPlanSerializer, SubscriptionSerializer


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.filter(is_active=True).order_by('monthly_price')
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_permissions(self):
        if self.action in {'create', 'update', 'partial_update', 'destroy'}:
            return [IsAdmin()]
        return [AllowAny()]


class SubscriptionViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Subscription.objects.select_related('plan', 'user')
        if self.request.user.role == User.Role.ADMIN:
            return qs
        return qs.filter(user=self.request.user)


class PaymentTransactionViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = PaymentTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = PaymentTransaction.objects.select_related('plan', 'user')
        if self.request.user.role == User.Role.ADMIN:
            return qs
        return qs.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        tier = str(request.data.get('tier', '')).upper()
        try:
            months = int(request.data.get('months', 1))
        except (TypeError, ValueError):
            months = 0
        if months not in {1, 3, 6, 12}:
            return Response({'detail': 'months must be one of 1, 3, 6, or 12.'}, status=status.HTTP_400_BAD_REQUEST)
        plan = SubscriptionPlan.objects.filter(tier=tier, is_active=True).first()
        if not plan or plan.tier == SubscriptionPlan.Tier.FREE:
            return Response({'detail': 'Select an active paid plan.'}, status=status.HTTP_400_BAD_REQUEST)

        payment = PaymentTransaction.objects.create(
            user=request.user,
            plan=plan,
            months=months,
            amount=plan.monthly_price * Decimal(months),
            provider=str(request.data.get('provider', 'sandbox')),
            authority=secrets.token_urlsafe(24),
        )
        return Response(PaymentTransactionSerializer(payment, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def verify(self, request, pk=None):
        payment = self.get_object()
        if payment.status == PaymentTransaction.Status.SUCCESS:
            return Response(PaymentTransactionSerializer(payment, context={'request': request}).data)

        # Development/sandbox adapter. Replace this branch with the selected gateway's verification API.
        successful = request.data.get('success') in {True, 'true', '1', 1}
        payment.verified_at = timezone.now()
        if not successful:
            payment.status = PaymentTransaction.Status.FAILED
            payment.save(update_fields=['status', 'verified_at'])
            return Response(PaymentTransactionSerializer(payment, context={'request': request}).data, status=status.HTTP_400_BAD_REQUEST)

        payment.status = PaymentTransaction.Status.SUCCESS
        payment.reference_id = f'MEL-{secrets.token_hex(6).upper()}'
        payment.save(update_fields=['status', 'reference_id', 'verified_at'])

        now = timezone.now()
        Subscription.objects.filter(user=payment.user, is_active=True).update(is_active=False)
        subscription = Subscription.objects.create(
            user=payment.user,
            plan=payment.plan,
            starts_at=now,
            ends_at=now + timedelta(days=30 * payment.months),
            is_active=True,
        )
        payment.user.tier = payment.plan.tier
        payment.user.save(update_fields=['tier'])

        return Response({
            'payment': PaymentTransactionSerializer(payment, context={'request': request}).data,
            'subscription': SubscriptionSerializer(subscription).data,
        })
