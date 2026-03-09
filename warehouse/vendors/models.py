from django.db import models


class Warehouse(models.Model):

    warehouse_id = models.CharField(
        primary_key=True,
        max_length=10,
        editable=False
    )

    warehouse_name = models.CharField(max_length=150)

    warehouse_email = models.EmailField()

    warehouse_phone = models.CharField(max_length=15)

    address = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):

        # Allow only one warehouse
        if not self.warehouse_id and Warehouse.objects.exists():
            raise ValueError("Only one warehouse is allowed in the system.")

        # Auto generate warehouse ID
        if not self.warehouse_id:
            self.warehouse_id = "WH0001"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.warehouse_name} ({self.warehouse_id})"


class Vendor(models.Model):

    vendor_id = models.CharField(
        primary_key=True,
        max_length=10,
        editable=False
    )

    vendor_name = models.CharField(max_length=150)

    contact_person = models.CharField(max_length=150)

    email = models.EmailField(blank=True, null=True)

    phone = models.CharField(max_length=20)

    lead_time = models.IntegerField()

    address = models.CharField(max_length=255)

    city = models.CharField(max_length=100)

    state = models.CharField(max_length=100)

    country = models.CharField(max_length=100)

    is_active = models.BooleanField(default=True)

    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="vendors"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):

        # Auto generate vendor ID
        if not self.vendor_id:

            last_vendor = Vendor.objects.all().order_by("created_at").last()

            if last_vendor:
                last_id = int(last_vendor.vendor_id[3:])
                new_id = last_id + 1
            else:
                new_id = 1

            self.vendor_id = f"VEN{new_id:04d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.vendor_name} ({self.vendor_id})"