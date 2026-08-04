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
            name='SubscriptionPlan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tier', models.CharField(choices=[('FREE', 'Free'), ('STANDARD', 'Silver'), ('GOLD', 'Gold')], max_length=12, unique=True)),
                ('name', models.CharField(max_length=80)),
                ('monthly_price', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('daily_stream_limit', models.PositiveIntegerField(blank=True, null=True)),
                ('playlist_limit', models.PositiveIntegerField(blank=True, null=True)),
                ('can_upload_avatar', models.BooleanField(default=False)),
                ('can_download', models.BooleanField(default=False)),
                ('early_access', models.BooleanField(default=False)),
                ('can_view_stats', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Subscription',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('starts_at', models.DateTimeField()),
                ('ends_at', models.DateTimeField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('plan', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='subscriptions', to='billing.subscriptionplan')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscriptions', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='PaymentTransaction',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('months', models.PositiveSmallIntegerField()),
                ('amount', models.DecimalField(decimal_places=2, max_digits=14)),
                ('provider', models.CharField(default='sandbox', max_length=40)),
                ('authority', models.CharField(max_length=120, unique=True)),
                ('reference_id', models.CharField(blank=True, max_length=120)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('SUCCESS', 'Success'), ('FAILED', 'Failed'), ('CANCELED', 'Canceled')], default='PENDING', max_length=12)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('verified_at', models.DateTimeField(blank=True, null=True)),
                ('plan', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='payments', to='billing.subscriptionplan')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payments', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
