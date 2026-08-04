import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ArtistVerificationRequest',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('sample_work_url', models.URLField(blank=True)),
                ('sample_work_file', models.FileField(blank=True, null=True, upload_to='artist-samples/%Y/%m/')),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')], default='PENDING', max_length=12)),
                ('rejection_reason', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('reviewed_at', models.DateTimeField(blank=True, null=True)),
                ('artist', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='verification_request', to=settings.AUTH_USER_MODEL)),
                ('reviewed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reviewed_artist_requests', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['created_at']},
        ),
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('subject', models.CharField(max_length=220)),
                ('status', models.CharField(choices=[('OPEN', 'Open'), ('ANSWERED', 'Answered'), ('CLOSED', 'Closed')], default='OPEN', max_length=12)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('assigned_to', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_tickets', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tickets', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-updated_at']},
        ),
        migrations.CreateModel(
            name='TicketMessage',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('body', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_messages', to=settings.AUTH_USER_MODEL)),
                ('ticket', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='operations.ticket')),
            ],
            options={'ordering': ['created_at']},
        ),
        migrations.CreateModel(
            name='MonthlyArtistAudit',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('month', models.DateField(help_text='First day of the audited month')),
                ('unique_listeners', models.PositiveIntegerField(default=0)),
                ('total_streams', models.PositiveIntegerField(default=0)),
                ('reward_amount', models.DecimalField(decimal_places=4, default=0, max_digits=16)),
                ('payment_status', models.CharField(choices=[('PENDING', 'Pending payment'), ('SETTLED', 'Settled')], default='PENDING', max_length=12)),
                ('settled_at', models.DateTimeField(blank=True, null=True)),
                ('calculated_at', models.DateTimeField(auto_now=True)),
                ('artist', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='monthly_audits', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-month', 'artist__display_name']},
        ),
        migrations.AddConstraint(model_name='monthlyartistaudit', constraint=models.UniqueConstraint(fields=('artist', 'month'), name='unique_artist_month_audit')),
    ]
