from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from community.models import Notification
from .models import Song


@receiver(pre_save, sender=Song)
def remember_previous_publish_state(sender, instance, **kwargs):
    if not instance.pk:
        instance._was_published = False
        return
    instance._was_published = bool(
        Song.objects.filter(pk=instance.pk).values_list('is_published', flat=True).first()
    )


@receiver(post_save, sender=Song)
def notify_followers_about_release(sender, instance, created, **kwargs):
    # Notify once when a track first becomes published, whether it is created
    # as published or an existing draft is published later.
    became_published = instance.is_published and (created or not getattr(instance, '_was_published', False))
    if not became_published:
        return

    followers = instance.primary_artist.followers.filter(is_active=True)
    existing_users = set(
        Notification.objects.filter(
            user__in=followers,
            type=Notification.Type.RELEASE,
            link=f'/songs/{instance.pk}',
        ).values_list('user_id', flat=True)
    )
    notifications = [
        Notification(
            user=follower,
            type=Notification.Type.RELEASE,
            message=f'{instance.primary_artist.display_name} released “{instance.title}”.',
            link=f'/songs/{instance.pk}',
        )
        for follower in followers
        if follower.pk not in existing_users
    ]
    Notification.objects.bulk_create(notifications)
