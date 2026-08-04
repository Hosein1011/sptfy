from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsPlaylistOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return obj.is_public or obj.owner_id == request.user.id or request.user.role in {'SUPPORTER', 'ADMIN'}
        return obj.owner_id == request.user.id or request.user.role == 'ADMIN'
