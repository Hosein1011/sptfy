from django.contrib import admin
from .models import Album, Song, StreamEvent

@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ('title', 'primary_artist', 'release_date', 'is_published')
    search_fields = ('title', 'primary_artist__display_name')
    list_filter = ('is_published', 'release_date', 'genre')

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('title', 'primary_artist', 'album', 'release_date', 'is_published', 'is_gold_only')
    search_fields = ('title', 'primary_artist__display_name', 'album__title')
    list_filter = ('is_published', 'is_gold_only', 'genre', 'release_date')

admin.site.register(StreamEvent)
