from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # RBAC App URLs
    path('api/', include('rbac.urls')),
]
