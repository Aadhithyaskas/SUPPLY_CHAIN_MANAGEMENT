from rest_framework import serializers
from .models import Supplier


class SupplierSerializer(serializers.ModelSerializer):

    class Meta:
        model = Supplier
        fields = "__all__"
        read_only_fields = ["supplier_code", "supplier_id", "created_at", "updated_at"]