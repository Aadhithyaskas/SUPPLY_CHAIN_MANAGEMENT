from django.urls import path
from .views import *

urlpatterns = [

    # Warehouse
    path("warehouse/", GetWarehouse.as_view()),
    path("Warehouse/create/", CreateWarehouse.as_view()),
    path("Warehouse/update/", UpdateWarehouse.as_view()),

    # Vendor
    path("create/", CreateVendorView.as_view()),
    path("list_all/", ListVendorView.as_view()),
    path("<str:vendor_id>/", GetVendorView.as_view()),
    path("update/<str:vendor_id>/", UpdateVendor.as_view()),
    path("delete/<str:vendor_id>/", DeleteVendor.as_view()),

]