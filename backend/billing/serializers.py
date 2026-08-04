from rest_framework import serializers
from .models import PaymentTransaction, Subscription, SubscriptionPlan


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    monthlyPrice = serializers.DecimalField(source='monthly_price', max_digits=12, decimal_places=2)
    dailyStreamLimit = serializers.IntegerField(source='daily_stream_limit', allow_null=True, required=False)
    playlistLimit = serializers.IntegerField(source='playlist_limit', allow_null=True, required=False)
    canUploadAvatar = serializers.BooleanField(source='can_upload_avatar')
    canDownload = serializers.BooleanField(source='can_download')
    earlyAccess = serializers.BooleanField(source='early_access')
    canViewStats = serializers.BooleanField(source='can_view_stats')

    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'tier', 'name', 'monthlyPrice', 'dailyStreamLimit', 'playlistLimit',
            'canUploadAvatar', 'canDownload', 'earlyAccess', 'canViewStats', 'is_active',
        ]
        read_only_fields = ['id', 'tier']


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    startsAt = serializers.DateTimeField(source='starts_at', read_only=True)
    endsAt = serializers.DateTimeField(source='ends_at', read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'plan', 'startsAt', 'endsAt', 'is_active']


class PaymentTransactionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    verifiedAt = serializers.DateTimeField(source='verified_at', read_only=True)
    referenceId = serializers.CharField(source='reference_id', read_only=True)
    redirectUrl = serializers.SerializerMethodField()

    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'plan', 'months', 'amount', 'provider', 'authority', 'referenceId',
            'status', 'createdAt', 'verifiedAt', 'redirectUrl',
        ]

    def get_redirectUrl(self, obj):
        return f'/payments/sandbox/{obj.authority}'
