from django.urls import path
from .views import (
    CreateSupplierView,
    UpdateSupplierView,
    DeleteSupplierView,
    ListSupplierView,
    SupplierDetailView
)

urlpatterns = [

    path("create/", CreateSupplierView.as_view(), name="create-supplier"),

    path("update/<int:pk>/", UpdateSupplierView.as_view(), name="update-supplier"),

    path("delete/<int:pk>/", DeleteSupplierView.as_view(), name="delete-supplier"),

    path("list/", ListSupplierView.as_view(), name="list-suppliers"),

    path("<int:pk>/", SupplierDetailView.as_view(), name="supplier-detail"),
]