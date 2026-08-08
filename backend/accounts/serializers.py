import re
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from .models import User, UserPreference


def unique_username(seed: str) -> str:
    base = re.sub(r'[^a-zA-Z0-9_]+', '-', seed).strip('-').lower() or 'user'
    candidate = base[:130]
    index = 1
    while User.objects.filter(username=candidate).exists():
        suffix = f'-{index}'
        candidate = f'{base[:150-len(suffix)]}{suffix}'
        index += 1
    return candidate


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        exclude = ['id', 'user']


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='display_name')
    email = serializers.SerializerMethodField()
    followingIds = serializers.SerializerMethodField()
    followerCount = serializers.IntegerField(source='followers.count', read_only=True)
    followingCount = serializers.IntegerField(source='following.count', read_only=True)
    isVerified = serializers.BooleanField(source='is_verified_artist', read_only=True)
    profileImage = serializers.SerializerMethodField()
    artistStatus = serializers.CharField(source='artist_status', read_only=True)
    preferences = UserPreferenceSerializer(read_only=True)
    dailyStreams = serializers.SerializerMethodField()
    artistListeners = serializers.SerializerMethodField()
    artistStreams = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'name', 'role', 'tier', 'birth_date', 'gender',
            'profileImage', 'bio', 'followingIds', 'followerCount', 'followingCount',
            'isVerified', 'artistStatus', 'artist_rejection_reason', 'preferences',
            'dailyStreams', 'artistListeners', 'artistStreams',
        ]
        read_only_fields = ['id', 'username', 'role', 'tier', 'artist_rejection_reason']

    def get_email(self, obj):
        if self.context.get('include_private'):
            return obj.email
        request = self.context.get('request')
        if request and request.user.is_authenticated and (
            request.user.id == obj.id or request.user.role in {User.Role.SUPPORTER, User.Role.ADMIN}
        ):
            return obj.email
        return None

    def get_followingIds(self, obj):
        return [str(pk) for pk in obj.following.values_list('pk', flat=True)]

    def get_profileImage(self, obj):
        if not obj.profile_image:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.profile_image.url) if request else obj.profile_image.url

    def get_dailyStreams(self, obj):
        request = self.context.get('request')
        if not (request and request.user.is_authenticated):
            return None
        # The phase-one profile specification explicitly displays the user's
        # daily streamed-song count on the profile, including profiles that can
        # be followed by another authenticated user.
        return obj.stream_events.filter(listened_at__date=timezone.localdate()).count()

    def _can_view_artist_stats(self, obj):
        request = self.context.get('request')
        if not (request and request.user.is_authenticated) or obj.role != User.Role.ARTIST:
            return False
        return (
            request.user.id == obj.id
            or request.user.tier == User.Tier.GOLD
            or request.user.role in {User.Role.SUPPORTER, User.Role.ADMIN}
        )

    def get_artistListeners(self, obj):
        if not self._can_view_artist_stats(obj):
            return None
        return obj.songs.filter(is_published=True).values('stream_events__user_id').exclude(stream_events__user_id=None).distinct().count()

    def get_artistStreams(self, obj):
        if not self._can_view_artist_stats(obj):
            return None
        from music.models import StreamEvent
        return StreamEvent.objects.filter(song__primary_artist=obj, song__is_published=True).count()


class UserUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='display_name', required=False)

    class Meta:
        model = User
        fields = ['name', 'birth_date', 'gender', 'profile_image', 'bio']

    def validate_profile_image(self, value):
        user = self.context['request'].user
        if user.role == User.Role.USER and user.tier == User.Tier.FREE:
            raise serializers.ValidationError('Free-tier listeners cannot upload a profile image.')
        return value


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    passwordConfirm = serializers.CharField(write_only=True)
    birthDate = serializers.DateField()
    gender = serializers.ChoiceField(choices=User.Gender.choices)
    acceptedPrivacy = serializers.BooleanField()

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value

    def validate(self, attrs):
        if not attrs.get('acceptedPrivacy'):
            raise serializers.ValidationError({'acceptedPrivacy': 'Privacy policy must be accepted.'})
        confirm = attrs.get('passwordConfirm')
        if confirm != attrs['password']:
            raise serializers.ValidationError({'passwordConfirm': 'Passwords do not match.'})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop('acceptedPrivacy', None)
        validated_data.pop('passwordConfirm', None)
        name = validated_data.pop('name')
        birth_date = validated_data.pop('birthDate', None)
        user = User.objects.create_user(
            username=unique_username(validated_data['email'].split('@')[0]),
            display_name=name,
            birth_date=birth_date,
            role=User.Role.USER,
            tier=User.Tier.FREE,
            **validated_data,
        )
        return user


class ArtistRegisterSerializer(serializers.Serializer):
    stageName = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    sampleWorkUrl = serializers.URLField(required=False, allow_blank=True)
    sampleWorkFile = serializers.FileField(required=False, allow_null=True)
    bio = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value

    def validate(self, attrs):
        if not attrs.get('sampleWorkUrl') and not attrs.get('sampleWorkFile'):
            raise serializers.ValidationError({'sampleWorkUrl': 'A sample-work URL or file is required.'})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        from operations.models import ArtistVerificationRequest
        stage_name = validated_data.pop('stageName')
        sample_work_url = validated_data.pop('sampleWorkUrl', '')
        sample_work_file = validated_data.pop('sampleWorkFile', None)
        user = User.objects.create_user(
            username=unique_username(stage_name),
            display_name=stage_name,
            role=User.Role.ARTIST,
            artist_status=User.ArtistStatus.PENDING,
            **validated_data,
        )
        ArtistVerificationRequest.objects.create(
            artist=user, sample_work_url=sample_work_url, sample_work_file=sample_work_file
        )
        from community.models import Notification
        for staff in User.objects.filter(role__in=[User.Role.SUPPORTER, User.Role.ADMIN], is_active=True):
            Notification.objects.create(
                user=staff,
                type=Notification.Type.ARTIST_VERIFICATION,
                message=f'New artist verification request from {user.display_name}.',
                link='/admin',
            )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs['email'].strip().lower()
        try:
            username = User.objects.only('username').get(email__iexact=email).username
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid email or password.')
        user = authenticate(request=self.context.get('request'), username=username, password=attrs['password'])
        if not user or not user.is_active:
            raise serializers.ValidationError('Invalid email or password.')
        attrs['user'] = user
        return attrs

    def create_token_payload(self):
        user = self.validated_data['user']
        from billing.services import sync_user_subscription
        sync_user_subscription(user)
        token, _ = Token.objects.get_or_create(user=user)
        context = {**self.context, 'include_private': True}
        return {'token': token.key, 'user': UserSerializer(user, context=context).data}


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    passwordConfirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['passwordConfirm']:
            raise serializers.ValidationError({'passwordConfirm': 'Passwords do not match.'})
        validate_password(attrs['password'])
        return attrs
