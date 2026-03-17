from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum

from .models import Inventory, PurchaseRequest, PurchaseOrder, ASN, ASNItem
from .serializers import InventorySerializer, PurchaseRequestSerializer, ASNSerializer, ASNItemSerializer
from .utils import check_reorder
from django.core.mail import send_mail

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

class AddStockByProductView(APIView):
    
    def post(self, request, product_id):

        try:
            inventory = Inventory.objects.filter(product_id=product_id)

            if not inventory.exists():
                return Response({"error": "Inventory not found"}, status=404)

        except Inventory.DoesNotExist:
            return Response({"error": "Inventory not found"}, status=404)

        qty = int(request.data.get("quantity"))

        # Add stock to first available bin
        inv = inventory.first()

        inv.quantity += qty
        inv.save()

        check_reorder(inv.product)

        return Response({
            "message": "Stock added successfully",
            "product_id": product_id,
            "updated_bin": inv.inventory_id,
            "current_quantity": inv.quantity
        })

class RemoveStockByProductView(APIView):
    
    def post(self, request, product_id):

        inventories = Inventory.objects.filter(product_id=product_id)

        if not inventories.exists():
            return Response({"error": "Product inventory not found"}, status=404)

        qty = int(request.data.get("quantity"))

        remaining = qty

        for inv in inventories:

            if remaining <= 0:
                break

            if inv.quantity >= remaining:

                inv.quantity -= remaining
                inv.save()
                remaining = 0

            else:

                remaining -= inv.quantity
                inv.quantity = 0
                inv.save()

        product = inventories.first().product

        check_reorder(product)

        return Response({
            "message": "Stock removed successfully",
            "removed_quantity": qty
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
    
class ManagerApprovePR(APIView):
    
    def post(self, request, pr_id):

        try:
            pr = PurchaseRequest.objects.get(pr_id=pr_id)
        except PurchaseRequest.DoesNotExist:
            return Response({"error": "PR not found"}, status=404)

        threshold = 5000

        if pr.total_amount > threshold:

            pr.status = "Finance Pending"
            pr.save()

            return Response({
                "message": "Awaiting Finance Director Approval"
            })

        else:

            pr.status = "Approved"
            pr.save()

            po = PurchaseOrder.objects.create(
                pr=pr,
                vendor=pr.vendor,
                order_quantity=pr.requested_quantity,
                total_amount=pr.total_amount
            )

            send_po_email(po)

            return Response({
                "message": "PR approved and PO created",
                "po_id": po.po_id
            })
class FinanceApprovePR(APIView):
    
    def post(self, request, pr_id):

        try:
            pr = PurchaseRequest.objects.get(pr_id=pr_id)
        except PurchaseRequest.DoesNotExist:
            return Response({"error": "PR not found"}, status=404)

        pr.status = "Approved"
        pr.save()

        po = PurchaseOrder.objects.create(
            pr=pr,
            vendor=pr.vendor,
            order_quantity=pr.requested_quantity,
            total_amount=pr.total_amount
        )

        send_po_email(po)

        return Response({
            "message": "Finance approved. PO created",
            "po_id": po.po_id
        })




def send_po_email(po):

    subject = f"Purchase Order {po.po_id}"

    message = f"""
    Purchase Order: {po.po_id}

    Product: {po.pr.product.product_name}
    Quantity: {po.order_quantity}
    Total Amount: {po.total_amount}
    """

    send_mail(
        subject,
        message,
        "warehouse@company.com",
        [po.vendor.email],
        fail_silently=False
    )


class ASNCreateView(APIView):

    def post(self, request):

        serializer = ASNSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "ASN created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class ASNListView(APIView):

    def get(self, request):

        asn = ASN.objects.all()

        serializer = ASNSerializer(asn, many=True)

        return Response(serializer.data)



class ASNDetailView(APIView):

    def get(self, request, pk):

        try:
            asn = ASN.objects.get(asn_id=pk)
        except ASN.DoesNotExist:
            return Response({"error": "ASN not found"}, status=404)

        serializer = ASNSerializer(asn)

        return Response(serializer.data)


# Views for ASN Items

class CreateASNItemView(APIView):

    def post(self, request):

        serializer = ASNItemSerializer(data=request.data, many = True)

        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "ASN Item created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ASNItemListView(APIView):

    def get(self, request):

        items = ASNItem.objects.all()
        serializer = ASNItemSerializer(items, many=True)

        return Response(serializer.data)
    

class ASNItemDetailView(APIView):

    def get(self, request, pk):

        try:
            item = ASNItem.objects.get(asn_item_id=pk)
        except ASNItem.DoesNotExist:
            return Response(
                {"error": "ASN Item not found"},
                status=404
            )

        serializer = ASNItemSerializer(item)

        return Response(serializer.data)