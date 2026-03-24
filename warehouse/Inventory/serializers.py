from rest_framework import serializers
from .models import Inventory, PurchaseRequest, PurchaseOrder, ASN, ASNItem, GRN, GRNItem


class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = "__all__"
        read_only_fields = ("inventory_id", "last_update")


class PurchaseRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseRequest
        fields = "__all__"


class PurchaseOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrder
        fields = "__all__"
        read_only_fields = ("po_id", "created_at")


class ASNItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ASNItem
        fields = "__all__"


class ASNSerializer(serializers.ModelSerializer):
    class Meta:
        model = ASN
        fields = "__all__"


# ── Supervisor creates the GRN header ──────────────────────────────────────────
class GRNCreateSerializer(serializers.ModelSerializer):
    """
    Used by SupervisorCreateGRN.
    - Writable: po, asn, receipt_date, grn_number
    - Auto-set by view: received_by, status (QC_PENDING)
    - Never writable: grn_id, qc_verified_by, created_at
    """
    class Meta:
        model = GRN
        fields = ["grn_id", "grn_number", "po", "asn", "receipt_date",
                  "received_by", "qc_verified_by", "status", "created_at"]
        read_only_fields = ["grn_id", "received_by", "qc_verified_by",
                            "status", "created_at"]


# ── Supervisor adds line items ─────────────────────────────────────────────────
class GRNItemCreateSerializer(serializers.ModelSerializer):
    """
    Used by SupervisorAddGRNItems.
    - Writable: grn, product, received_quantity
    - QC fields are rejected at input; model defaults handle them
    """
    class Meta:
        model = GRNItem
        fields = ["grn_item_id", "grn", "product", "received_quantity",
                  "accepted_quantity", "rejected_quantity", "qc_status"]
        read_only_fields = ["grn_item_id", "accepted_quantity",
                            "rejected_quantity", "qc_status"]


# ── QC updates a single item ───────────────────────────────────────────────────
class GRNItemQCSerializer(serializers.ModelSerializer):
    """
    Used by QCUpdateGRNItem.
    - Writable: accepted_quantity, rejected_quantity
    - Everything else is read-only — QC cannot touch received_quantity
    """
    class Meta:
        model = GRNItem
        fields = ["grn_item_id", "grn", "product", "received_quantity",
                  "accepted_quantity", "rejected_quantity", "qc_status"]
        read_only_fields = ["grn_item_id", "grn", "product",
                            "received_quantity", "qc_status"]

    def validate(self, data):
        accepted = data.get("accepted_quantity", self.instance.accepted_quantity)
        rejected = data.get("rejected_quantity", self.instance.rejected_quantity)
        received = self.instance.received_quantity

        if accepted < 0 or rejected < 0:
            raise serializers.ValidationError("Quantities cannot be negative.")

        if accepted + rejected > received:
            raise serializers.ValidationError(
                f"accepted + rejected ({accepted + rejected}) "
                f"exceeds received ({received})."
            )
        return data


# ── Read serializers (for GET responses) ──────────────────────────────────────
class GRNItemReadSerializer(serializers.ModelSerializer):
    """Full detail for reading — used in list/detail/summary views."""
    product_name = serializers.CharField(
        source="product.product_name", read_only=True
    )

    class Meta:
        model = GRNItem
        fields = ["grn_item_id", "grn", "product", "product_name",
                  "received_quantity", "accepted_quantity",
                  "rejected_quantity", "qc_status"]


class GRNReadSerializer(serializers.ModelSerializer):
    """Full detail for reading — includes nested items."""
    items = GRNItemReadSerializer(many=True, read_only=True)
    po_id = serializers.CharField(source="po.po_id", read_only=True)
    asn_id = serializers.CharField(source="asn.asn_id", read_only=True,
                                   allow_null=True)
    received_by_username = serializers.CharField(
        source="received_by.username", read_only=True, allow_null=True
    )
    qc_verified_by_username = serializers.CharField(
        source="qc_verified_by.username", read_only=True, allow_null=True
    )

    class Meta:
        model = GRN
        fields = ["grn_id", "grn_number", "po_id", "asn_id", "receipt_date",
                  "received_by_username", "qc_verified_by_username",
                  "status", "created_at", "items"]