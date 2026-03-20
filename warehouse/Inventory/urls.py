from django.urls import path
from .views import *

urlpatterns = [

    # ================= INVENTORY =================
    path("create/", CreateInventoryView.as_view()),
    path("add-stock/<str:product_id>/", AddStockByProductView.as_view()),
    path("remove-stock/<str:product_id>/", RemoveStockByProductView.as_view()),
    path("product-stock/<str:product_id>/", ProductStockView.as_view()),

    # ================= PURCHASE =================
    path("purchase-requests/", PurchaseRequestListView.as_view()),
    path("pr/manager-approve/<str:pr_id>/", ManagerApprovePR.as_view()),
    path("pr/finance-approve/<str:pr_id>/", FinanceApprovePR.as_view()),

    # ================= ASN =================
    path('create-asn/', ASNCreateView.as_view()),
    path('asn-list/', ASNListView.as_view()),
    path('asn/<str:pk>/', ASNDetailView.as_view()),   # ✅ FIXED (was int)
    path('create-asn-item/', CreateASNItemView.as_view()),

    # ================= ASN ITEMS =================
    path('asn-item/', ASNItemListView.as_view()),
    path('asn-item/<str:pk>/', ASNItemDetailView.as_view()),

    # ================= GRN (IMPORTANT ORDER) =================

    # 🔥 SPECIFIC ROUTES FIRST
    path('grn/supervisor-create/', SupervisorCreateGRN.as_view()),
    path('grn/qc-approve/<str:grn_id>/', QCApproveGRN.as_view()),
    path('grn/qc-pending/', GRNQCPendingListView.as_view()),
    path('grn/my-grns/', SupervisorGRNListView.as_view()),
    path('grn/<str:grn_id>/items/', GRNItemsByGRNView.as_view()),
    path('grn/<str:grn_id>/summary/', GRNSummaryView.as_view()),

    # 🔥 NORMAL ROUTES
    path('create-grn/', GRNCreateView.as_view()),
    path('grn-list/', GRNListView.as_view()),

    # 🔥 DYNAMIC LAST (VERY IMPORTANT)
    path('grn/<str:pk>/', GRNDetailView.as_view()),

    # ================= GRN ITEMS =================
    path('create-grn-items/', GRNItemCreateView.as_view()),
    path('grn-items-list/', GRNItemListView.as_view()),
    path('grn-item/<str:pk>/', GRNItemDetailView.as_view()),
]
    