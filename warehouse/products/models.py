from django.db import models
from vendors.models import Vendor
from supplier.models import Supplier
class Product(models.Model):

    product_id = models.CharField(max_length=10, primary_key=True, editable=False)

    product_name = models.CharField(max_length=255)
    brand_name = models.CharField(max_length=100)
    size = models.CharField(max_length=10)


    sku_code = models.CharField(max_length=100, unique=True, editable=False)

    description = models.TextField()
    category = models.CharField(max_length=100)

    quantity = models.IntegerField()

    ABC = models.CharField(max_length=1)
    VED = models.CharField(max_length=1)
    XYZ = models.CharField(max_length=1)

    unit_price = models.IntegerField()
    re_order = models.IntegerField()

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE
    )

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE
    )

    def save(self, *args, **kwargs):

        # Generate Product ID
        if not self.product_id:
            last_product = Product.objects.order_by('product_id').last()

            if last_product:
                last_id = int(last_product.product_id[3:])
                new_id = last_id + 1
            else:
                new_id = 1

            self.product_id = f"PRO{new_id:03d}"

        # Generate SKU
        if not self.sku_code:
            brand_code = self.brand_name[:3].upper()
            product_code = ''.join([word[0] for word in self.product_name.split()]).upper()

            self.sku_code = f"{brand_code}-{product_code}-{self.size.upper()}"


        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product_name} ({self.product_id})"


    

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from .serializers import ProductSerializer
class CreateProductView(APIView):
    
    def post(self, request):

        serializer = ProductSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({
                "message": "Product created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListProductsView(APIView):
    
    def get(self, request):

        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)

        return Response({
            "count": products.count(),
            "products": serializer.data
        })

class ProductDetailView(APIView):
    
    def get(self, request, product_id):

        try:
            product = Product.objects.get(product_id=product_id)

        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProductSerializer(product)

        return Response(serializer.data)

class UpdateProductView(APIView):
    
    def put(self, request, product_id):

        try:
            product = Product.objects.get(product_id=product_id)

        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProductSerializer(product, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()

            return Response({
                "message": "Product updated successfully",
                "data": serializer.data
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteProductView(APIView):
    
    def delete(self, request, product_id):

        try:
            product = Product.objects.get(product_id=product_id)

        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        product.delete()

        return Response({
            "message": "Product deleted successfully"
        }, status=status.HTTP_200_OK)