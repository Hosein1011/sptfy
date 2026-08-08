from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from accounts.views import UserViewSet
from billing.views import PaymentTransactionViewSet, SubscriptionPlanViewSet, SubscriptionViewSet
from community.views import NotificationViewSet, PlaylistViewSet
from music.views import AlbumViewSet, SongViewSet
from operations.views import ArtistVerificationViewSet, MonthlyAuditViewSet, TicketViewSet
from common.views import home

router = DefaultRouter()
router.register('users', UserViewSet, basename='user')
router.register('albums', AlbumViewSet, basename='album')
router.register('songs', SongViewSet, basename='song')
router.register('playlists', PlaylistViewSet, basename='playlist')
router.register('notifications', NotificationViewSet, basename='notification')
router.register('tickets', TicketViewSet, basename='ticket')
router.register('artist-verifications', ArtistVerificationViewSet, basename='artist-verification')
router.register('audits', MonthlyAuditViewSet, basename='audit')
router.register('subscription-plans', SubscriptionPlanViewSet, basename='subscription-plan')
router.register('subscriptions', SubscriptionViewSet, basename='subscription')
router.register('payments', PaymentTransactionViewSet, basename='payment')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/reports/', include('operations.report_urls')),
    path('api/home/', home, name='home'),
    path('api/', include(router.urls)),
    path('api/health/', include('common.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
