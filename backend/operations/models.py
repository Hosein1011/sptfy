import uuid
from django.conf import settings
from django.db import models


class ArtistVerificationRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    artist = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='verification_request')
    sample_work_url = models.URLField(blank=True)
    sample_work_file = models.FileField(upload_to='artist-samples/%Y/%m/', null=True, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    rejection_reason = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_artist_requests')
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['created_at']


class Ticket(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        ANSWERED = 'ANSWERED', 'Answered'
        CLOSED = 'CLOSED', 'Closed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets')
    subject = models.CharField(max_length=220)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.OPEN)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']


class TicketMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ticket_messages')
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']


class MonthlyArtistAudit(models.Model):
    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending payment'
        SETTLED = 'SETTLED', 'Settled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    artist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='monthly_audits')
    month = models.DateField(help_text='First day of the audited month')
    unique_listeners = models.PositiveIntegerField(default=0)
    total_streams = models.PositiveIntegerField(default=0)
    reward_amount = models.DecimalField(max_digits=16, decimal_places=4, default=0)
    payment_status = models.CharField(max_length=12, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    settled_at = models.DateTimeField(null=True, blank=True)
    calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-month', 'artist__display_name']
        constraints = [
            models.UniqueConstraint(fields=['artist', 'month'], name='unique_artist_month_audit')
        ]
