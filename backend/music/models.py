import uuid
from django.conf import settings
from django.db import models
from .validators import validate_image_size, validate_audio_size, valid_image_extensions, valid_audio_extensions

class Album(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    primary_artist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='albums')
    collaborators = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='collaborative_albums', blank=True)
    cover = models.ImageField(
        upload_to='album-covers/%Y/%m/', 
        null=True, 
        blank=True,
        validators=[validate_image_size, valid_image_extensions]
    )
    genre = models.CharField(max_length=80, blank=True)
    release_date = models.DateField()
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-release_date', '-created_at']
        constraints = [
            models.UniqueConstraint(fields=['primary_artist', 'title', 'release_date'], name='unique_artist_album_release')
        ]

    def __str__(self):
        return f'{self.title} — {self.primary_artist.display_name}'


class Song(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    primary_artist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='songs')
    collaborators = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='collaborative_songs', blank=True)
    album = models.ForeignKey(Album, on_delete=models.SET_NULL, null=True, blank=True, related_name='songs')
    audio_file = models.FileField(
        upload_to='audio/%Y/%m/', 
        null=True, 
        blank=True,
        validators=[validate_audio_size, valid_audio_extensions]
    )
    source_url = models.CharField(max_length=500, blank=True)
    cover = models.ImageField(
        upload_to='song-covers/%Y/%m/', 
        null=True, 
        blank=True,
        validators=[validate_image_size, valid_image_extensions]
    )
    duration_seconds = models.PositiveIntegerField(default=0)
    lyrics = models.TextField(blank=True)
    genre = models.CharField(max_length=80, blank=True)
    release_date = models.DateField()
    is_published = models.BooleanField(default=True)
    is_gold_only = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-release_date', '-created_at']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['release_date', 'is_published']),
        ]

    def __str__(self):
        return f'{self.title} — {self.primary_artist.display_name}'


class StreamEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='stream_events')
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='stream_events')
    listened_at = models.DateTimeField(auto_now_add=True)
    seconds_played = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-listened_at']
        indexes = [
            models.Index(fields=['user', 'listened_at']),
            models.Index(fields=['song', 'listened_at']),
        ]
