from django.contrib import admin
from .models import Inventory, PurchaseRequest


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
