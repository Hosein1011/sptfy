from datetime import timedelta

from django.db.models import Q
from django.utils import timezone

from accounts.models import User
from .models import Subscription
import secrets
from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from .models import PaymentTransaction, Subscription

def sync_user_subscription(user: User) -> User:
    """Keep cached tier in sync and create subscription-expiry notifications."""
    if not getattr(user, 'is_authenticated', False) or user.role != User.Role.USER:
        return user

    now = timezone.now()
    expired_count = Subscription.objects.filter(
        user=user, is_active=True, ends_at__lte=now
    ).update(is_active=False)
    active = (
        Subscription.objects.filter(user=user, is_active=True, starts_at__lte=now)
        .filter(Q(ends_at__isnull=True) | Q(ends_at__gt=now))
        .select_related('plan')
        .order_by('-created_at')
        .first()
    )
    expected_tier = active.plan.tier if active else User.Tier.FREE
    previous_tier = user.tier
    if previous_tier != expected_tier:
        User.objects.filter(pk=user.pk).update(tier=expected_tier)
        user.tier = expected_tier

    from community.models import Notification

    if expired_count and expected_tier == User.Tier.FREE and previous_tier != User.Tier.FREE:
        Notification.objects.get_or_create(
            user=user,
            type=Notification.Type.SUBSCRIPTION,
            message='Your paid subscription has expired.',
            link='/settings',
        )

    # Surface the required end-of-subscription warning before expiry. Authentication
    # runs this sync on ordinary API use, and get_or_create prevents duplicates.
    if active and active.ends_at and now < active.ends_at <= now + timedelta(days=3):
        expiry_date = timezone.localtime(active.ends_at).date().isoformat()
        Notification.objects.get_or_create(
            user=user,
            type=Notification.Type.SUBSCRIPTION,
            message=f'Your {active.plan.name} subscription expires on {expiry_date}.',
            link='/settings',
        )
    return user


class PaymentService:
    @staticmethod
    @transaction.atomic
    def verify_sandbox_payment(payment: PaymentTransaction, is_successful: bool) -> tuple[bool, PaymentTransaction, Subscription | None]:
        if payment.status == PaymentTransaction.Status.SUCCESS:
            # اگر از قبل تایید شده باشد
            sub = Subscription.objects.filter(user=payment.user, plan=payment.plan, is_active=True).first()
            return True, payment, sub

        payment.verified_at = timezone.now()

        if not is_successful:
            payment.status = PaymentTransaction.Status.FAILED
            payment.save(update_fields=['status', 'verified_at'])
            return False, payment, None

        # مسیر موفقیت‌آمیز تراکنش
        payment.status = PaymentTransaction.Status.SUCCESS
        payment.reference_id = f'MEL-{secrets.token_hex(6).upper()}'
        payment.save(update_fields=['status', 'reference_id', 'verified_at'])

        # غیرفعال کردن اشتراک‌های قبلی کاربر
        Subscription.objects.filter(user=payment.user, is_active=True).update(is_active=False)

        # ایجاد اشتراک جدید
        now = timezone.now()
        subscription = Subscription.objects.create(
            user=payment.user,
            plan=payment.plan,
            starts_at=now,
            ends_at=now + timedelta(days=30 * payment.months),
            is_active=True,
        )

        # ارتقاء سطح کاربری
        payment.user.tier = payment.plan.tier
        payment.user.save(update_fields=['tier'])

        return True, payment, subscription