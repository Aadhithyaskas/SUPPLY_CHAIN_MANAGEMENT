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

    #ASN APIs

    path('create-asn/', ASNCreateView.as_view(), name='create-asn'),

    path('asn-list/', ASNListView.as_view(), name='asn-list'),

    path('asn/<int:pk>/', ASNDetailView.as_view(), name='asn-detail'),

    path('create-asn-item/', CreateASNItemView.as_view(), name='create-asn-item'),

    #ASN Item APIs

    path('asn-item/', ASNItemListView.as_view(), name='asn-items'),

    path('asn-item/<str:pk>/', ASNItemDetailView.as_view(), name='asn-item-detail'),

    #GRN APIs

    path('create-grn/', GRNCreateView.as_view(), name='create-grn'),

    path('grn-list/', GRNListView.as_view(), name='grn-list'),

    path('grn/<str:pk>/', GRNDetailView.as_view(), name='grn-detail'),

    #GRN Item APIs

    path('create-grn-items/', GRNItemCreateView.as_view(), name='create-grn'),

    path('grn-items-list/', GRNItemListView.as_view(), name='grn-list'),

    path('grn-item/<str:pk>/', GRNItemDetailView.as_view(), name='grn-detail'),
    
]
