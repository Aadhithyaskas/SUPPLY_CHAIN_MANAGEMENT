from rest_framework import serializers
from .models import Product
from vendors.models import Vendor
from supplier.models import Supplier


class ProductSerializer(serializers.ModelSerializer):

    # ✅ Map vendor_id / supplier_id (what the frontend sends) to the FK fields
    vendor_id = serializers.PrimaryKeyRelatedField(
        source='vendor',
        queryset=Vendor.objects.all(),
        allow_null=True,
        required=False,
    )
    supplier_id = serializers.PrimaryKeyRelatedField(
        source='supplier',
        queryset=Supplier.objects.all(),
        allow_null=True,
        required=False,
    )

    # Read-only nested objects so the frontend can show vendor_name / supplier_name
    vendor = serializers.SerializerMethodField(read_only=True)
    supplier = serializers.SerializerMethodField(read_only=True)

    def get_vendor(self, obj):
        if obj.vendor:
            return {
                "vendor_id": obj.vendor.vendor_id,
                "vendor_name": obj.vendor.vendor_name,
            }
        return None

    def get_supplier(self, obj):
        if obj.supplier:
            return {
                "supplier_id": obj.supplier.supplier_id,
                "supplier_name": obj.supplier.supplier_name,
            }
        return None

    class Meta:
        model = Product
        fields = [
            'product_id',
            'product_name',
            'brand_name',
            'size',
            'sku_code',
            'description',
            'category',
            'quantity',
            'ABC',
            'VED',
            'XYZ',
            'unit_price',
            're_order',
            'is_active',
            'created_at',
            'updated_at',
            'vendor_id',
            'supplier_id',
            'vendor',
            'supplier',
        ]
        read_only_fields = ['product_id', 'sku_code', 'created_at', 'updated_at']