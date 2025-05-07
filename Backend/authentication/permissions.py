from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'SUPER_ADMIN'

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role in ['SUPER_ADMIN', 'ADMIN']

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role in ['SUPER_ADMIN', 'ADMIN', 'TEACHER']

class IsParent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'PARENT'