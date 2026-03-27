from django.contrib import admin
from .models import (
    Inventory, PurchaseRequest, PurchaseOrder, 
    ASN, ASNItem, GRN, GRNItem, StockMovement,
    Zone, Rack, Shelf, Bin
)

class InventoryAdmin(admin.ModelAdmin):
    # Use fields that actually exist in the model
    list_display = [
        'inventory_id', 
        'product', 
        'bin', 
        'quantity',
        'display_bin_location'  # Custom method for location
    ]
    
    # Search fields that exist
    search_fields = [
        'inventory_id', 
        'product__product_name',
        'bin__bin_id'
    ]
    
    # List filter on actual fields
    list_filter = [
        'product',
        'bin__shelf__rack__zone',  # Filter by zone through relationships
        'bin__shelf__rack',        # Filter by rack
        'bin__shelf'               # Filter by shelf
    ]
    
    readonly_fields = ['inventory_id']
    
    # Add custom methods for better display
    def display_bin_location(self, obj):
        """Display full bin location"""
        try:
            return f"{obj.bin.bin_id} (Zone: {obj.bin.shelf.rack.zone.zone_id})"
        except AttributeError:
            return obj.bin.bin_id
    display_bin_location.short_description = 'Bin Location'
    
    # Optional: Add field grouping
    fieldsets = (
        ('Basic Information', {
            'fields': ('inventory_id', 'product', 'quantity')
        }),
        ('Location Information', {
            'fields': ('bin',)
        }),
    )

# Register other models with their admin configurations
class BinAdmin(admin.ModelAdmin):
    list_display = ['bin_id', 'shelf', 'capacity', 'current_load', 'distance_from_dispatch']
    list_filter = ['shelf__rack__zone', 'shelf__rack']
    search_fields = ['bin_id']

class ZoneAdmin(admin.ModelAdmin):
    list_display = ['zone_id', 'zone_type']

class RackAdmin(admin.ModelAdmin):
    list_display = ['rack_id', 'zone']

class ShelfAdmin(admin.ModelAdmin):
    list_display = ['shelf_id', 'rack']

class PurchaseRequestAdmin(admin.ModelAdmin):
    list_display = ['pr_id', 'product', 'vendor', 'requested_quantity', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['pr_id', 'product__product_name', 'vendor__vendor_name']
    readonly_fields = ['pr_id', 'created_at']

class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ['po_id', 'pr', 'vendor', 'order_quantity', 'total_amount', 'created_at']
    search_fields = ['po_id', 'pr__pr_id', 'vendor__vendor_name']
    readonly_fields = ['po_id', 'created_at']

class ASNAdmin(admin.ModelAdmin):
    list_display = ['asn_id', 'po', 'asn_number', 'vendor', 'expected_arrival_date', 'created_at']
    search_fields = ['asn_id', 'asn_number', 'vendor__vendor_name']
    list_filter = ['created_at']

class ASNItemAdmin(admin.ModelAdmin):
    list_display = ['asn_item_id', 'asn', 'product', 'expected_quantity', 'shipped_quantity']
    search_fields = ['asn_item_id', 'asn__asn_id', 'product__product_name']

class GRNAdmin(admin.ModelAdmin):
    list_display = ['grn_id', 'grn_number', 'po', 'asn', 'receipt_date', 'status', 'created_at']
    list_filter = ['status', 'receipt_date']
    search_fields = ['grn_id', 'grn_number', 'po__po_id']

class GRNItemAdmin(admin.ModelAdmin):
    list_display = ['grn_item_id', 'grn', 'product', 'received_quantity', 'accepted_quantity', 
                   'rejected_quantity', 'qc_status']
    list_filter = ['qc_status']
    search_fields = ['grn_item_id', 'grn__grn_id', 'product__product_name']

class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'bin', 'movement_type', 'quantity', 
                   'previous_stock', 'new_stock', 'created_at']
    list_filter = ['movement_type', 'created_at']
    search_fields = ['product__product_name', 'bin__bin_id']

# Register all models with their admin classes
admin.site.register(Inventory, InventoryAdmin)
admin.site.register(Bin, BinAdmin)
admin.site.register(Zone, ZoneAdmin)
admin.site.register(Rack, RackAdmin)
admin.site.register(Shelf, ShelfAdmin)
admin.site.register(PurchaseRequest, PurchaseRequestAdmin)
admin.site.register(PurchaseOrder, PurchaseOrderAdmin)
admin.site.register(ASN, ASNAdmin)
admin.site.register(ASNItem, ASNItemAdmin)
admin.site.register(GRN, GRNAdmin)
admin.site.register(GRNItem, GRNItemAdmin)
admin.site.register(StockMovement, StockMovementAdmin)