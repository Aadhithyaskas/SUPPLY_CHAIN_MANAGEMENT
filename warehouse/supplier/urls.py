from django.urls import path
from . import views

urlpatterns = [

    path("create/", views.create_supplier),

    path("all/", views.get_supplier),

    path("<uuid:supplier_id>/", views.get_supplier_by_id),

    path("update/<uuid:supplier_id>/", views.update_supplier),

    path("delete/<uuid:supplier_id>/", views.delete_supplier),

]