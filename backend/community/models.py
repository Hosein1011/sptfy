import uuid
from django.conf import settings
from django.db import models


class Playlist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='playlists')
    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    cover = models.ImageField(upload_to='playlist-covers/%Y/%m/', null=True, blank=True)
    is_public = models.BooleanField(default=True)
    songs = models.ManyToManyField('music.Song', through='PlaylistSong', related_name='playlists', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        constraints = [
            models.UniqueConstraint(fields=['owner', 'name'], name='unique_playlist_name_per_owner')
        ]

    def __str__(self):
        return f'{self.name} ({self.owner.display_name})'


class PlaylistSong(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name='playlist_songs')
    song = models.ForeignKey('music.Song', on_delete=models.CASCADE, related_name='playlist_entries')
    position = models.PositiveIntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'added_at']
        constraints = [
            models.UniqueConstraint(fields=['playlist', 'song'], name='unique_song_in_playlist')
        ]


class Notification(models.Model):
    class Type(models.TextChoices):
        SYSTEM = 'SYSTEM', 'System'
        FOLLOW = 'FOLLOW', 'Follow'
        RELEASE = 'RELEASE', 'Release'
        SUBSCRIPTION = 'SUBSCRIPTION', 'Subscription'
        ARTIST_VERIFICATION = 'ARTIST_VERIFICATION', 'Artist verification'
        FINANCE = 'FINANCE', 'Finance'
        TICKET = 'TICKET', 'Ticket'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=500)
    type = models.CharField(max_length=30, choices=Type.choices, default=Type.SYSTEM)
    link = models.CharField(max_length=500, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', 'is_read', 'created_at'])]


class LikedSong(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='liked_song_entries')
    song = models.ForeignKey('music.Song', on_delete=models.CASCADE, related_name='liked_by_entries')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['user', 'song'], name='unique_user_liked_song')
        ]
