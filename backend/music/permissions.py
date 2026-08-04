from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsVerifiedArtistOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        user = request.user
        return user.is_authenticated and (
            user.role == 'ADMIN' or
            (user.role == 'ARTIST' and user.is_verified_artist)
        )

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.role == 'ADMIN':
            return True
        return obj.primary_artist_id == request.user.id
