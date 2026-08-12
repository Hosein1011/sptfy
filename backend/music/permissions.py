# backend/music/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsVerifiedArtistOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        
        user = request.user
        return user.is_authenticated and (
            user.role == 'ADMIN' or
            (user.role == 'ARTIST' and getattr(user, 'is_verified_artist', False))
        )

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        
        user = request.user
        if user.role == 'ADMIN':
            return True
            
        # بررسی دسترسی آرتیست اصلی
        if obj.primary_artist_id == user.id:
            return True
            
        # بررسی دسترسی هنرمندان همکار (Collaborators)
        if hasattr(obj, 'collaborators') and obj.collaborators.filter(id=user.id).exists():
            return True
            
        return False