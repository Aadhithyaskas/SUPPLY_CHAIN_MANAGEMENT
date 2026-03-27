from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from .serializers import ProductSerializer
from django.db import transaction
from .utils import parse_vendor_invoice, generate_supplier_invoice_pdf

class CreateProductView(APIView):

    def post(self, request):
        # ✅ FIX: removed many=True — frontend sends a single object {},
        # not a list [{}]. many=True caused every single-object POST to return
        # 400 because the serializer expected an array at the root.
        serializer = ProductSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Product created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProcessVendorInvoiceView(APIView):
    def post(self, request):
        invoice_file = request.FILES.get('invoice')
        profit_percentage = float(request.data.get('profit_margin', 20)) # Default 20%

        if not invoice_file:
            return Response({"error": "No file uploaded"}, status=400)

        try:
            # 1. Extract items from PDF/CSV
            raw_items = parse_vendor_invoice(invoice_file)
            processed_items = []

            with transaction.atomic():
                for entry in raw_items:
                    # Match by SKU or Name to find your internal Product
                    product = Product.objects.filter(sku_code=entry['sku']).first()
                    
                    if product:
                        # 2. Add Profit to Vendor Price
                        vendor_price = entry['price']
                        new_supplier_price = vendor_price * (1 + (profit_percentage / 100))
                        
                        # Update internal unit price if needed
                        product.unit_price = new_supplier_price
                        product.save()

                        processed_items.append({
                            "product_name": product.product_name,
                            "quantity": entry['quantity'],
                            "new_price": round(new_supplier_price, 2),
                            "total": round(new_supplier_price * entry['quantity'], 2)
                        })

            # 3. Generate the New PDF Invoice for the Supplier
            pdf_path = generate_supplier_invoice_pdf(processed_items)

            return Response({
                "message": "Invoice processed successfully",
                "supplier_invoice_url": pdf_path,
                "items_processed": len(processed_items)
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)

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
        return Response({"message": "Product deleted successfully"}, status=status.HTTP_200_OK)