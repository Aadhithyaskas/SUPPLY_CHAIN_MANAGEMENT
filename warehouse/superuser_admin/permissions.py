from rest_framework.permissions import BasePermission

class IsFounder(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role and
            request.user.role.name == "FOUNDER"
        )


class IsAdminOrFounder(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role and
            request.user.role.name in ["FOUNDER", "ADMIN"]
        )
