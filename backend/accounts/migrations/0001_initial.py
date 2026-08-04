# Generated for the Melora course project.
import uuid

import django.contrib.auth.models
import django.contrib.auth.validators
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('display_name', models.CharField(max_length=120)),
                ('role', models.CharField(choices=[('USER', 'Listener'), ('ARTIST', 'Artist'), ('SUPPORTER', 'Supporter'), ('ADMIN', 'Administrator')], default='USER', max_length=12)),
                ('tier', models.CharField(choices=[('FREE', 'Free'), ('STANDARD', 'Silver'), ('GOLD', 'Gold')], default='FREE', max_length=12)),
                ('birth_date', models.DateField(blank=True, null=True)),
                ('gender', models.CharField(choices=[('FEMALE', 'Female'), ('MALE', 'Male'), ('OTHER', 'Other'), ('UNSPECIFIED', 'Prefer not to say')], default='UNSPECIFIED', max_length=20)),
                ('profile_image', models.ImageField(blank=True, null=True, upload_to='profiles/%Y/%m/')),
                ('bio', models.TextField(blank=True)),
                ('artist_status', models.CharField(choices=[('N/A', 'Not applicable'), ('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')], default='N/A', max_length=16)),
                ('artist_rejection_reason', models.TextField(blank=True)),
                ('following', models.ManyToManyField(blank=True, related_name='followers', symmetrical=False, to='accounts.user')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='UserPreference',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notifications_enabled', models.BooleanField(default=True)),
                ('system_sound_enabled', models.BooleanField(default=True)),
                ('language', models.CharField(default='en', max_length=10)),
                ('high_quality', models.BooleanField(default=True)),
                ('spatial_audio', models.BooleanField(default=False)),
                ('offline_mode', models.BooleanField(default=False)),
                ('private_session', models.BooleanField(default=False)),
                ('data_saver', models.BooleanField(default=False)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='preferences', to='accounts.user')),
            ],
        ),
    ]
