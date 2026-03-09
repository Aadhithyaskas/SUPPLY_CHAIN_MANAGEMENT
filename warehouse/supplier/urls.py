from django.urls import path
from . import views


urlpatterns = [

    path('create/', views.create_supplier),

    path('list/', views.get_all_suppliers),

    path('<str:supplier_id>/', views.get_supplier_by_id),

    path('update/<str:supplier_id>/', views.update_supplier),

    path('delete/<str:supplier_id>/', views.delete_supplier),

]