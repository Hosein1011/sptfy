from django.db.models import Q
from django.utils import timezone

from accounts.models import User
from .models import Subscription


def sync_user_subscription(user: User) -> User:
    """Keep the cached user tier aligned with active, non-expired subscriptions."""
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
    if expired_count and expected_tier == User.Tier.FREE and previous_tier != User.Tier.FREE:
        from community.models import Notification
        Notification.objects.create(
            user=user,
            type=Notification.Type.SUBSCRIPTION,
            message='Your paid subscription has expired.',
            link='/settings',
        )
    return user
