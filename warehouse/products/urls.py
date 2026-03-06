from django.urls import path
from .views import *

urlpatterns = [

    path('create/', CreateProductView.as_view()),

    path('listall/', ListProductsView.as_view()),

    path('list/<str:product_id>/', ProductDetailView.as_view()),

    path('update/<str:product_id>/', UpdateProductView.as_view()),

    path('delete/<str:product_id>/', DeleteProductView.as_view()),

]