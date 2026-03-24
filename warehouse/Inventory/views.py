from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from django.db import transaction
from django.core.mail import send_mail

from .models import Inventory, PurchaseRequest, PurchaseOrder, ASN, ASNItem, GRN, GRNItem
from .serializers import (
    InventorySerializer,
    PurchaseRequestSerializer,
    PurchaseOrderSerializer,
    ASNSerializer,
    ASNItemSerializer,
    GRNCreateSerializer,
    GRNItemCreateSerializer,
    GRNItemQCSerializer,
    GRNReadSerializer,
    GRNItemReadSerializer,
)
from .utils import check_reorder


# ═══════════════════════════════════════════════════════════
# INVENTORY
# ═══════════════════════════════════════════════════════════

class CreateInventoryView(APIView):

    def post(self, request):
        serializer = InventorySerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Inventory created",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddStockByProductView(APIView):

    def post(self, request, product_id):
        try:
            inventory = Inventory.objects.filter(product_id=product_id)

            if not inventory.exists():
                return Response({"error": "Inventory not found"}, status=404)

        except Inventory.DoesNotExist:
            return Response({"error": "Inventory not found"}, status=404)

        try:
            qty = int(request.data.get("quantity"))
        except (TypeError, ValueError):
            return Response({"error": "quantity must be a valid integer"}, status=400)

        if qty <= 0:
            return Response({"error": "quantity must be greater than zero"}, status=400)

        with transaction.atomic():
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

        try:
            qty = int(request.data.get("quantity"))
        except (TypeError, ValueError):
            return Response({"error": "quantity must be a valid integer"}, status=400)

        if qty <= 0:
            return Response({"error": "quantity must be greater than zero"}, status=400)

        total_available = inventories.aggregate(
            total=Sum("quantity")
        )["total"] or 0

        if qty > total_available:
            return Response({
                "error": f"Requested quantity ({qty}) exceeds available stock ({total_available})"
            }, status=400)

        remaining = qty

        with transaction.atomic():
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

        check_reorder(inventories.first().product)

        return Response({
            "message": "Stock removed successfully",
            "removed_quantity": qty
        })


class ProductStockView(APIView):

    def get(self, request, product_id):
        total = Inventory.objects.filter(
            product_id=product_id
        ).aggregate(total=Sum("quantity"))["total"] or 0

        return Response({
            "product_id": product_id,
            "total_stock": total
        })


# ═══════════════════════════════════════════════════════════
# PURCHASE REQUEST
# ═══════════════════════════════════════════════════════════

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
            return Response({"message": "Awaiting Finance Director Approval"})

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


# ═══════════════════════════════════════════════════════════
# PURCHASE ORDER
# ═══════════════════════════════════════════════════════════

class PurchaseOrderListView(APIView):

    def get(self, request):
        pos = PurchaseOrder.objects.all().order_by("-created_at")
        return Response(PurchaseOrderSerializer(pos, many=True).data)


# ═══════════════════════════════════════════════════════════
# ASN
# ═══════════════════════════════════════════════════════════

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

        return Response(ASNSerializer(asn).data)


# ═══════════════════════════════════════════════════════════
# ASN ITEMS
# ═══════════════════════════════════════════════════════════

class CreateASNItemView(APIView):

    def post(self, request):
        serializer = ASNItemSerializer(data=request.data, many=True)

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
            return Response({"error": "ASN Item not found"}, status=404)

        return Response(ASNItemSerializer(item).data)


# ═══════════════════════════════════════════════════════════
# GRN — SUPERVISOR
# ═══════════════════════════════════════════════════════════

class SupervisorCreateGRN(APIView):
    """Supervisor creates the GRN header. Status auto-set to QC_PENDING."""

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)

        serializer = GRNCreateSerializer(data=request.data)
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


class SupervisorAddGRNItems(APIView):
    """Supervisor adds line items with received_quantity only. QC fields are locked."""

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)

        serializer = GRNItemCreateSerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "GRN items added",
                "data": serializer.data
            }, status=201)

        return Response(serializer.errors, status=400)


class SupervisorGRNListView(APIView):
    """Returns only GRNs created by the logged-in supervisor."""

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)

        grns = GRN.objects.filter(received_by=request.user)

        status_filter = request.query_params.get("status")
        if status_filter:
            grns = grns.filter(status=status_filter)

        grns = grns.order_by("-created_at")

        return Response({
            "count": grns.count(),
            "data": GRNReadSerializer(grns, many=True).data
        })


# ═══════════════════════════════════════════════════════════
# GRN — QC
# ═══════════════════════════════════════════════════════════

class QCUpdateGRNItem(APIView):
    """QC fills accepted_quantity and rejected_quantity only. Cannot touch received_quantity."""

    def put(self, request, pk):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)

        try:
            item = GRNItem.objects.get(pk=pk)
        except GRNItem.DoesNotExist:
            return Response({"error": "GRN item not found"}, status=404)

        if item.qc_status == "Completed":
            return Response({"error": "Item already QC completed"}, status=400)

        serializer = GRNItemQCSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(qc_status="Completed")
            return Response({
                "message": "QC updated",
                "data": serializer.data
            })

        return Response(serializer.errors, status=400)


class QCApproveGRN(APIView):
    """QC finalizes the GRN. All items must be QC'd. Adds accepted_quantity to inventory."""

    def post(self, request, grn_id):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)

        try:
            grn = GRN.objects.get(grn_id=grn_id, status="QC_PENDING")
        except GRN.DoesNotExist:
            return Response({"error": "GRN not found or already processed"}, status=404)

        items = GRNItem.objects.filter(grn=grn)

        if not items.exists():
            return Response({"error": "No GRN items found"}, status=400)

        incomplete = items.filter(qc_status="Pending")
        if incomplete.exists():
            return Response({
                "error": f"{incomplete.count()} item(s) not yet QC'd",
                "pending_items": list(incomplete.values_list("grn_item_id", flat=True))
            }, status=400)

        total_accepted = 0
        total_rejected = 0

        with transaction.atomic():
            for item in items:
                inventory, _ = Inventory.objects.get_or_create(
                    product=item.product,
                    defaults={"quantity": 0}
                )
                inventory.quantity += item.accepted_quantity
                inventory.save()

                total_accepted += item.accepted_quantity
                total_rejected += item.rejected_quantity

            grn.status = "COMPLETED"
            grn.qc_verified_by = request.user
            grn.save()

        return Response({
            "message": "GRN approved and inventory updated",
            "grn_id": grn_id,
            "total_accepted": total_accepted,
            "total_rejected": total_rejected
        })


class GRNQCPendingListView(APIView):
    """Returns all GRNs waiting for QC."""

    def get(self, request):
        grns = GRN.objects.filter(status="QC_PENDING")
        return Response(GRNReadSerializer(grns, many=True).data)


# ═══════════════════════════════════════════════════════════
# GRN — GENERAL READ
# ═══════════════════════════════════════════════════════════

class GRNCreateView(APIView):
    """Generic GRN create — used for direct creation outside supervisor flow."""

    def post(self, request):
        serializer = GRNCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=400)


class GRNListView(APIView):

    def get(self, request):
        grns = GRN.objects.all().order_by("-created_at")
        return Response(GRNReadSerializer(grns, many=True).data)


class GRNDetailView(APIView):

    def get(self, request, pk):
        try:
            grn = GRN.objects.get(grn_id=pk)
        except GRN.DoesNotExist:
            return Response({"error": "GRN not found"}, status=404)

        return Response(GRNReadSerializer(grn).data)


class GRNItemsByGRNView(APIView):

    def get(self, request, grn_id):
        items = GRNItem.objects.filter(grn__grn_id=grn_id)
        return Response(GRNItemReadSerializer(items, many=True).data)


class GRNSummaryView(APIView):

    def get(self, request, grn_id):
        result = GRNItem.objects.filter(grn__grn_id=grn_id).aggregate(
            received=Sum("received_quantity"),
            accepted=Sum("accepted_quantity"),
            rejected=Sum("rejected_quantity")
        )
        return Response({
            "grn_id": grn_id,
            **{k: v or 0 for k, v in result.items()}
        })


# ═══════════════════════════════════════════════════════════
# GRN ITEMS — GENERAL READ
# ═══════════════════════════════════════════════════════════

class GRNItemCreateView(APIView):
    """Generic GRN item create — outside supervisor flow."""

    def post(self, request):
        serializer = GRNItemCreateSerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=400)


class GRNItemListView(APIView):

    def get(self, request):
        items = GRNItem.objects.all()
        return Response(GRNItemReadSerializer(items, many=True).data)


class GRNItemDetailView(APIView):

    def get_object(self, pk):
        try:
            return GRNItem.objects.get(pk=pk)
        except GRNItem.DoesNotExist:
            return None

    def get(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response({"error": "Not found"}, status=404)
        return Response(GRNItemReadSerializer(item).data)


# ═══════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════

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