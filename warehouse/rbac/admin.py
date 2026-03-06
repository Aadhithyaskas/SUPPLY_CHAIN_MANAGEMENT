from django.contrib import admin
from .models import Role, Permission, UserRole
from .models import LoginLogs

admin.site.register(Role)
admin.site.register(Permission)
admin.site.register(UserRole)
admin.site.register(LoginLogs)
