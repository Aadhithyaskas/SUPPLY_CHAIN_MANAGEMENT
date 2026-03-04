# vendors/urls.py
from django.urls import path
from .views import CreateVendorView,ListVendorView

urlpatterns = [
    path('create-vendor/', CreateVendorView.as_view(), name='create-vendor'),
    path("vendors/", ListVendorView.as_view(), name="list-vendors"),
]