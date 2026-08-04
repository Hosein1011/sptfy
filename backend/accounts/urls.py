from django.urls import path
from .views import (
    ArtistRegisterView, LoginView, LogoutView, MeView,
    PasswordResetConfirmView, PasswordResetRequestView, PreferenceView, RegisterView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('register/artist/', ArtistRegisterView.as_view(), name='artist-register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('preferences/', PreferenceView.as_view(), name='preferences'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
