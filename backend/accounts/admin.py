from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserPreference

@admin.register(User)
class MeloraUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + ((
        'Melora',
        {'fields': ('display_name', 'role', 'tier', 'birth_date', 'gender', 'profile_image', 'bio', 'artist_status', 'artist_rejection_reason')},
    ),)
    list_display = ('username', 'email', 'display_name', 'role', 'tier', 'artist_status', 'is_active')
    list_filter = ('role', 'tier', 'artist_status', 'is_active')

admin.site.register(UserPreference)
