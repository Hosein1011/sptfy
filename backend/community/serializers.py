from rest_framework import serializers
from music.models import Song
from music.serializers import SongCompactSerializer
from .models import Notification, Playlist, PlaylistSong


class PlaylistSerializer(serializers.ModelSerializer):
    ownerId = serializers.UUIDField(source='owner_id', read_only=True)
    ownerName = serializers.CharField(source='owner.display_name', read_only=True)
    songIds = serializers.SerializerMethodField()
    tracks = serializers.SerializerMethodField()
    trackCount = serializers.SerializerMethodField()
    coverUrl = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Playlist
        fields = [
            'id', 'name', 'description', 'ownerId', 'ownerName', 'songIds', 'tracks',
            'trackCount', 'cover', 'coverUrl', 'is_public', 'createdAt', 'updatedAt',
        ]
        extra_kwargs = {'cover': {'write_only': True, 'required': False}}

    def _visible_songs(self, obj):
        request = self.context.get('request')
        songs = Song.objects.filter(playlist_entries__playlist=obj).select_related('primary_artist', 'album')
        if not request or not request.user.is_authenticated:
            return songs.none()
        from music.access import visible_songs_for
        return visible_songs_for(request.user, songs).order_by('playlist_entries__position', 'playlist_entries__added_at')

    def get_songIds(self, obj):
        return [str(pk) for pk in self._visible_songs(obj).values_list('pk', flat=True)]

    def get_tracks(self, obj):
        return SongCompactSerializer(self._visible_songs(obj), many=True, context=self.context).data

    def get_trackCount(self, obj):
        return self._visible_songs(obj).count()

    def get_coverUrl(self, obj):
        if not obj.cover:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.cover.url) if request else obj.cover.url

    def create(self, validated_data):
        return Playlist.objects.create(owner=self.context['request'].user, **validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    userId = serializers.UUIDField(source='user_id', read_only=True)
    isRead = serializers.BooleanField(source='is_read')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'userId', 'message', 'type', 'link', 'isRead', 'createdAt']
        read_only_fields = ['id', 'userId', 'message', 'type', 'link', 'createdAt']
