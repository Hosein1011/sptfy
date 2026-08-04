from rest_framework import serializers
from accounts.models import User
from accounts.serializers import UserSerializer
from community.models import Notification
from .models import ArtistVerificationRequest, MonthlyArtistAudit, Ticket, TicketMessage


class ArtistVerificationSerializer(serializers.ModelSerializer):
    artist = UserSerializer(read_only=True)
    sampleWorkUrl = serializers.URLField(source='sample_work_url', required=False, allow_blank=True)
    sampleWorkFile = serializers.FileField(source='sample_work_file', required=False, allow_null=True)
    rejectionReason = serializers.CharField(source='rejection_reason', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    reviewedAt = serializers.DateTimeField(source='reviewed_at', read_only=True)
    reviewedBy = serializers.CharField(source='reviewed_by.display_name', read_only=True, allow_null=True)

    class Meta:
        model = ArtistVerificationRequest
        fields = [
            'id', 'artist', 'sampleWorkUrl', 'sampleWorkFile', 'status',
            'rejectionReason', 'createdAt', 'reviewedAt', 'reviewedBy',
        ]
        read_only_fields = ['status']


class TicketMessageSerializer(serializers.ModelSerializer):
    senderId = serializers.UUIDField(source='sender_id', read_only=True)
    senderName = serializers.CharField(source='sender.display_name', read_only=True)
    senderRole = serializers.CharField(source='sender.role', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = TicketMessage
        fields = ['id', 'senderId', 'senderName', 'senderRole', 'body', 'createdAt']
        read_only_fields = ['id', 'senderId', 'senderName', 'senderRole', 'createdAt']


class TicketSerializer(serializers.ModelSerializer):
    userId = serializers.UUIDField(source='user_id', read_only=True)
    userName = serializers.CharField(source='user.display_name', read_only=True)
    assignedTo = serializers.CharField(source='assigned_to.display_name', read_only=True, allow_null=True)
    messages = TicketMessageSerializer(many=True, read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    initialMessage = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Ticket
        fields = [
            'id', 'userId', 'userName', 'subject', 'status', 'assignedTo',
            'messages', 'initialMessage', 'createdAt', 'updatedAt',
        ]
        read_only_fields = ['id', 'userId', 'userName', 'status', 'assignedTo', 'createdAt', 'updatedAt']

    def create(self, validated_data):
        initial = validated_data.pop('initialMessage', '')
        ticket = Ticket.objects.create(user=self.context['request'].user, **validated_data)
        if initial:
            TicketMessage.objects.create(ticket=ticket, sender=self.context['request'].user, body=initial)
        for staff in User.objects.filter(role__in=[User.Role.SUPPORTER, User.Role.ADMIN], is_active=True):
            Notification.objects.create(
                user=staff,
                type=Notification.Type.TICKET,
                message=f'New support ticket: {ticket.subject}',
                link=f'/support?ticket={ticket.id}',
            )
        return ticket


class MonthlyAuditSerializer(serializers.ModelSerializer):
    artistId = serializers.UUIDField(source='artist_id', read_only=True)
    artistName = serializers.CharField(source='artist.display_name', read_only=True)
    uniqueListeners = serializers.IntegerField(source='unique_listeners', read_only=True)
    totalStreams = serializers.IntegerField(source='total_streams', read_only=True)
    rewardAmount = serializers.DecimalField(source='reward_amount', max_digits=16, decimal_places=4, read_only=True)
    paymentStatus = serializers.CharField(source='payment_status', read_only=True)
    settledAt = serializers.DateTimeField(source='settled_at', read_only=True)
    calculatedAt = serializers.DateTimeField(source='calculated_at', read_only=True)

    class Meta:
        model = MonthlyArtistAudit
        fields = [
            'id', 'artistId', 'artistName', 'month', 'uniqueListeners',
            'totalStreams', 'rewardAmount', 'paymentStatus', 'settledAt', 'calculatedAt',
        ]
