import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('music', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('message', models.CharField(max_length=500)),
                ('type', models.CharField(choices=[('SYSTEM', 'System'), ('FOLLOW', 'Follow'), ('RELEASE', 'Release'), ('SUBSCRIPTION', 'Subscription'), ('ARTIST_VERIFICATION', 'Artist verification'), ('FINANCE', 'Finance'), ('TICKET', 'Ticket')], default='SYSTEM', max_length=30)),
                ('link', models.CharField(blank=True, max_length=500)),
                ('is_read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='Playlist',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=160)),
                ('description', models.TextField(blank=True)),
                ('cover', models.ImageField(blank=True, null=True, upload_to='playlist-covers/%Y/%m/')),
                ('is_public', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='playlists', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-updated_at']},
        ),
        migrations.CreateModel(
            name='LikedSong',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('song', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='liked_by_entries', to='music.song')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='liked_song_entries', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='PlaylistSong',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('position', models.PositiveIntegerField(default=0)),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('playlist', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='playlist_songs', to='community.playlist')),
                ('song', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='playlist_entries', to='music.song')),
            ],
            options={'ordering': ['position', 'added_at']},
        ),
        migrations.AddField(
            model_name='playlist',
            name='songs',
            field=models.ManyToManyField(blank=True, related_name='playlists', through='community.PlaylistSong', to='music.song'),
        ),
        migrations.AddConstraint(model_name='playlist', constraint=models.UniqueConstraint(fields=('owner', 'name'), name='unique_playlist_name_per_owner')),
        migrations.AddConstraint(model_name='playlistsong', constraint=models.UniqueConstraint(fields=('playlist', 'song'), name='unique_song_in_playlist')),
        migrations.AddConstraint(model_name='likedsong', constraint=models.UniqueConstraint(fields=('user', 'song'), name='unique_user_liked_song')),
        migrations.AddIndex(model_name='notification', index=models.Index(fields=['user', 'is_read', 'created_at'], name='community_notif_idx')),
    ]
