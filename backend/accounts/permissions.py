from rest_framework.permissions import BasePermission, SAFE_METHODS

ROLE_LEVEL = {'USER': 1, 'ARTIST': 2, 'SUPPORTER': 3, 'ADMIN': 4}

class IsSelfOrSupportReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in {'SUPPORTER', 'ADMIN'}:
            return True
        if request.method in SAFE_METHODS:
            return True
        return obj == request.user

class IsSupportOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in {'SUPPORTER', 'ADMIN'}

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'
