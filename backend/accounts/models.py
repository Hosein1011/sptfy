import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        USER = 'USER', 'Listener'
        ARTIST = 'ARTIST', 'Artist'
        SUPPORTER = 'SUPPORTER', 'Supporter'
        ADMIN = 'ADMIN', 'Administrator'

    class Tier(models.TextChoices):
        FREE = 'FREE', 'Free'
        STANDARD = 'STANDARD', 'Silver'
        GOLD = 'GOLD', 'Gold'

    class ArtistStatus(models.TextChoices):
        NOT_APPLICABLE = 'N/A', 'Not applicable'
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    class Gender(models.TextChoices):
        FEMALE = 'FEMALE', 'Female'
        MALE = 'MALE', 'Male'
        OTHER = 'OTHER', 'Other'
        UNSPECIFIED = 'UNSPECIFIED', 'Prefer not to say'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=120)
    role = models.CharField(max_length=12, choices=Role.choices, default=Role.USER)
    tier = models.CharField(max_length=12, choices=Tier.choices, default=Tier.FREE)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=Gender.choices, default=Gender.UNSPECIFIED)
    profile_image = models.ImageField(upload_to='profiles/%Y/%m/', null=True, blank=True)
    bio = models.TextField(blank=True)
    artist_status = models.CharField(
        max_length=16,
        choices=ArtistStatus.choices,
        default=ArtistStatus.NOT_APPLICABLE,
    )
    artist_rejection_reason = models.TextField(blank=True)
    following = models.ManyToManyField('self', symmetrical=False, related_name='followers', blank=True)

    REQUIRED_FIELDS = ['email', 'display_name']

    def save(self, *args, **kwargs):
        if not self.display_name:
            self.display_name = self.username or self.email.split('@')[0]
        if self.role == self.Role.ARTIST and self.artist_status == self.ArtistStatus.NOT_APPLICABLE:
            self.artist_status = self.ArtistStatus.PENDING
        super().save(*args, **kwargs)

    @property
    def is_verified_artist(self):
        return self.role == self.Role.ARTIST and self.artist_status == self.ArtistStatus.APPROVED


class UserPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    notifications_enabled = models.BooleanField(default=True)
    system_sound_enabled = models.BooleanField(default=True)
    language = models.CharField(max_length=10, default='en')
    high_quality = models.BooleanField(default=True)
    spatial_audio = models.BooleanField(default=False)
    offline_mode = models.BooleanField(default=False)
    private_session = models.BooleanField(default=False)
    data_saver = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
