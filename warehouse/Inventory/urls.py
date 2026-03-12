from django.urls import path
from .views import *

urlpatterns = [

    path('create/', CreateInventoryView.as_view()),

    path('add-stock/<str:inventory_id>/', AddStockView.as_view()),

    path('remove-stock/<str:inventory_id>/', RemoveStockView.as_view()),

    path('product-stock/<str:product_id>/', ProductStockView.as_view()),

    path('purchase-requests/', PurchaseRequestListView.as_view()),

]
