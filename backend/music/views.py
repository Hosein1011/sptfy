from datetime import date
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from accounts.models import User
from billing.models import SubscriptionPlan
from .access import visible_albums_for, visible_songs_for
from .models import Album, Song, StreamEvent
from .permissions import IsVerifiedArtistOrReadOnly
from .serializers import AlbumSerializer, SongSerializer


class AlbumViewSet(viewsets.ModelViewSet):
    serializer_class = AlbumSerializer
    permission_classes = [IsVerifiedArtistOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    search_fields = ['title', 'primary_artist__display_name', 'genre']
    ordering_fields = ['release_date', 'title', 'created_at']

    def get_queryset(self):
        user = self.request.user
        qs = Album.objects.select_related('primary_artist').prefetch_related('collaborators', 'songs__primary_artist')
        return visible_albums_for(user, qs)


class SongViewSet(viewsets.ModelViewSet):
    serializer_class = SongSerializer
    permission_classes = [IsVerifiedArtistOrReadOnly]

    def get_permissions(self):
        if self.action in {'stream', 'download', 'like', 'unlike'}:
            return [IsAuthenticated()]
        return super().get_permissions()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    search_fields = ['title', 'primary_artist__display_name', 'album__title', 'genre']
    ordering_fields = ['release_date', '_stream_count', '_listener_count', 'title']

    def get_queryset(self):
        user = self.request.user
        qs = Song.objects.select_related('primary_artist', 'album').prefetch_related('collaborators').annotate(
            _stream_count=Count('stream_events', distinct=False),
            _listener_count=Count('stream_events__user', distinct=True),
        )
        artist = self.request.query_params.get('artist')
        album = self.request.query_params.get('album')
        if artist:
            qs = qs.filter(Q(primary_artist_id=artist) | Q(collaborators__id=artist))
        if album:
            qs = qs.filter(album_id=album)
        sort_by = self.request.query_params.get('sortBy')
        if sort_by == 'listeners':
            qs = qs.order_by('-_listener_count', '-release_date')
        elif sort_by == 'releaseDate':
            qs = qs.order_by('-release_date')

        return visible_songs_for(user, qs).distinct()

    @action(detail=True, methods=['post'])
    def stream(self, request, pk=None):
        song = get_object_or_404(Song.objects.select_related('primary_artist', 'album'), pk=pk, is_published=True)
        user = request.user
        if song.is_gold_only and user.tier != User.Tier.GOLD:
            return Response({'detail': 'Gold subscription is required for this song.'}, status=status.HTTP_403_FORBIDDEN)
        if song.release_date > date.today() and user.tier != User.Tier.GOLD:
            return Response({'detail': 'This song is available through Gold early access only.'}, status=status.HTTP_403_FORBIDDEN)

        plan = SubscriptionPlan.objects.filter(tier=user.tier, is_active=True).first()
        daily_limit = plan.daily_stream_limit if plan else (60 if user.tier == User.Tier.FREE else None)
        today = timezone.localdate()
        used = StreamEvent.objects.filter(user=user, listened_at__date=today).count()
        if daily_limit is not None and used >= daily_limit:
            return Response(
                {'detail': 'Daily stream limit reached.', 'limit': daily_limit, 'used': used},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        seconds = max(0, int(request.data.get('secondsPlayed', 0) or 0))
        event = StreamEvent.objects.create(user=user, song=song, seconds_played=seconds)
        return Response({'streamId': str(event.id), 'remaining': None if daily_limit is None else max(0, daily_limit - used - 1)}, status=status.HTTP_201_CREATED)


    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        song = self.get_object()
        if request.user.tier not in {User.Tier.STANDARD, User.Tier.GOLD} and request.user.role != User.Role.ADMIN:
            return Response({'detail': 'A Silver or Gold subscription is required to download songs.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(song)
        return Response({'songId': str(song.id), 'downloadUrl': serializer.data['src']})

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        song = self.get_object()
        from community.models import LikedSong
        LikedSong.objects.get_or_create(user=request.user, song=song)
        return Response({'liked': True})

    @action(detail=True, methods=['delete'])
    def unlike(self, request, pk=None):
        song = self.get_object()
        from community.models import LikedSong
        LikedSong.objects.filter(user=request.user, song=song).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
