from rest_framework import serializers
from .models import Vendor, Warehouse


class WarehouseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Warehouse
        fields = "__all__"
        read_only_fields = ["warehouse_id", "created_at"]


class VendorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Vendor
        fields = "__all__"
        read_only_fields = [
            "vendor_id",
            "created_at",
            "updated_at",
            "warehouse"
        ]