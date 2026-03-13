from django.urls import path
from .views import *

urlpatterns = [

    path("create/", CreateInventoryView.as_view()),

    path("add-stock/<str:product_id>/", AddStockByProductView.as_view()),

    path("remove-stock/<str:product_id>/", RemoveStockByProductView.as_view()),

    path("product-stock/<str:product_id>/", ProductStockView.as_view()),

    path("purchase-requests/", PurchaseRequestListView.as_view()),
    
     path("pr/manager-approve/<str:pr_id>/", ManagerApprovePR.as_view()),

    path("pr/finance-approve/<str:pr_id>/", FinanceApprovePR.as_view()),

]
