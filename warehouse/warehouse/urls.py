from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    
)

from vendors.views import CreateVendorView

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("create-vendor/", CreateVendorView.as_view(), name="create-vendor"),
    path("api2/", include("vendors.urls")),
    path('api/', include('rbac.urls')),
]
