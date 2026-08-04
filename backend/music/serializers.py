from django.db.models import Count
from rest_framework import serializers
from accounts.models import User
from .models import Album, Song, StreamEvent


class SongSerializer(serializers.ModelSerializer):
    artistId = serializers.UUIDField(source='primary_artist_id', read_only=True)
    artistName = serializers.CharField(source='primary_artist.display_name', read_only=True)
    albumId = serializers.UUIDField(source='album_id', read_only=True, allow_null=True)
    albumTitle = serializers.CharField(source='album.title', read_only=True, allow_null=True)
    duration = serializers.IntegerField(source='duration_seconds')
    src = serializers.SerializerMethodField()
    listeners = serializers.SerializerMethodField()
    streams = serializers.SerializerMethodField()
    releaseDate = serializers.DateField(source='release_date')
    isGoldOnly = serializers.BooleanField(source='is_gold_only')
    coverUrl = serializers.SerializerMethodField()
    isLiked = serializers.SerializerMethodField()
    collaboratorIds = serializers.PrimaryKeyRelatedField(
        source='collaborators', many=True, queryset=User.objects.filter(role=User.Role.ARTIST), required=False
    )

    class Meta:
        model = Song
        fields = [
            'id', 'title', 'artistId', 'artistName', 'albumId', 'albumTitle',
            'duration', 'src', 'listeners', 'streams', 'releaseDate', 'isGoldOnly',
            'lyrics', 'genre', 'coverUrl', 'isLiked', 'is_published', 'audio_file',
            'source_url', 'album', 'collaboratorIds',
        ]
        extra_kwargs = {
            'audio_file': {'write_only': True, 'required': False},
            'source_url': {'write_only': True, 'required': False},
            'album': {'write_only': True, 'required': False, 'allow_null': True},
            'is_published': {'required': False},
        }

    def validate(self, attrs):
        if not self.instance and not attrs.get('audio_file') and not attrs.get('source_url'):
            raise serializers.ValidationError('Either audio_file or source_url is required.')
        album = attrs.get('album')
        request = self.context.get('request')
        if album and request and request.user.role == User.Role.ARTIST and album.primary_artist_id != request.user.id:
            raise serializers.ValidationError({'album': 'You can only add songs to your own albums.'})
        return attrs

    def get_src(self, obj):
        request = self.context.get('request')
        if obj.audio_file:
            return request.build_absolute_uri(obj.audio_file.url) if request else obj.audio_file.url
        return obj.source_url

    def get_coverUrl(self, obj):
        image = obj.cover or (obj.album.cover if obj.album and obj.album.cover else None)
        if not image:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(image.url) if request else image.url

    def _can_view_stats(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return (
            request.user.tier == User.Tier.GOLD
            or request.user.role in {User.Role.SUPPORTER, User.Role.ADMIN}
            or obj.primary_artist_id == request.user.id
        )

    def get_listeners(self, obj):
        if not self._can_view_stats(obj):
            return None
        if hasattr(obj, '_listener_count'):
            return obj._listener_count
        return obj.stream_events.values('user_id').distinct().count()

    def get_streams(self, obj):
        if not self._can_view_stats(obj):
            return None
        if hasattr(obj, '_stream_count'):
            return obj._stream_count
        return obj.stream_events.count()

    def get_isLiked(self, obj):
        request = self.context.get('request')
        if not (request and request.user.is_authenticated):
            return False
        from community.models import LikedSong
        return LikedSong.objects.filter(user=request.user, song=obj).exists()

    def create(self, validated_data):
        collaborators = validated_data.pop('collaborators', [])
        song = Song.objects.create(primary_artist=self.context['request'].user, **validated_data)
        song.collaborators.set(collaborators)
        return song

    def update(self, instance, validated_data):
        collaborators = validated_data.pop('collaborators', None)
        instance = super().update(instance, validated_data)
        if collaborators is not None:
            instance.collaborators.set(collaborators)
        return instance


class SongCompactSerializer(SongSerializer):
    class Meta(SongSerializer.Meta):
        fields = [
            'id', 'title', 'artistId', 'artistName', 'albumId', 'albumTitle',
            'duration', 'src', 'listeners', 'streams', 'releaseDate', 'isGoldOnly',
            'lyrics', 'genre', 'coverUrl', 'isLiked',
        ]


class AlbumSerializer(serializers.ModelSerializer):
    artistId = serializers.UUIDField(source='primary_artist_id', read_only=True)
    artistName = serializers.CharField(source='primary_artist.display_name', read_only=True)
    releaseDate = serializers.DateField(source='release_date')
    coverUrl = serializers.SerializerMethodField()
    songCount = serializers.SerializerMethodField()
    totalDuration = serializers.SerializerMethodField()
    tracks = serializers.SerializerMethodField()
    collaboratorIds = serializers.PrimaryKeyRelatedField(
        source='collaborators', many=True, queryset=User.objects.filter(role=User.Role.ARTIST), required=False
    )

    class Meta:
        model = Album
        fields = [
            'id', 'title', 'artistId', 'artistName', 'releaseDate', 'genre',
            'coverUrl', 'songCount', 'totalDuration', 'tracks', 'cover',
            'is_published', 'collaboratorIds',
        ]
        extra_kwargs = {'cover': {'write_only': True, 'required': False}}

    def get_coverUrl(self, obj):
        if not obj.cover:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.cover.url) if request else obj.cover.url

    def _visible_tracks(self, obj):
        request = self.context.get('request')
        qs = obj.songs.select_related('primary_artist', 'album').prefetch_related('collaborators')
        if not request or not request.user.is_authenticated:
            return qs.none()
        from .access import visible_songs_for
        return visible_songs_for(request.user, qs)

    def get_songCount(self, obj):
        return self._visible_tracks(obj).count()

    def get_totalDuration(self, obj):
        return sum(self._visible_tracks(obj).values_list('duration_seconds', flat=True))

    def get_tracks(self, obj):
        return SongCompactSerializer(self._visible_tracks(obj), many=True, context=self.context).data

    def create(self, validated_data):
        collaborators = validated_data.pop('collaborators', [])
        album = Album.objects.create(primary_artist=self.context['request'].user, **validated_data)
        album.collaborators.set(collaborators)
        return album

    def update(self, instance, validated_data):
        collaborators = validated_data.pop('collaborators', None)
        instance = super().update(instance, validated_data)
        if collaborators is not None:
            instance.collaborators.set(collaborators)
        return instance
