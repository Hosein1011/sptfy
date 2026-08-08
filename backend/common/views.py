from datetime import date

from django.db.models import Count, Max
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    return Response({'status': 'ok', 'service': 'melora-backend'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def home(request):
    from accounts.serializers import UserSerializer
    from community.models import Playlist
    from community.serializers import PlaylistSerializer
    from music.access import visible_albums_for, visible_songs_for
    from music.models import Album, Song
    from music.serializers import AlbumSerializer, SongCompactSerializer

    user = request.user
    song_base = Song.objects.select_related('primary_artist', 'album').prefetch_related('collaborators').annotate(
        _stream_count=Count('stream_events', distinct=False),
        _listener_count=Count('stream_events__user', distinct=True),
    )
    album_base = Album.objects.select_related('primary_artist').prefetch_related('collaborators', 'songs__primary_artist')

    popular_songs = visible_songs_for(user, song_base).order_by('-_listener_count', '-_stream_count', '-release_date')[:10]
    latest_albums = visible_albums_for(user, album_base).order_by('-release_date', '-created_at')[:8]

    listened_playlists = list(
        Playlist.objects.filter(owner=user, songs__stream_events__user=user)
        .annotate(last_played=Max('songs__stream_events__listened_at'))
        .order_by('-last_played')
        .distinct()[:6]
    )
    if len(listened_playlists) < 6:
        existing_ids = [playlist.pk for playlist in listened_playlists]
        filler = (
            Playlist.objects.filter(owner=user)
            .exclude(pk__in=existing_ids)
            .order_by('-updated_at')[: 6 - len(listened_playlists)]
        )
        listened_playlists.extend(list(filler))

    early_access = []
    if user.tier == 'GOLD':
        early_access = list(
            visible_songs_for(user, song_base)
            .filter(release_date__gt=date.today(), is_published=True)
            .order_by('release_date')[:8]
        )

    context = {'request': request}
    return Response({
        'user': UserSerializer(user, context=context).data,
        'recentPlaylists': PlaylistSerializer(listened_playlists, many=True, context=context).data,
        'latestAlbums': AlbumSerializer(latest_albums, many=True, context=context).data,
        'popularSongs': SongCompactSerializer(popular_songs, many=True, context=context).data,
        'earlyAccess': SongCompactSerializer(early_access, many=True, context=context).data,
    })
