import uuid
from django.conf import settings
from django.db import models


class SubscriptionPlan(models.Model):
    class Tier(models.TextChoices):
        FREE = 'FREE', 'Free'
        STANDARD = 'STANDARD', 'Silver'
        GOLD = 'GOLD', 'Gold'

    tier = models.CharField(max_length=12, choices=Tier.choices, unique=True)
    name = models.CharField(max_length=80)
    monthly_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    daily_stream_limit = models.PositiveIntegerField(null=True, blank=True)
    playlist_limit = models.PositiveIntegerField(null=True, blank=True)
    can_upload_avatar = models.BooleanField(default=False)
    can_download = models.BooleanField(default=False)
    early_access = models.BooleanField(default=False)
    can_view_stats = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Subscription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name='subscriptions')
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class PaymentTransaction(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'
        CANCELED = 'CANCELED', 'Canceled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name='payments')
    months = models.PositiveSmallIntegerField()
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    provider = models.CharField(max_length=40, default='sandbox')
    authority = models.CharField(max_length=120, unique=True)
    reference_id = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
