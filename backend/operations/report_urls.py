from django.urls import path
from .reports import ArtistReportView, HomeReportView, StaffReportView

urlpatterns = [
    path('home/', HomeReportView.as_view(), name='home-report'),
    path('artist/', ArtistReportView.as_view(), name='artist-report'),
    path('staff/', StaffReportView.as_view(), name='staff-report'),
]
