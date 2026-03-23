from rest_framework import serializers
from .models import Vendor, Warehouse


class WarehouseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Warehouse
        fields = "__all__"
        read_only_fields = ["warehouse_id", "created_at"]


class VendorSerializer(serializers.ModelSerializer):

    # ✅ Optional fields — allow blank strings from frontend
    contact_person = serializers.CharField(required=False, allow_blank=True)
    email          = serializers.EmailField(required=False, allow_null=True, allow_blank=True)
    address        = serializers.CharField(required=False, allow_blank=True)
    city           = serializers.CharField(required=False, allow_blank=True)
    state          = serializers.CharField(required=False, allow_blank=True)
    country        = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Vendor
        fields = "__all__"
        read_only_fields = [
            "vendor_id",
            "created_at",
            "updated_at",
            "warehouse"
        ]