from django.contrib import admin
from .models import LikedSong, Notification, Playlist, PlaylistSong
admin.site.register(Playlist)
admin.site.register(PlaylistSong)
admin.site.register(Notification)

admin.site.register(LikedSong)
