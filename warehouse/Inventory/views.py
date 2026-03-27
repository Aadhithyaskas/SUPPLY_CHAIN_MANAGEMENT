from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from django.db import transaction
from django.core.mail import send_mail
from .utils import assign_bin
from .models import Inventory, PurchaseRequest, PurchaseOrder, ASN, ASNItem, GRN, GRNItem,StockMovement
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
from django.utils import timezone


# ═══════════════════════════════════════════════════════════
# INVENTORY
# ═══════════════════════════════════════════════════════════

# ================= ZONE VIEWS =================

class CreateZoneView(APIView):
    def post(self, request):
        # Implementation
        pass

class ListZoneView(APIView):
    def get(self, request):
        zones = Zone.objects.all()
        data = [{"zone_id": z.zone_id, "zone_type": z.zone_type} for z in zones]
        return Response(data)

class GetZoneView(APIView):
    def get(self, request, zone_id):
        zone = get_object_or_404(Zone, zone_id=zone_id)
        return Response({"zone_id": zone.zone_id, "zone_type": zone.zone_type})

class UpdateZoneView(APIView):
    def put(self, request, zone_id):
        zone = get_object_or_404(Zone, zone_id=zone_id)
        zone.zone_type = request.data.get("zone_type", zone.zone_type)
        zone.save()
        return Response({"message": "Zone updated successfully"})

class DeleteZoneView(APIView):
    def delete(self, request, zone_id):
        zone = get_object_or_404(Zone, zone_id=zone_id)
        zone.delete()
        return Response({"message": "Zone deleted successfully"})

# ================= RACK VIEWS =================

class CreateRackView(APIView):
    def post(self, request):
        # Implementation
        pass

class ListRackView(APIView):
    def get(self, request):
        racks = Rack.objects.select_related('zone').all()
        data = [{"rack_id": r.rack_id, "zone_id": r.zone.zone_id} for r in racks]
        return Response(data)

class GetRackView(APIView):
    def get(self, request, rack_id):
        rack = get_object_or_404(Rack.objects.select_related('zone'), rack_id=rack_id)
        return Response({"rack_id": rack.rack_id, "zone_id": rack.zone.zone_id})

class UpdateRackView(APIView):
    def put(self, request, rack_id):
        rack = get_object_or_404(Rack, rack_id=rack_id)
        zone_id = request.data.get("zone_id")
        if zone_id:
            rack.zone = get_object_or_404(Zone, zone_id=zone_id)
        rack.save()
        return Response({"message": "Rack updated successfully"})

class DeleteRackView(APIView):
    def delete(self, request, rack_id):
        rack = get_object_or_404(Rack, rack_id=rack_id)
        rack.delete()
        return Response({"message": "Rack deleted successfully"})

# ================= SHELF VIEWS =================

class CreateShelfView(APIView):
    def post(self, request):
        # Implementation
        pass

class ListShelfView(APIView):
    def get(self, request):
        shelves = Shelf.objects.select_related('rack__zone').all()
        data = [{
            "shelf_id": s.shelf_id, 
            "rack_id": s.rack.rack_id,
            "zone_id": s.rack.zone.zone_id
        } for s in shelves]
        return Response(data)

class GetShelfView(APIView):
    def get(self, request, shelf_id):
        shelf = get_object_or_404(Shelf.objects.select_related('rack__zone'), shelf_id=shelf_id)
        return Response({
            "shelf_id": shelf.shelf_id,
            "rack_id": shelf.rack.rack_id,
            "zone_id": shelf.rack.zone.zone_id
        })

class UpdateShelfView(APIView):
    def put(self, request, shelf_id):
        shelf = get_object_or_404(Shelf, shelf_id=shelf_id)
        rack_id = request.data.get("rack_id")
        if rack_id:
            shelf.rack = get_object_or_404(Rack, rack_id=rack_id)
        shelf.save()
        return Response({"message": "Shelf updated successfully"})

class DeleteShelfView(APIView):
    def delete(self, request, shelf_id):
        shelf = get_object_or_404(Shelf, shelf_id=shelf_id)
        shelf.delete()
        return Response({"message": "Shelf deleted successfully"})

# ================= BIN VIEWS =================

class CreateBinView(APIView):
    def post(self, request):
        serializer = BinSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class ListBinView(APIView):
    def get(self, request):
        bins = Bin.objects.select_related('shelf__rack__zone').all()
        data = [{
            "bin_id": b.bin_id,
            "shelf_id": b.shelf.shelf_id,
            "rack_id": b.shelf.rack.rack_id,
            "zone_id": b.shelf.rack.zone.zone_id,
            "capacity": b.capacity,
            "current_load": b.current_load,
            "available_capacity": b.capacity - b.current_load,
            "distance_from_dispatch": b.distance_from_dispatch,
            "pick_count": b.pick_count
        } for b in bins]
        return Response(data)

class GetBinView(APIView):
    def get(self, request, bin_id):
        bin = get_object_or_404(Bin.objects.select_related('shelf__rack__zone'), bin_id=bin_id)
        return Response({
            "bin_id": bin.bin_id,
            "shelf_id": bin.shelf.shelf_id,
            "rack_id": bin.shelf.rack.rack_id,
            "zone_id": bin.shelf.rack.zone.zone_id,
            "capacity": bin.capacity,
            "current_load": bin.current_load,
            "distance_from_dispatch": bin.distance_from_dispatch,
            "pick_count": bin.pick_count,
            "last_picked_at": bin.last_picked_at
        })

class UpdateBinView(APIView):
    def put(self, request, bin_id):
        bin = get_object_or_404(Bin, bin_id=bin_id)
        serializer = BinSerializer(bin, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Bin updated successfully"})
        return Response(serializer.errors, status=400)

class DeleteBinView(APIView):
    def delete(self, request, bin_id):
        bin = get_object_or_404(Bin, bin_id=bin_id)
        # Check if bin has inventory
        if Inventory.objects.filter(bin=bin).exists():
            return Response({"error": "Cannot delete bin with existing inventory"}, status=400)
        bin.delete()
        return Response({"message": "Bin deleted successfully"})

class ListAvailableBinsView(APIView):
    def get(self, request):
        bins = Bin.objects.filter(current_load__lt=models.F('capacity'))
        data = [{
            "bin_id": b.bin_id,
            "available_space": b.capacity - b.current_load,
            "distance_from_dispatch": b.distance_from_dispatch
        } for b in bins]
        return Response(data)

# ================= ADDITIONAL INVENTORY VIEWS =================

class ListInventoryView(APIView):
    def get(self, request):
        inventory = Inventory.objects.select_related('product', 'bin__shelf__rack__zone').all()
        serializer = InventorySerializer(inventory, many=True)
        return Response(serializer.data)

class GetInventoryView(APIView):
    def get(self, request, inventory_id):
        inventory = get_object_or_404(Inventory.objects.select_related('product', 'bin'), inventory_id=inventory_id)
        serializer = InventorySerializer(inventory)
        return Response(serializer.data)

class UpdateInventoryView(APIView):
    def put(self, request, inventory_id):
        inventory = get_object_or_404(Inventory, inventory_id=inventory_id)
        serializer = InventorySerializer(inventory, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Inventory updated successfully"})
        return Response(serializer.errors, status=400)

class DeleteInventoryView(APIView):
    def delete(self, request, inventory_id):
        inventory = get_object_or_404(Inventory, inventory_id=inventory_id)
        inventory.delete()
        return Response({"message": "Inventory deleted successfully"})

class StockMovementListView(APIView):
    def get(self, request):
        movements = StockMovement.objects.select_related('product', 'bin').order_by('-created_at')[:100]
        data = [{
            "product": m.product.product_name,
            "bin": m.bin.bin_id,
            "movement_type": m.movement_type,
            "quantity": m.quantity,
            "previous_stock": m.previous_stock,
            "new_stock": m.new_stock,
            "created_at": m.created_at
        } for m in movements]
        return Response(data)

class StockMovementByProductView(APIView):
    def get(self, request, product_id):
        movements = StockMovement.objects.filter(product_id=product_id).select_related('bin').order_by('-created_at')
        data = [{
            "bin": m.bin.bin_id,
            "movement_type": m.movement_type,
            "quantity": m.quantity,
            "previous_stock": m.previous_stock,
            "new_stock": m.new_stock,
            "created_at": m.created_at
        } for m in movements]
        return Response(data)

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

# Fix 1: add timezone import at top


# Fix 2: ManagerApprovePR — set Manager Approved status first
class ManagerApprovePR(APIView):
    """
    Manager approves a Purchase Request.
    - If total_amount > threshold: moves to Finance Pending
    - If total_amount <= threshold: directly approves and creates PO
    """
    
    def post(self, request, pr_id):
        # Add authentication check
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)
        
        # Add permission check (assuming you have a custom permission)
        # if not request.user.has_perm('your_app.can_approve_pr'):
        #     return Response({"error": "Permission denied"}, status=403)
        
        try:
            pr = PurchaseRequest.objects.get(pr_id=pr_id)
        except PurchaseRequest.DoesNotExist:
            return Response({"error": "PR not found"}, status=404)
        
        # Validate PR status
        if pr.status not in ["Pending", "Manager Approved", "Finance Pending"]:
            return Response({
                "error": f"Cannot approve PR with status '{pr.status}'"
            }, status=400)
        
        # Check if already processed
        if pr.status == "Approved":
            return Response({"error": "PR already approved"}, status=400)
        
        # Threshold amount
        threshold = 5000
        
        # Process based on amount
        if pr.total_amount > threshold:
            # Route to Finance for approval
            pr.status = "Finance Pending"
            pr.save()
            return Response({
                "message": "PR requires Finance Director approval",
                "pr_id": pr.pr_id,
                "status": pr.status,
                "total_amount": pr.total_amount
            }, status=200)
        else:
            # Manager can approve directly
            pr.status = "Approved"
            pr.save()
            
            try:
                # Create Purchase Order
                po = PurchaseOrder.objects.create(
                    pr=pr,
                    vendor=pr.vendor,
                    order_quantity=pr.requested_quantity,
                    total_amount=pr.total_amount
                )
                
                # Send email notification
                try:
                    send_po_email(po)
                except Exception as email_error:
                    # Log email error but don't fail the approval
                    print(f"Email sending failed: {email_error}")
                    # You might want to use proper logging here
                
                return Response({
                    "message": "PR approved and PO created successfully",
                    "pr_id": pr.pr_id,
                    "po_id": po.po_id,
                    "status": pr.status
                }, status=200)
                
            except Exception as e:
                # If PO creation fails, revert PR status
                pr.status = "Pending"
                pr.save()
                return Response({
                    "error": f"Failed to create Purchase Order: {str(e)}"
                }, status=500)

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
    """
    QC finalizes the GRN.
    - Ensures all items are QC completed
    - Adds accepted quantity to inventory
    - Tracks stock movement
    - Updates GRN status
    """

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

        # Ensure all items are QC completed
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
                # Accumulate totals
                total_accepted += item.accepted_quantity
                total_rejected += item.rejected_quantity

                remaining_qty = item.accepted_quantity

                while remaining_qty > 0:
                    bin = assign_bin(item.product, remaining_qty)
                    available_space = bin.capacity - bin.current_load

                    if available_space <= 0:
                        raise Exception(f"Bin {bin.bin_id} is full")

                    put_qty = min(remaining_qty, available_space)

                    inventory, _ = Inventory.objects.get_or_create(
                        product=item.product,
                        bin=bin,
                        defaults={"quantity": 0}
                    )

                    prev_qty = inventory.quantity

                    inventory.quantity += put_qty
                    inventory.save()

                    # Update bin load
                    bin.current_load += put_qty
                    bin.save()

                    # Track stock movement
                    StockMovement.objects.create(
                        product=item.product,
                        bin=bin,
                        movement_type="INBOUND",
                        quantity=put_qty,
                        previous_stock=prev_qty,
                        new_stock=inventory.quantity
                    )

                    remaining_qty -= put_qty

            # Mark GRN as completed
            grn.status = "COMPLETED"
            grn.qc_verified_by = request.user
            grn.save()

        return Response({
            "message": "GRN approved and inventory updated",
            "grn_id": grn_id,
            "total_accepted": total_accepted,
            "total_rejected": total_rejected
        }, status=200)
        
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



class OptimizedOutboundView(APIView):
    """
    Handles outbound picking with:
    - Distance-based picking
    - Balanced bin usage
    - Multi-bin allocation
    """

    def post(self, request, product_id):

        try:
            qty = int(request.data.get("quantity"))
        except (TypeError, ValueError):
            return Response({"error": "Invalid quantity"}, status=400)

        if qty <= 0:
            return Response({"error": "Quantity must be > 0"}, status=400)

        inventories = Inventory.objects.select_related("bin").filter(
            product_id=product_id,
            quantity__gt=0
        )

        if not inventories.exists():
            return Response({"error": "No stock available"}, status=404)

        total_available = sum(inv.quantity for inv in inventories)

        if qty > total_available:
            return Response({
                "error": f"Requested {qty}, available {total_available}"
            }, status=400)

        # 🔥 Smart Sorting: distance + usage balancing
        inventories = sorted(
            inventories,
            key=lambda x: (
                x.bin.distance_from_dispatch,
                x.bin.pick_count
            )
        )

        remaining = qty
        picked_bins = []

        with transaction.atomic():

            for inv in inventories:

                if remaining <= 0:
                    break

                pick_qty = min(inv.quantity, remaining)

                prev_qty = inv.quantity

                inv.quantity -= pick_qty
                inv.save()

                # Update bin usage
                bin = inv.bin
                bin.current_load -= pick_qty
                bin.pick_count += 1
                bin.last_picked_at = timezone.now()
                bin.save()

                # 🔥 Track movement
                StockMovement.objects.create(
                    product=inv.product,
                    bin=bin,
                    movement_type="OUTBOUND",
                    quantity=pick_qty,
                    previous_stock=prev_qty,
                    new_stock=inv.quantity
                )

                picked_bins.append({
                    "bin_id": bin.bin_id,
                    "picked_quantity": pick_qty
                })

                remaining -= pick_qty

        return Response({
            "message": "Outbound picking completed",
            "product_id": product_id,
            "requested_quantity": qty,
            "picked_bins": picked_bins
        }, status=200)