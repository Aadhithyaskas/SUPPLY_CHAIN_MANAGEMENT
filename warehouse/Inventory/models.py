from django.db import models, transaction
from django.core.exceptions import ValidationError
from products.models import Product
from vendors.models import Vendor


class Zone(models.Model):
    zone_id = models.CharField(primary_key=True, max_length=10)
    zone_type = models.CharField(max_length=20)  

class Rack(models.Model):
    rack_id = models.CharField(primary_key=True, max_length=10)
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE)

class Shelf(models.Model):
    shelf_id = models.CharField(primary_key=True, max_length=10)
    rack = models.ForeignKey(Rack, on_delete=models.CASCADE)

class Bin(models.Model):
    bin_id = models.CharField(primary_key=True, max_length=10)
    shelf = models.ForeignKey(Shelf, on_delete=models.CASCADE)
    
    capacity = models.IntegerField()
    current_load = models.IntegerField(default=0)

    distance_from_dispatch = models.FloatField()

    pick_count = models.IntegerField(default=0)
    last_picked_at = models.DateTimeField(null=True, blank=True)

class Inventory(models.Model):
    
    inventory_id = models.CharField(max_length=10, primary_key=True)

    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    bin = models.ForeignKey(Bin, on_delete=models.CASCADE)

    quantity = models.IntegerField(default=0)


    def save(self, *args, **kwargs):
        if not self.inventory_id:
            with transaction.atomic():
                last = Inventory.objects.select_for_update().order_by('last_update').last()
                new_id = (int(last.inventory_id[3:]) + 1) if last else 1
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
        ("Rejected", "Rejected"),
    ]

    pr_id = models.CharField(max_length=10, primary_key=True, editable=False)
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    vendor = models.ForeignKey("vendors.Vendor", on_delete=models.CASCADE)
    requested_quantity = models.IntegerField()
    total_amount = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    created_by = models.ForeignKey("auth.User", on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.pr_id:
            with transaction.atomic():
                last = PurchaseRequest.objects.select_for_update().order_by("created_at").last()
                new_id = (int(last.pr_id[2:]) + 1) if last else 1
                self.pr_id = f"PR{new_id:04d}"
        if not self.total_amount:
            self.total_amount = self.requested_quantity * self.product.unit_price
        super().save(*args, **kwargs)


class PurchaseOrder(models.Model):

    po_id = models.CharField(max_length=10, primary_key=True, editable=False)
    pr = models.OneToOneField(PurchaseRequest, on_delete=models.CASCADE)
    vendor = models.ForeignKey("vendors.Vendor", on_delete=models.CASCADE)
    order_quantity = models.IntegerField()
    total_amount = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.po_id:
            with transaction.atomic():
                last = PurchaseOrder.objects.select_for_update().order_by("created_at").last()
                new_id = (int(last.po_id[2:]) + 1) if last else 1
                self.po_id = f"PO{new_id:04d}"
        super().save(*args, **kwargs)

class StockMovement(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    bin = models.ForeignKey(Bin, on_delete=models.CASCADE)

    movement_type = models.CharField(max_length=20)  # INBOUND / OUTBOUND

    quantity = models.IntegerField()

    previous_stock = models.IntegerField()
    new_stock = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    
class ASN(models.Model):

    asn_id = models.CharField(max_length=10, primary_key=True, editable=False)
    po = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="asn_po")
    asn_number = models.CharField(max_length=50, unique=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="asn_vendor")
    shipment_date = models.DateField()
    expected_arrival_date = models.DateField()
    vehicle_num = models.CharField(max_length=13)
    driver_name = models.CharField(max_length=25)
    driver_phone = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.asn_id:
            with transaction.atomic():
                last = ASN.objects.select_for_update().order_by('-created_at').first()
                new_id = (int(last.asn_id[3:]) + 1) if last else 1
                self.asn_id = f"ASN{new_id:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.asn_id


class ASNItem(models.Model):

    asn_item_id = models.CharField(max_length=20, primary_key=True, editable=False)
    asn = models.ForeignKey(ASN, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    expected_quantity = models.IntegerField()
    shipped_quantity = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)   # ✅ added

    def save(self, *args, **kwargs):
        if not self.asn_item_id:
            with transaction.atomic():
                last = ASNItem.objects.select_for_update().order_by('-created_at').first()
                new_id = (int(last.asn_item_id.split('-')[-1]) + 1) if last else 1
                self.asn_item_id = f"ASN-ITM-{new_id:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.asn_item_id


class GRN(models.Model):

    STATUS_CHOICES = [
        ("RECEIVED", "Received by Supervisor"),
        ("QC_PENDING", "QC Pending"),
        ("COMPLETED", "Completed"),
    ]

    grn_id = models.CharField(primary_key=True, max_length=10, editable=False)
    grn_number = models.CharField(max_length=50, unique=True)
    po = models.ForeignKey("PurchaseOrder", on_delete=models.CASCADE)
    asn = models.ForeignKey("ASN", on_delete=models.CASCADE, null=True, blank=True)
    receipt_date = models.DateField()
    received_by = models.ForeignKey(
        "auth.User", on_delete=models.SET_NULL, null=True, related_name="grn_received"
    )
    qc_verified_by = models.ForeignKey(
        "auth.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="grn_verified"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="RECEIVED")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.grn_id:
            with transaction.atomic():
                last = GRN.objects.select_for_update().order_by('-created_at').first()
                new_id = (int(last.grn_id.split('-')[-1]) + 1) if last else 1
                self.grn_id = f"GRN-{new_id:04d}"
        super().save(*args, **kwargs)


class GRNItem(models.Model):

    grn_item_id = models.CharField(primary_key=True, max_length=15, editable=False)
    grn = models.ForeignKey(GRN, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    received_quantity = models.IntegerField()
    accepted_quantity = models.IntegerField(default=0)
    rejected_quantity = models.IntegerField(default=0)
    qc_status = models.CharField(
        max_length=15,
        choices=[("Pending", "Pending"), ("Completed", "Completed")],
        default="Pending"
    )
    created_at = models.DateTimeField(auto_now_add=True)   # ✅ added

    def save(self, *args, **kwargs):
        if self.accepted_quantity + self.rejected_quantity > self.received_quantity:
            raise ValidationError("Accepted + Rejected cannot exceed Received")

        if not self.grn_item_id:
            with transaction.atomic():
                last = GRNItem.objects.select_for_update().order_by('-created_at').first()
                new_id = (int(last.grn_item_id.split('-')[-1]) + 1) if last else 1
                self.grn_item_id = f"GRN-ITM-{new_id:04d}"
        super().save(*args, **kwargs)

