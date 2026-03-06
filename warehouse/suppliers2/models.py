from django.db import models
import uuid


class Supplier(models.Model):

    # supplier_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    supplier_code = models.CharField(max_length=10, unique=True, blank=True)

    supplier_name = models.CharField(max_length=255)
    contact_personname = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=15)

    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):

        if not self.supplier_code:

            count = Supplier.objects.count() + 1
            self.supplier_code = f"SUP{count:03d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.supplier_code} - {self.supplier_name}"