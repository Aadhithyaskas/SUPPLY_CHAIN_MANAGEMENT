from rest_framework import serializers
from .models import Inventory, PurchaseRequest
from .models import ASN, ASNItem


class ASNItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = ASNItem
        fields = "__all__"



class ASNSerializer(serializers.ModelSerializer):

    class Meta:
        model = ASN
        fields = "__all__"

class InventorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Inventory
        fields = "__all__"
        read_only_fields = ("inventory_id", "last_update")


class PurchaseRequestSerializer(serializers.ModelSerializer):

    class Meta:
        model = PurchaseRequest
        fields = "__all__"
