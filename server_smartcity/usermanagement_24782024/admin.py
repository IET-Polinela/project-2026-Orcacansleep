from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = (
        'username',
        'email',
        'is_staff',
        'is_superuser',
        'is_admin',
        'is_member',
    )
    fieldsets = UserAdmin.fieldsets + (
        ('Role Tambahan', {'fields': ('is_admin', 'is_member')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Role Tambahan', {'fields': ('is_admin', 'is_member')}),
    )