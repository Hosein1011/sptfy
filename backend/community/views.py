from django.db import transaction
from django.db.models import Max, Q
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from accounts.models import User
from billing.models import SubscriptionPlan
from music.access import visible_songs_for
from music.models import Song
from .models import Notification, Playlist, PlaylistSong
from .permissions import IsPlaylistOwnerOrReadOnly
from .serializers import NotificationSerializer, PlaylistSerializer


class PlaylistViewSet(viewsets.ModelViewSet):
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated, IsPlaylistOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    search_fields = ['name', 'description', 'owner__display_name']
    ordering_fields = ['created_at', 'updated_at', 'name']

    def get_queryset(self):
        user = self.request.user
        qs = Playlist.objects.select_related('owner').prefetch_related('playlist_songs__song__primary_artist', 'playlist_songs__song__album')
        owner = self.request.query_params.get('owner')
        if owner:
            qs = qs.filter(owner_id=owner)
        if user.role in {User.Role.SUPPORTER, User.Role.ADMIN}:
            return qs
        return qs.filter(Q(is_public=True) | Q(owner=user)).distinct()

    def perform_create(self, serializer):
        user = self.request.user
        plan = SubscriptionPlan.objects.filter(tier=user.tier, is_active=True).first()
        limit = plan.playlist_limit if plan else ({User.Tier.FREE: 6, User.Tier.STANDARD: 100}.get(user.tier))
        if limit is not None and Playlist.objects.filter(owner=user).count() >= limit:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'name': f'{user.tier} tier is limited to {limit} playlists.'})
        serializer.save()

    @action(detail=True, methods=['post'], url_path='songs')
    @transaction.atomic
    def add_song(self, request, pk=None):
        playlist = self.get_object()
        if playlist.owner_id != request.user.id and request.user.role != User.Role.ADMIN:
            return Response({'detail': 'Only the owner can edit this playlist.'}, status=status.HTTP_403_FORBIDDEN)
        song_id = request.data.get('songId')
        song = visible_songs_for(request.user, Song.objects.filter(pk=song_id)).first()
        if not song:
            return Response({'detail': 'Song not found.'}, status=status.HTTP_404_NOT_FOUND)
        position = (playlist.playlist_songs.aggregate(max_pos=Max('position'))['max_pos'] or -1) + 1
        entry, created = PlaylistSong.objects.get_or_create(playlist=playlist, song=song, defaults={'position': position})
        code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(PlaylistSerializer(playlist, context={'request': request}).data, status=code)

    @action(detail=True, methods=['delete'], url_path=r'songs/(?P<song_id>[^/.]+)')
    def remove_song(self, request, pk=None, song_id=None):
        playlist = self.get_object()
        if playlist.owner_id != request.user.id and request.user.role != User.Role.ADMIN:
            return Response({'detail': 'Only the owner can edit this playlist.'}, status=status.HTTP_403_FORBIDDEN)
        PlaylistSong.objects.filter(playlist=playlist, song_id=song_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    serializer_class = NotificationSerializer
    search_fields = ['message', 'type']
    ordering_fields = ['created_at', 'is_read']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        count = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'updated': count})

    def destroy(self, request, *args, **kwargs):
        notification = self.get_object()
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        count, _ = self.get_queryset().delete()
        return Response({'deleted': count})
