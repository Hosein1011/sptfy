from datetime import date
from django.urls import reverse
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User
from billing.models import SubscriptionPlan
from community.models import Notification, Playlist
from music.models import Album, Song, StreamEvent
from operations.models import ArtistVerificationRequest, MonthlyArtistAudit, Ticket


class BaseApiTest(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.free = SubscriptionPlan.objects.create(
            tier='FREE', name='Free', monthly_price=0, daily_stream_limit=60, playlist_limit=6
        )
        cls.standard = SubscriptionPlan.objects.create(
            tier='STANDARD', name='Silver', monthly_price=5, playlist_limit=100,
            can_upload_avatar=True, can_download=True,
        )
        cls.gold = SubscriptionPlan.objects.create(
            tier='GOLD', name='Gold', monthly_price=10, playlist_limit=None,
            can_upload_avatar=True, can_download=True, early_access=True, can_view_stats=True,
        )
        cls.user = User.objects.create_user(
            username='listener', email='listener@example.com', password='StrongPass123',
            display_name='Listener', role='USER', tier='FREE'
        )
        cls.artist = User.objects.create_user(
            username='artist', email='artist@example.com', password='StrongPass123',
            display_name='Artist', role='ARTIST', tier='GOLD', artist_status='APPROVED'
        )
        cls.support = User.objects.create_user(
            username='support', email='support@example.com', password='StrongPass123',
            display_name='Support', role='SUPPORTER', tier='GOLD'
        )
        cls.admin = User.objects.create_user(
            username='admin', email='admin@example.com', password='StrongPass123',
            display_name='Admin', role='ADMIN', tier='GOLD', is_staff=True
        )
        cls.album = Album.objects.create(
            title='Test Album', primary_artist=cls.artist, release_date=date(2020, 1, 1)
        )
        cls.song = Song.objects.create(
            title='Test Song', primary_artist=cls.artist, album=cls.album,
            source_url='/audio/test.mp3', duration_seconds=180,
            release_date=date(2020, 1, 1), is_published=True,
        )

    def auth(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')


class AuthenticationTests(BaseApiTest):
    def test_register_listener(self):
        response = self.client.post('/api/auth/register/', {
            'name': 'New User', 'email': 'new@example.com', 'password': 'StrongPass123',
            'passwordConfirm': 'StrongPass123', 'birthDate': '2000-01-01', 'gender': 'UNSPECIFIED',
            'acceptedPrivacy': True,
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['user']['tier'], 'FREE')

    def test_register_rejects_duplicate_email(self):
        response = self.client.post('/api/auth/register/', {
            'name': 'Duplicate', 'email': self.user.email, 'password': 'StrongPass123',
            'passwordConfirm': 'StrongPass123', 'birthDate': '2000-01-01', 'gender': 'UNSPECIFIED',
            'acceptedPrivacy': True,
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_login_returns_token_and_role(self):
        response = self.client.post('/api/auth/login/', {
            'email': self.user.email, 'password': 'StrongPass123'
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['role'], 'USER')

    def test_me_requires_authentication(self):
        self.assertEqual(self.client.get('/api/auth/me/').status_code, 401)

    def test_delete_account(self):
        self.auth(self.user)
        user_id = self.user.id
        response = self.client.delete('/api/auth/me/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(User.objects.filter(id=user_id).exists())

    def test_follow_and_unfollow(self):
        self.auth(self.user)
        follow = self.client.post(f'/api/users/{self.artist.id}/follow/')
        self.assertEqual(follow.status_code, 200)
        self.assertTrue(self.user.following.filter(pk=self.artist.pk).exists())
        unfollow = self.client.delete(f'/api/users/{self.artist.id}/unfollow/')
        self.assertEqual(unfollow.status_code, 204)


class MusicTests(BaseApiTest):
    def test_authenticated_user_can_list_songs(self):
        self.auth(self.user)
        response = self.client.get('/api/songs/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['results'][0]['title'], 'Test Song')

    def test_unverified_artist_cannot_upload(self):
        pending = User.objects.create_user(
            username='pending', email='pending@example.com', password='StrongPass123',
            display_name='Pending', role='ARTIST', tier='GOLD', artist_status='PENDING'
        )
        self.auth(pending)
        response = self.client.post('/api/songs/', {
            'title': 'Blocked', 'source_url': '/audio/blocked.mp3', 'duration': 100,
            'releaseDate': '2020-01-01', 'isGoldOnly': False,
        }, format='json')
        self.assertEqual(response.status_code, 403)

    def test_verified_artist_can_upload(self):
        self.auth(self.artist)
        response = self.client.post('/api/songs/', {
            'title': 'Uploaded', 'source_url': '/audio/uploaded.mp3', 'duration': 100,
            'releaseDate': '2020-01-01', 'isGoldOnly': False,
        }, format='json')
        self.assertEqual(response.status_code, 201)

    def test_free_stream_limit_is_enforced(self):
        self.auth(self.user)
        StreamEvent.objects.bulk_create([
            StreamEvent(user=self.user, song=self.song, listened_at=timezone.now()) for _ in range(60)
        ])
        response = self.client.post(f'/api/songs/{self.song.id}/stream/', {'secondsPlayed': 30}, format='json')
        self.assertEqual(response.status_code, 429)

    def test_gold_only_song_is_hidden_from_free_user(self):
        Song.objects.create(
            title='Gold Song', primary_artist=self.artist, source_url='/audio/gold.mp3',
            duration_seconds=120, release_date=date(2020, 1, 1), is_gold_only=True,
        )
        self.auth(self.user)
        response = self.client.get('/api/songs/?search=Gold Song')
        self.assertEqual(response.data['count'], 0)

    def test_like_and_unlike_song(self):
        self.auth(self.user)
        self.assertEqual(self.client.post(f'/api/songs/{self.song.id}/like/').status_code, 200)
        self.assertEqual(self.client.delete(f'/api/songs/{self.song.id}/unlike/').status_code, 204)


class PlaylistAndNotificationTests(BaseApiTest):
    def test_free_playlist_limit_is_six(self):
        Playlist.objects.bulk_create([Playlist(owner=self.user, name=f'P{i}') for i in range(6)])
        self.auth(self.user)
        response = self.client.post('/api/playlists/', {'name': 'Seventh'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_owner_can_add_song_to_playlist(self):
        playlist = Playlist.objects.create(owner=self.user, name='Mine')
        self.auth(self.user)
        response = self.client.post(f'/api/playlists/{playlist.id}/songs/', {'songId': str(self.song.id)}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(playlist.songs.filter(pk=self.song.pk).exists())

    def test_other_user_cannot_edit_private_playlist(self):
        playlist = Playlist.objects.create(owner=self.artist, name='Private', is_public=False)
        self.auth(self.user)
        response = self.client.post(f'/api/playlists/{playlist.id}/songs/', {'songId': str(self.song.id)}, format='json')
        self.assertEqual(response.status_code, 404)

    def test_mark_all_notifications_read(self):
        Notification.objects.create(user=self.user, message='One')
        Notification.objects.create(user=self.user, message='Two')
        self.auth(self.user)
        response = self.client.post('/api/notifications/mark_all_read/')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Notification.objects.filter(user=self.user, is_read=False).exists())


class OperationsAndBillingTests(BaseApiTest):
    def test_user_creates_ticket_with_initial_message(self):
        self.auth(self.user)
        response = self.client.post('/api/tickets/', {
            'subject': 'Help', 'initialMessage': 'I need help.'
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(response.data['messages']), 1)

    def test_support_can_answer_ticket(self):
        ticket = Ticket.objects.create(user=self.user, subject='Help')
        self.auth(self.support)
        response = self.client.post(f'/api/tickets/{ticket.id}/messages/', {'body': 'Answered'}, format='json')
        self.assertEqual(response.status_code, 201)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, 'ANSWERED')

    def test_support_can_approve_artist(self):
        pending = User.objects.create_user(
            username='pending2', email='pending2@example.com', password='StrongPass123',
            display_name='Pending Two', role='ARTIST', tier='FREE', artist_status='PENDING'
        )
        request = ArtistVerificationRequest.objects.create(artist=pending)
        self.auth(self.support)
        response = self.client.post(f'/api/artist-verifications/{request.id}/approve/')
        self.assertEqual(response.status_code, 200)
        pending.refresh_from_db()
        self.assertEqual(pending.artist_status, 'APPROVED')

    def test_paid_subscription_months_are_validated(self):
        self.auth(self.user)
        response = self.client.post('/api/payments/', {'tier': 'GOLD', 'months': 2}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_successful_sandbox_payment_updates_tier(self):
        self.auth(self.user)
        created = self.client.post('/api/payments/', {'tier': 'GOLD', 'months': 1}, format='json')
        response = self.client.post(f"/api/payments/{created.data['id']}/verify/", {'success': True}, format='json')
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.tier, 'GOLD')

    def test_listener_cannot_access_audits(self):
        MonthlyArtistAudit.objects.create(artist=self.artist, month=date(2026, 1, 1))
        self.auth(self.user)
        response = self.client.get('/api/audits/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 0)

class RequestedFeatureIntegrationTests(BaseApiTest):
    def test_home_feed_exposes_required_sections(self):
        Playlist.objects.create(owner=self.user, name='Recent')
        self.auth(self.user)
        response = self.client.get('/api/home/')
        self.assertEqual(response.status_code, 200)
        for key in ['user', 'recentPlaylists', 'latestAlbums', 'popularSongs', 'earlyAccess']:
            self.assertIn(key, response.data)

    def test_artist_registration_creates_pending_verification(self):
        response = self.client.post('/api/auth/register/artist/', {
            'stageName': 'New Artist',
            'email': 'newartist@example.com',
            'password': 'StrongPass123',
            'sampleWorkUrl': 'https://example.com/sample',
            'bio': 'Demo bio',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        artist = User.objects.get(email='newartist@example.com')
        self.assertEqual(artist.artist_status, 'PENDING')
        self.assertTrue(ArtistVerificationRequest.objects.filter(artist=artist).exists())

    def test_follow_creates_notification_for_target(self):
        self.auth(self.user)
        response = self.client.post(f'/api/users/{self.artist.id}/follow/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Notification.objects.filter(user=self.artist, type='FOLLOW').exists())

    def test_notification_can_be_deleted_individually(self):
        notification = Notification.objects.create(user=self.user, message='Delete me')
        self.auth(self.user)
        response = self.client.delete(f'/api/notifications/{notification.id}/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Notification.objects.filter(pk=notification.id).exists())

    def test_catalog_can_sort_by_listener_count(self):
        second = Song.objects.create(
            title='Popular Song', primary_artist=self.artist, source_url='/audio/popular.mp3',
            duration_seconds=120, release_date=date(2020, 1, 2), is_published=True,
        )
        other_listener = User.objects.create_user(
            username='listener2', email='listener2@example.com', password='StrongPass123',
            display_name='Listener Two', role='USER', tier='FREE'
        )
        StreamEvent.objects.create(user=self.user, song=second)
        StreamEvent.objects.create(user=other_listener, song=second)
        self.auth(self.user)
        response = self.client.get('/api/songs/?sortBy=listeners')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['results'][0]['id'], str(second.id))
