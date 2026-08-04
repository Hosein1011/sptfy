from django.db.models.signals import post_save
from django.dispatch import receiver

from community.models import Notification
from .models import Song


@receiver(post_save, sender=Song)
def notify_followers_about_release(sender, instance, created, **kwargs):
    if not created or not instance.is_published:
        return
    notifications = [
        Notification(
            user=follower,
            type=Notification.Type.RELEASE,
            message=f'{instance.primary_artist.display_name} released “{instance.title}”.',
            link=f'/songs/{instance.pk}',
        )
        for follower in instance.primary_artist.followers.filter(is_active=True)
    ]
    Notification.objects.bulk_create(notifications)
