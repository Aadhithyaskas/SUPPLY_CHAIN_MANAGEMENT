from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from .serializers import ProductSerializer

# Create your views here.

#creation of products 
class CreateProductView(APIView):

    def post(self, request):

        serializer = ProductSerializer(data=request.data, many = True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# list all products and get details of a product
class ListProductsView(APIView):

    def get(self, request):

        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)

        return Response(serializer.data)

#list single product details
class ProductDetailView(APIView):

    def get(self, request, product_id):

        try:
            product = Product.objects.get(product_id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
#update product details
class UpdateProductView(APIView):

    def put(self, request, product_id):

        try:
            product = Product.objects.get(product_id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        serializer = ProductSerializer(product, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

#delete a product
class DeleteProductView(APIView):

    def delete(self, request, product_id):

        try:
            product = Product.objects.get(product_id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        product.delete()
        return Response({"message": "Product deleted successfully"})

