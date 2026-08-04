from datetime import date, datetime
from decimal import Decimal
from django.conf import settings
from django.db import transaction
from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import User
from accounts.permissions import IsAdmin, IsSupportOrAdmin
from community.models import Notification
from music.models import StreamEvent
from .models import ArtistVerificationRequest, MonthlyArtistAudit, Ticket, TicketMessage
from .serializers import ArtistVerificationSerializer, MonthlyAuditSerializer, TicketMessageSerializer, TicketSerializer


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['subject', 'user__display_name', 'user__email', 'status']
    ordering_fields = ['created_at', 'updated_at', 'status']

    def get_queryset(self):
        qs = Ticket.objects.select_related('user', 'assigned_to').prefetch_related('messages__sender')
        if self.request.user.role in {User.Role.SUPPORTER, User.Role.ADMIN}:
            return qs
        return qs.filter(user=self.request.user)

    def perform_update(self, serializer):
        if self.request.user.role not in {User.Role.SUPPORTER, User.Role.ADMIN}:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only support staff can change ticket status.')
        serializer.save()

    @action(detail=True, methods=['post'])
    def messages(self, request, pk=None):
        ticket = self.get_object()
        body = str(request.data.get('body', '')).strip()
        if not body:
            return Response({'detail': 'Message body is required.'}, status=status.HTTP_400_BAD_REQUEST)
        message = TicketMessage.objects.create(ticket=ticket, sender=request.user, body=body)
        if request.user.role in {User.Role.SUPPORTER, User.Role.ADMIN}:
            ticket.status = Ticket.Status.ANSWERED
            ticket.assigned_to = request.user
            Notification.objects.create(
                user=ticket.user,
                type=Notification.Type.TICKET,
                message=f'Your support ticket “{ticket.subject}” received a response.',
                link=f'/support?ticket={ticket.id}',
            )
        else:
            ticket.status = Ticket.Status.OPEN
            for staff in User.objects.filter(role__in=[User.Role.SUPPORTER, User.Role.ADMIN], is_active=True):
                Notification.objects.create(
                    user=staff,
                    type=Notification.Type.TICKET,
                    message=f'New message on ticket “{ticket.subject}”.',
                    link=f'/support?ticket={ticket.id}',
                )
        ticket.save(update_fields=['status', 'assigned_to', 'updated_at'])
        return Response(TicketMessageSerializer(message).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        ticket = self.get_object()
        if ticket.user_id != request.user.id and request.user.role not in {User.Role.SUPPORTER, User.Role.ADMIN}:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        ticket.status = Ticket.Status.CLOSED
        ticket.save(update_fields=['status', 'updated_at'])
        return Response(TicketSerializer(ticket, context={'request': request}).data)


class ArtistVerificationViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = ArtistVerificationSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    search_fields = ['artist__display_name', 'artist__email', 'status']
    ordering_fields = ['created_at', 'reviewed_at', 'status']

    def get_queryset(self):
        qs = ArtistVerificationRequest.objects.select_related('artist', 'reviewed_by')
        if self.request.user.role in {User.Role.SUPPORTER, User.Role.ADMIN}:
            return qs
        return qs.filter(artist=self.request.user)

    def update(self, request, *args, **kwargs):
        obj = self.get_object()
        if obj.artist_id != request.user.id or obj.status != ArtistVerificationRequest.Status.PENDING:
            return Response({'detail': 'This request cannot be edited.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[IsSupportOrAdmin])
    @transaction.atomic
    def approve(self, request, pk=None):
        obj = self.get_object()
        obj.status = ArtistVerificationRequest.Status.APPROVED
        obj.rejection_reason = ''
        obj.reviewed_by = request.user
        obj.reviewed_at = timezone.now()
        obj.save()
        artist = obj.artist
        artist.artist_status = User.ArtistStatus.APPROVED
        artist.artist_rejection_reason = ''
        artist.save(update_fields=['artist_status', 'artist_rejection_reason'])
        Notification.objects.create(
            user=artist,
            type=Notification.Type.ARTIST_VERIFICATION,
            message='Your artist account has been approved.',
            link='/artist',
        )
        return Response(ArtistVerificationSerializer(obj, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[IsSupportOrAdmin])
    @transaction.atomic
    def reject(self, request, pk=None):
        reason = str(request.data.get('reason', '')).strip()
        if not reason:
            return Response({'detail': 'Rejection reason is required.'}, status=status.HTTP_400_BAD_REQUEST)
        obj = self.get_object()
        obj.status = ArtistVerificationRequest.Status.REJECTED
        obj.rejection_reason = reason
        obj.reviewed_by = request.user
        obj.reviewed_at = timezone.now()
        obj.save()
        artist = obj.artist
        artist.artist_status = User.ArtistStatus.REJECTED
        artist.artist_rejection_reason = reason
        artist.save(update_fields=['artist_status', 'artist_rejection_reason'])
        Notification.objects.create(
            user=artist,
            type=Notification.Type.ARTIST_VERIFICATION,
            message=f'Your artist account was rejected: {reason}',
            link='/artist',
        )
        return Response(ArtistVerificationSerializer(obj, context={'request': request}).data)


class MonthlyAuditViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = MonthlyAuditSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['artist__display_name', 'payment_status']
    ordering_fields = ['month', 'total_streams', 'reward_amount']

    def get_queryset(self):
        qs = MonthlyArtistAudit.objects.select_related('artist')
        if self.request.user.role in {User.Role.SUPPORTER, User.Role.ADMIN}:
            return qs
        if self.request.user.role == User.Role.ARTIST:
            return qs.filter(artist=self.request.user)
        return qs.none()

    @action(detail=False, methods=['post'], permission_classes=[IsSupportOrAdmin])
    @transaction.atomic
    def calculate(self, request):
        raw_month = str(request.data.get('month', '')).strip()
        try:
            month = datetime.strptime(raw_month, '%Y-%m').date().replace(day=1)
        except ValueError:
            return Response({'detail': 'month must use YYYY-MM format.'}, status=status.HTTP_400_BAD_REQUEST)
        if month.month == 12:
            next_month = date(month.year + 1, 1, 1)
        else:
            next_month = date(month.year, month.month + 1, 1)
        rate = Decimal(str(settings.STREAM_REVENUE_RATE))
        results = []
        artists = User.objects.filter(role=User.Role.ARTIST, artist_status=User.ArtistStatus.APPROVED)
        for artist in artists:
            events = StreamEvent.objects.filter(
                song__primary_artist=artist,
                listened_at__date__gte=month,
                listened_at__date__lt=next_month,
            )
            total = events.count()
            unique = events.values('user_id').distinct().count()
            audit, _ = MonthlyArtistAudit.objects.update_or_create(
                artist=artist,
                month=month,
                defaults={
                    'unique_listeners': unique,
                    'total_streams': total,
                    'reward_amount': Decimal(total) * rate,
                },
            )
            results.append(audit)
            Notification.objects.create(
                user=artist,
                type=Notification.Type.FINANCE,
                message=f'Your {month:%Y-%m} artist revenue report is ready.',
                link='/artist',
            )
        return Response(MonthlyAuditSerializer(results, many=True).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def settle(self, request, pk=None):
        audit = self.get_object()
        audit.payment_status = MonthlyArtistAudit.PaymentStatus.SETTLED
        audit.settled_at = timezone.now()
        audit.save(update_fields=['payment_status', 'settled_at'])
        return Response(MonthlyAuditSerializer(audit).data)
