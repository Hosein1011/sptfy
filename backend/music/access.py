from datetime import date

from django.db.models import Q, QuerySet

from accounts.models import User
from .models import Album, Song


def visible_songs_for(user: User, queryset: QuerySet | None = None) -> QuerySet:
    qs = queryset if queryset is not None else Song.objects.all()
    today = date.today()
    if user.role == User.Role.ADMIN:
        return qs
    if user.role == User.Role.SUPPORTER:
        return qs.filter(is_published=True)
    if user.role == User.Role.ARTIST:
        public_filter = Q(is_published=True)
        if user.tier != User.Tier.GOLD:
            public_filter &= Q(release_date__lte=today, is_gold_only=False)
        return qs.filter(public_filter | Q(primary_artist=user)).distinct()
    if user.tier == User.Tier.GOLD:
        return qs.filter(is_published=True)
    return qs.filter(is_published=True, release_date__lte=today, is_gold_only=False)


def visible_albums_for(user: User, queryset: QuerySet | None = None) -> QuerySet:
    qs = queryset if queryset is not None else Album.objects.all()
    today = date.today()
    if user.role == User.Role.ADMIN:
        return qs
    if user.role == User.Role.SUPPORTER:
        return qs.filter(is_published=True)
    if user.role == User.Role.ARTIST:
        public_filter = Q(is_published=True)
        if user.tier != User.Tier.GOLD:
            public_filter &= Q(release_date__lte=today)
        return qs.filter(public_filter | Q(primary_artist=user)).distinct()
    if user.tier == User.Tier.GOLD:
        return qs.filter(is_published=True)
    return qs.filter(is_published=True, release_date__lte=today)
