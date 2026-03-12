from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum

from .models import Inventory, PurchaseRequest
from .serializers import InventorySerializer, PurchaseRequestSerializer
from .utils import check_reorder


class CreateInventoryView(APIView):

    def post(self, request):

        serializer = InventorySerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({
                "message": "Inventory created",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors)


class AddStockView(APIView):

    def post(self, request, inventory_id):

        try:
            inventory = Inventory.objects.get(inventory_id=inventory_id)

        except Inventory.DoesNotExist:
            return Response({"error": "Inventory not found"}, status=404)

        qty = int(request.data.get("quantity"))

        inventory.quantity += qty
        inventory.save()

        check_reorder(inventory.product)

        return Response({
            "message": "Stock added",
            "current_quantity": inventory.quantity
        })

class RemoveStockView(APIView):

    def post(self, request, inventory_id):

        try:
            inventory = Inventory.objects.get(inventory_id=inventory_id)

        except Inventory.DoesNotExist:
            return Response({"error": "Inventory not found"}, status=404)

        qty = int(request.data.get("quantity"))

        if inventory.quantity < qty:
            return Response({
                "error": "Insufficient stock"
            })

        inventory.quantity -= qty
        inventory.save()

        check_reorder(inventory.product)

        return Response({
            "message": "Stock removed",
            "remaining_stock": inventory.quantity
        })

class ProductStockView(APIView):

    def get(self, request, product_id):

        total = Inventory.objects.filter(
            product_id=product_id
        ).aggregate(total=Sum('quantity'))['total'] or 0

        return Response({
            "product_id": product_id,
            "total_stock": total
        })

class PurchaseRequestListView(APIView):

    def get(self, request):

        prs = PurchaseRequest.objects.all()

        serializer = PurchaseRequestSerializer(prs, many=True)

        return Response(serializer.data)
