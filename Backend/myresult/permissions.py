from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'SUPER_ADMIN'

class IsSchoolAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'

    def has_object_permission(self, request, view, obj):
        # Allow access only to objects related to the school admin's school
        if hasattr(obj, 'school'):
            return obj.school.admin == request.user
        return False

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'TEACHER'

    def has_object_permission(self, request, view, obj):
        # For Subject objects, check if the teacher is assigned to this subject
        if hasattr(obj, 'teacher'):
            return obj.teacher == request.user
        # For Score objects, check if the teacher teaches this subject
        if hasattr(obj, 'subject'):
            return obj.subject.teacher == request.user
        return False

class IsParent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'PARENT'

    def has_object_permission(self, request, view, obj):
        # For Student objects, check if the parent is assigned to this student
        if hasattr(obj, 'parent'):
            return obj.parent == request.user
        # For Score/Result objects, check if they belong to the parent's child
        if hasattr(obj, 'student'):
            return obj.student.parent == request.user
        return False