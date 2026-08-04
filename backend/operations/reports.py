from datetime import date
from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from billing.models import PaymentTransaction, SubscriptionPlan
from community.models import Notification, Playlist
from music.access import visible_albums_for, visible_songs_for
from music.models import Album, Song, StreamEvent
from music.serializers import AlbumSerializer, SongCompactSerializer
from community.serializers import PlaylistSerializer
from .models import ArtistVerificationRequest, MonthlyArtistAudit, Ticket
from .serializers import ArtistVerificationSerializer, MonthlyAuditSerializer, TicketSerializer


class HomeReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        songs = Song.objects.select_related('primary_artist', 'album').annotate(
            _stream_count=Count('stream_events'),
            _listener_count=Count('stream_events__user', distinct=True),
        )
        songs = visible_songs_for(request.user, songs)
        trending = songs.order_by('-_stream_count', '-release_date')[:10]
        albums = Album.objects.select_related('primary_artist').prefetch_related('songs__primary_artist')
        albums = visible_albums_for(request.user, albums)
        latest_albums = albums.filter(release_date__lte=date.today())[:10]
        early_access_albums = albums.filter(release_date__gt=date.today())[:10] if request.user.tier == User.Tier.GOLD else albums.none()
        recent_playlists = Playlist.objects.filter(is_public=True).select_related('owner').prefetch_related('playlist_songs__song__primary_artist')[:6]
        return Response({
            'user': {'name': request.user.display_name, 'tier': request.user.tier},
            'trendingSongs': SongCompactSerializer(trending, many=True, context={'request': request}).data,
            'latestAlbums': AlbumSerializer(latest_albums, many=True, context={'request': request}).data,
            'earlyAccessAlbums': AlbumSerializer(early_access_albums, many=True, context={'request': request}).data,
            'recentPlaylists': PlaylistSerializer(recent_playlists, many=True, context={'request': request}).data,
            'unreadNotifications': Notification.objects.filter(user=request.user, is_read=False).count(),
        })


class ArtistReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.ARTIST:
            return Response({'detail': 'Artist role required.'}, status=403)
        songs = Song.objects.filter(primary_artist=request.user).annotate(
            _stream_count=Count('stream_events'),
            _listener_count=Count('stream_events__user', distinct=True),
        ).select_related('primary_artist', 'album')
        totals = StreamEvent.objects.filter(song__primary_artist=request.user).aggregate(
            totalStreams=Count('id'),
            uniqueListeners=Count('user_id', distinct=True),
        )
        audits = MonthlyArtistAudit.objects.filter(artist=request.user)[:12]
        return Response({
            'verificationStatus': request.user.artist_status,
            'totals': totals,
            'songs': SongCompactSerializer(songs, many=True, context={'request': request}).data,
            'audits': MonthlyAuditSerializer(audits, many=True).data,
        })


class StaffReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in {User.Role.SUPPORTER, User.Role.ADMIN}:
            return Response({'detail': 'Support or admin role required.'}, status=403)
        data = {
            'openTickets': Ticket.objects.exclude(status=Ticket.Status.CLOSED).count(),
            'pendingArtists': ArtistVerificationRequest.objects.filter(status=ArtistVerificationRequest.Status.PENDING).count(),
            'tickets': TicketSerializer(Ticket.objects.select_related('user', 'assigned_to').prefetch_related('messages__sender')[:10], many=True, context={'request': request}).data,
            'artistRequests': ArtistVerificationSerializer(ArtistVerificationRequest.objects.filter(status=ArtistVerificationRequest.Status.PENDING).select_related('artist')[:10], many=True, context={'request': request}).data,
        }
        if request.user.role == User.Role.ADMIN:
            current_month = timezone.localdate().replace(day=1)
            data.update({
                'users': User.objects.filter(is_active=True).count(),
                'artists': User.objects.filter(role=User.Role.ARTIST, artist_status=User.ArtistStatus.APPROVED).count(),
                'subscriptionDistribution': list(User.objects.values('tier').annotate(count=Count('id')).order_by('tier')),
                'monthlySubscriptionRevenue': PaymentTransaction.objects.filter(status=PaymentTransaction.Status.SUCCESS, verified_at__date__gte=current_month).aggregate(total=Sum('amount'))['total'] or 0,
                'plans': list(SubscriptionPlan.objects.values('tier', 'name', 'monthly_price')),
                'pendingAudits': MonthlyArtistAudit.objects.filter(payment_status=MonthlyArtistAudit.PaymentStatus.PENDING).count(),
            })
        return Response(data)
