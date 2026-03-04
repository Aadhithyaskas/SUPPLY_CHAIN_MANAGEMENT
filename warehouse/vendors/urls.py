# vendors/urls.py
from django.urls import path
from .views import CreateVendorView

urlpatterns = [
    path('create-vendor/', CreateVendorView.as_view(), name='create-vendor'),
]