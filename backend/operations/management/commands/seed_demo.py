from datetime import date
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User
from billing.models import SubscriptionPlan
from community.models import Notification, Playlist, PlaylistSong
from music.models import Album, Song
from operations.models import ArtistVerificationRequest, Ticket, TicketMessage


class Command(BaseCommand):
    help = 'Create deterministic Melora demo data and accounts.'

    @transaction.atomic
    def handle(self, *args, **options):
        plans = [
            dict(tier='FREE', name='Free', monthly_price=0, daily_stream_limit=60, playlist_limit=6,
                 can_upload_avatar=False, can_download=False, early_access=False, can_view_stats=False),
            dict(tier='STANDARD', name='Silver', monthly_price=Decimal('4.99'), daily_stream_limit=None, playlist_limit=100,
                 can_upload_avatar=True, can_download=True, early_access=False, can_view_stats=False),
            dict(tier='GOLD', name='Gold', monthly_price=Decimal('9.99'), daily_stream_limit=None, playlist_limit=None,
                 can_upload_avatar=True, can_download=True, early_access=True, can_view_stats=True),
        ]
        for data in plans:
            SubscriptionPlan.objects.update_or_create(tier=data['tier'], defaults=data)

        def user(email, name, role, tier, password, artist_status='N/A'):
            obj, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0].replace('.', '-'),
                    'display_name': name,
                    'role': role,
                    'tier': tier,
                    'artist_status': artist_status,
                    'is_staff': role in {'SUPPORTER', 'ADMIN'},
                    'is_superuser': role == 'ADMIN',
                },
            )
            obj.display_name = name
            obj.role = role
            obj.tier = tier
            obj.artist_status = artist_status
            obj.is_staff = role in {'SUPPORTER', 'ADMIN'}
            obj.is_superuser = role == 'ADMIN'
            obj.set_password(password)
            obj.save()
            return obj

        admin = user('admin@sptfy.app', 'Sptfy Admin', 'ADMIN', 'GOLD', 'Admin@12345')
        support = user('support@sptfy.app', 'Support Agent', 'SUPPORTER', 'GOLD', 'Support@12345')
        listener = user('listener@sptfy.app', 'Demo Listener', 'USER', 'FREE', 'Listener@12345')
        luna = user('artist@sptfy.app', 'Luna Echo', 'ARTIST', 'GOLD', 'Artist@12345', 'APPROVED')
        m83 = user('m83@artists.melora', 'M83', 'ARTIST', 'GOLD', 'DemoArtist@12345', 'APPROVED')
        weeknd = user('weeknd@artists.melora', 'The Weeknd', 'ARTIST', 'GOLD', 'DemoArtist@12345', 'APPROVED')
        kavinsky = user('kavinsky@artists.melora', 'Kavinsky', 'ARTIST', 'GOLD', 'DemoArtist@12345', 'APPROVED')

        for artist in [luna, m83, weeknd, kavinsky]:
            ArtistVerificationRequest.objects.update_or_create(
                artist=artist,
                defaults={'status': 'APPROVED', 'reviewed_by': admin, 'sample_work_url': 'https://example.com/demo'},
            )

        album_defs = [
            (m83, "Hurry Up, We're Dreaming", date(2011, 8, 15), 'Electronic'),
            (weeknd, 'Starboy', date(2016, 11, 25), 'R&B'),
            (weeknd, 'After Hours', date(2020, 3, 20), 'Pop'),
            (kavinsky, 'OutRun', date(2013, 2, 25), 'Synthwave'),
        ]
        albums = {}
        for artist, title, release, genre in album_defs:
            obj, _ = Album.objects.get_or_create(
                primary_artist=artist,
                title=title,
                release_date=release,
                defaults={'genre': genre, 'is_published': True},
            )
            albums[title] = obj

        song_defs = [
            ('Midnight City', m83, albums["Hurry Up, We're Dreaming"], 243, '/audio/midnightcity.mp3', date(2011, 8, 15), 'Electronic', False,
             'Waiting in a car\nWaiting for a ride in the dark\nThe night city grows\nLook at the horizon glow'),
            ('Starboy', weeknd, albums['Starboy'], 230, '/audio/starboy.mp3', date(2016, 11, 25), 'R&B', False,
             "I'm tryna put you in the worst mood\nP1 cleaner than your church shoes"),
            ('Nightcall', kavinsky, albums['OutRun'], 259, '/audio/nightcall.mp3', date(2010, 3, 15), 'Synthwave', False,
             "I'm giving you a night call to tell you how I feel\nI want to drive you through the night"),
            ('Blinding Lights', weeknd, albums['After Hours'], 200, '/audio/blindinglights.mp3', date(2019, 11, 29), 'Pop', False,
             "I've been tryna call\nI've been on my own for long enough"),
        ]
        songs = []
        for title, artist, album, duration, src, release, genre, gold, lyrics in song_defs:
            obj, _ = Song.objects.update_or_create(
                primary_artist=artist,
                title=title,
                defaults={
                    'album': album,
                    'duration_seconds': duration,
                    'source_url': src,
                    'release_date': release,
                    'genre': genre,
                    'is_gold_only': gold,
                    'is_published': True,
                    'lyrics': lyrics,
                },
            )
            songs.append(obj)

        playlist, _ = Playlist.objects.get_or_create(owner=listener, name='Midnight Drive', defaults={'is_public': True})
        for position, song_obj in enumerate(songs):
            PlaylistSong.objects.get_or_create(playlist=playlist, song=song_obj, defaults={'position': position})

        Notification.objects.get_or_create(user=listener, message='Welcome to Melora.', defaults={'type': 'SYSTEM'})
        Notification.objects.get_or_create(user=luna, message='Your artist account has been approved.', defaults={'type': 'ARTIST_VERIFICATION'})

        ticket, _ = Ticket.objects.get_or_create(user=listener, subject='Demo playback question')
        TicketMessage.objects.get_or_create(ticket=ticket, sender=listener, body='How can I change playback quality?')

        self.stdout.write(self.style.SUCCESS('Demo data created.'))
        self.stdout.write('Admin: admin@sptfy.app / Admin@12345')
        self.stdout.write('Support: support@sptfy.app / Support@12345')
        self.stdout.write('Artist: artist@sptfy.app / Artist@12345')
        self.stdout.write('Listener: listener@sptfy.app / Listener@12345')
