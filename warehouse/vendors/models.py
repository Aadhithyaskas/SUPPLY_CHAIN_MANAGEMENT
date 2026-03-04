from django.db import models

# Create your models here.



class Warehouse(models.Model):
    
    warehouse_name = models.CharField(max_length=150)
    address = models.TextField()
    inventory_manager_name = models.CharField(max_length=100)
    inventory_manager_phone = models.CharField(max_length=15)
    

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.warehouse_name


class Vendor(models.Model):
    vendor_id = models.CharField(max_length=50, primary_key=True)
    vendor_name = models.CharField(max_length=150)
    contact_person = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    lead_time = models.IntegerField()

    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)

    is_active = models.BooleanField(default=True)

    # Link vendor to warehouse
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="vendors"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.vendor_name