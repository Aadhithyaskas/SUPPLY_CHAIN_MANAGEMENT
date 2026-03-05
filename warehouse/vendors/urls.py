# vendors/urls.py

from django.urls import path
from .views import CreateVendorView, ListVendorView, DeleteVendor, UpdateVendor

urlpatterns = [
    path('vendors/', ListVendorView.as_view(), name='vendor-list'),
    path('vendors/create/', CreateVendorView.as_view(), name='vendor-create'),
    path('vendors/<int:pk>/update/', UpdateVendor.as_view(), name='vendor-update'),
    path('vendors/<int:pk>/delete/', DeleteVendor.as_view(), name='vendor-delete'),
]
