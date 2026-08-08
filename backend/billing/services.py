from datetime import timedelta

from django.db.models import Q
from django.utils import timezone

from accounts.models import User
from .models import Subscription


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
