from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from django.db import transaction
from .models import Inventory, PurchaseRequest, PurchaseOrder, ASN, ASNItem, GRN, GRNItem
from .serializers import InventorySerializer, PurchaseRequestSerializer, ASNSerializer, ASNItemSerializer, GRNSerializer, GRNItemSerializer
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


#Views for GRN

# ✅ CREATE GRN
class GRNCreateView(APIView):
    def post(self, request):
        serializer = GRNSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=400)


# ✅ LIST GRN
class GRNListView(APIView):
    def get(self, request):
        grns = GRN.objects.all().order_by("-created_at")
        serializer = GRNSerializer(grns, many=True)
        return Response(serializer.data)


# ✅ DETAIL GRN
class GRNDetailView(APIView):

    def get_object(self, pk):
        try:
            return GRN.objects.get(pk=pk)
        except GRN.DoesNotExist:
            return None

    def get(self, request, pk):
        grn = self.get_object(pk)
        if not grn:
            return Response({"error": "GRN not found"}, status=404)

        serializer = GRNSerializer(grn)
        return Response(serializer.data)
    

#Views for GRN Items


# ✅ CREATE
class GRNItemCreateView(APIView):
    def post(self, request):
        serializer = GRNItemSerializer(data=request.data, many = True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=400)


# ✅ LIST
class GRNItemListView(APIView):
    def get(self, request):
        items = GRNItem.objects.all()
        serializer = GRNItemSerializer(items, many=True)
        return Response(serializer.data)


# ✅ DETAIL
class SupervisorCreateGRN(APIView):
    
    def post(self, request):

        serializer = GRNSerializer(data=request.data)  # ✅ no many=True

        if serializer.is_valid():
            grn = serializer.save(
                received_by=request.user,
                status="QC_PENDING"
            )

            return Response({
                "message": "GRN created",
                "grn_id": grn.grn_id
            }, status=201)

        return Response(serializer.errors, status=400)
class GRNItemDetailView(APIView):
    
    def get_object(self, pk):
        try:
            return GRNItem.objects.get(pk=pk)
        except GRNItem.DoesNotExist:
            return None

    # ✅ GET (already correct)
    def get(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response({"error": "Not found"}, status=404)

        serializer = GRNItemSerializer(item)
        return Response(serializer.data)

    # ✅ ADD THIS (VERY IMPORTANT)
    def put(self, request, pk):

        item = self.get_object(pk)
        if not item:
            return Response({"error": "Not found"}, status=404)

        serializer = GRNItemSerializer(item, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "GRN Item updated (QC)",
                "data": serializer.data
            })

        return Response(serializer.errors, status=400)
    
class QCApproveGRN(APIView):
    
    def post(self, request, grn_id):

        # if not request.user.is_authenticated:
        #     return Response({"error": "Authentication required"}, status=401)

        try:
            grn = GRN.objects.get(grn_id=grn_id, status="QC_PENDING")
        except GRN.DoesNotExist:
            return Response({"error": "Invalid or already processed GRN"}, status=404)

        items = GRNItem.objects.filter(grn=grn)

        if not items.exists():
            return Response({"error": "No GRN items found"}, status=400)

        total_rejected = 0

        with transaction.atomic():

            for item in items:

                # ✅ Only QC fills accepted/rejected
                if item.accepted_quantity == 0 and item.rejected_quantity == 0:
                    return Response({
                        "error": f"QC not completed for item {item.grn_item_id}"
                    }, status=400)

                inventory, _ = Inventory.objects.get_or_create(
                    product=item.product,
                    defaults={"quantity": 0}
                )

                inventory.quantity += item.accepted_quantity
                inventory.save()

                total_rejected += item.rejected_quantity

                item.qc_status = "Completed"
                item.save()

            grn.status = "COMPLETED"
            grn.qc_verified_by = None

            grn.save()

        # if total_rejected > 0:
        #     send_rejection_email(grn, total_rejected)

        return Response({
            "message": "QC completed successfully",
            "rejected_qty": total_rejected
        })



# def send_rejection_email(grn, total_rejected):
    
#     vendor_email = grn.po.vendor.email

#     subject = f"GRN {grn.grn_number} - Rejected Items Notice"

#     message = f"""
#     Dear {grn.po.vendor.name},

#     We have completed quality inspection for GRN: {grn.grn_number}.

#     Total Rejected Quantity: {total_rejected}

#     Kindly note that the rejected items will not be considered for payment.

#     Please arrange replacement or confirmation.

#     Regards,
#     Warehouse Team
#     """

#     send_mail(
#         subject,
#         message,
#         "warehouse@company.com",
#         [vendor_email],
#         fail_silently=False
#     )

class GRNQCPendingListView(APIView):
    
    def get(self, request):
        grns = GRN.objects.filter(status="QC_PENDING")
        serializer = GRNSerializer(grns, many=True)
        return Response(serializer.data)
    
class GRNItemsByGRNView(APIView):
    
    def get(self, request, grn_id):

        items = GRNItem.objects.filter(grn__grn_id=grn_id)
        serializer = GRNItemSerializer(items, many=True)

        return Response(serializer.data)

class SupervisorGRNListView(APIView):
    
    def get(self, request):

        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)

        status_filter = request.query_params.get("status")

        grns = GRN.objects.filter(created_by=request.user)

        if status_filter:
            grns = grns.filter(status=status_filter)

        grns = grns.order_by("-created_at")

        serializer = GRNSerializer(grns, many=True)

        return Response({
            "count": grns.count(),
            "data": serializer.data
        })
   
class GRNSummaryView(APIView):
    
    def get(self, request, grn_id):

        items = GRNItem.objects.filter(grn__grn_id=grn_id)

        total_received = sum(i.received_quantity for i in items)
        total_accepted = sum(i.accepted_quantity for i in items)
        total_rejected = sum(i.rejected_quantity for i in items)

        return Response({
            "grn_id": grn_id,
            "received": total_received,
            "accepted": total_accepted,
            "rejected": total_rejected
        })

