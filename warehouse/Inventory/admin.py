from django.contrib import admin
from .models import Inventory, PurchaseRequest, PurchaseOrder, ASN


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):

    list_display = (
        "inventory_id",
        "product",
        "zone_name",
        "shelf_name",
        "rack_name",
        "bin_name",
        "quantity",
        "last_update"
    )

    search_fields = (
        "inventory_id",
        "product__product_name",
        "product__product_id"
    )

    list_filter = (
        "zone_name",
        "rack_name",
        "shelf_name"
    )

    ordering = ("inventory_id",)

    readonly_fields = (
        "inventory_id",
        "last_update"
    )


@admin.register(PurchaseRequest)
class PurchaseRequestAdmin(admin.ModelAdmin):

    list_display = (
        "pr_id",
        "product",
        "requested_quantity",
        "status",
        "created_at"
    )

    search_fields = (
        "pr_id",
        "product__product_name",
        "product__product_id"
    )

    list_filter = (
        "status",
        "created_at"
    )

    ordering = ("-created_at",)

    readonly_fields = (
        "pr_id",
        "created_at"
    )


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):

    list_display = (
        "po_id",
        "pr",
        "vendor",
        "order_quantity",
        "total_amount",
        "created_at"
    )

    search_fields = (
        "po_id",
        "vendor__vendor_name"
    )

    list_filter = (
        "created_at",
    )

    ordering = ("-created_at",)

    readonly_fields = (
        "po_id",
        "created_at"
    )


@admin.register(ASN)
class ASNAdmin(admin.ModelAdmin):

    list_display = (
        "asn_number",
        "po",
        "vendor",
        "shipment_date",
        "expected_arrival_date",
        "vehicle_num"
    )

    search_fields = (
        "asn_number",
        "po__po_id",
        "vendor__vendor_name"
    )

    list_filter = (
        "shipment_date",
        "expected_arrival_date"
    )

    ordering = ("-shipment_date",)

    readonly_fields = (
        "created_at",
    )