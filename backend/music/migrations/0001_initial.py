import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Album',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('cover', models.ImageField(blank=True, null=True, upload_to='album-covers/%Y/%m/')),
                ('genre', models.CharField(blank=True, max_length=80)),
                ('release_date', models.DateField()),
                ('is_published', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('collaborators', models.ManyToManyField(blank=True, related_name='collaborative_albums', to=settings.AUTH_USER_MODEL)),
                ('primary_artist', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='albums', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-release_date', '-created_at']},
        ),
        migrations.CreateModel(
            name='Song',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('audio_file', models.FileField(blank=True, null=True, upload_to='audio/%Y/%m/')),
                ('source_url', models.CharField(blank=True, max_length=500)),
                ('cover', models.ImageField(blank=True, null=True, upload_to='song-covers/%Y/%m/')),
                ('duration_seconds', models.PositiveIntegerField(default=0)),
                ('lyrics', models.TextField(blank=True)),
                ('genre', models.CharField(blank=True, max_length=80)),
                ('release_date', models.DateField()),
                ('is_published', models.BooleanField(default=True)),
                ('is_gold_only', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('album', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='songs', to='music.album')),
                ('collaborators', models.ManyToManyField(blank=True, related_name='collaborative_songs', to=settings.AUTH_USER_MODEL)),
                ('primary_artist', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='songs', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-release_date', '-created_at']},
        ),
        migrations.CreateModel(
            name='StreamEvent',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('listened_at', models.DateTimeField(auto_now_add=True)),
                ('seconds_played', models.PositiveIntegerField(default=0)),
                ('song', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stream_events', to='music.song')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stream_events', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-listened_at']},
        ),
        migrations.AddConstraint(
            model_name='album',
            constraint=models.UniqueConstraint(fields=('primary_artist', 'title', 'release_date'), name='unique_artist_album_release'),
        ),
        migrations.AddIndex(model_name='song', index=models.Index(fields=['title'], name='music_song_title_idx')),
        migrations.AddIndex(model_name='song', index=models.Index(fields=['release_date', 'is_published'], name='music_song_release_idx')),
        migrations.AddIndex(model_name='streamevent', index=models.Index(fields=['user', 'listened_at'], name='music_stream_user_idx')),
        migrations.AddIndex(model_name='streamevent', index=models.Index(fields=['song', 'listened_at'], name='music_stream_song_idx')),
    ]
