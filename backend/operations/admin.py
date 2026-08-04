from django.contrib import admin
from .models import ArtistVerificationRequest, MonthlyArtistAudit, Ticket, TicketMessage
admin.site.register(ArtistVerificationRequest)
admin.site.register(Ticket)
admin.site.register(TicketMessage)
admin.site.register(MonthlyArtistAudit)
