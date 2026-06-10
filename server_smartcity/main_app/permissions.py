from rest_framework import permissions


class ReportRolePermission(permissions.BasePermission):
    """
    Aturan akses Report API:
    - Admin hanya boleh mengubah status laporan non-DRAFT.
    - Citizen boleh membuat laporan.
    - Citizen boleh edit/hapus laporan miliknya sendiri jika masih DRAFT.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if view.action == 'create':
            return request.user.is_member and not request.user.is_admin

        return True

    def has_object_permission(self, request, view, obj):
        user = request.user

        if request.method in permissions.SAFE_METHODS:
            return True

        if user.is_admin:
            return (
                view.action == 'partial_update'
                and obj.status != 'DRAFT'
                and set(request.data.keys()) == {'status'}
            )

        if user.is_member:
            return (
                obj.reporter == user
                and obj.status == 'DRAFT'
                and view.action in ['update', 'partial_update', 'destroy']
            )

        return False