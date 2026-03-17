from django.db import models
from products.models import Product
from vendors.models import Vendor
# from .models import PurchaseOrder


class Inventory(models.Model):

    inventory_id = models.CharField(
        max_length=10,
        primary_key=True,
        editable=False
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="inventories"
    )

    zone_name = models.CharField(max_length=3)
    shelf_name = models.CharField(max_length=3)
    rack_name = models.CharField(max_length=3)
    bin_name = models.CharField(max_length=3)

    quantity = models.IntegerField(default=0)

    last_update = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):

        if not self.inventory_id:

            last = Inventory.objects.order_by('inventory_id').last()

            if last:
                last_id = int(last.inventory_id[3:])
                new_id = last_id + 1
            else:
                new_id = 1

            self.inventory_id = f"INV{new_id:04d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.product_name} - {self.zone_name}/{self.rack_name}/{self.bin_name}"

class PurchaseRequest(models.Model):
    
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Manager Approved", "Manager Approved"),
        ("Finance Pending", "Finance Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected")
    ]

    pr_id = models.CharField(max_length=10, primary_key=True, editable=False)

    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)

    vendor = models.ForeignKey("vendors.Vendor", on_delete=models.CASCADE)

    requested_quantity = models.IntegerField()

    total_amount = models.IntegerField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending"
    )

    created_by = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):

        if not self.pr_id:
            last = PurchaseRequest.objects.order_by("pr_id").last()

            if last:
                new_id = int(last.pr_id[2:]) + 1
            else:
                new_id = 1

            self.pr_id = f"PR{new_id:04d}"

        if not self.total_amount:
            self.total_amount = self.requested_quantity * self.product.unit_price

        super().save(*args, **kwargs)

class PurchaseOrder(models.Model):
    
    po_id = models.CharField(max_length=10, primary_key=True, editable=False)

    pr = models.OneToOneField(
        PurchaseRequest,
        on_delete=models.CASCADE
    )

    vendor = models.ForeignKey(
        "vendors.Vendor",
        on_delete=models.CASCADE
    )

    order_quantity = models.IntegerField()

    total_amount = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):

        if not self.po_id:

            last = PurchaseOrder.objects.order_by("po_id").last()

            if last:
                new_id = int(last.po_id[2:]) + 1
            else:
                new_id = 1

            self.po_id = f"PO{new_id:04d}"

        super().save(*args, **kwargs)


class ASN(models.Model):

    asn_id = models.CharField(
        max_length=10,
        primary_key=True,
        editable=False
    )

    po = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name="asn_po"
    )

    asn_number = models.CharField(
        max_length=50,
        unique=True   # from vendor
    )

    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name="asn_vendor"
    )

    shipment_date = models.DateField()

    expected_arrival_date = models.DateField()

    vehicle_num = models.CharField(max_length=13)

    driver_name = models.CharField(max_length=25)

    driver_phone = models.CharField(max_length=15)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):

        if not self.asn_id:
            last_asn = ASN.objects.order_by('-created_at').first()

            if last_asn:
                last_id = int(last_asn.asn_id[3:])
                new_id = last_id + 1
            else:
                new_id = 1

            self.asn_id = f"ASN{new_id:04d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return self.asn_id