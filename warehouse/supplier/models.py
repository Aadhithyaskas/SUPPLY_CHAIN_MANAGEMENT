import uuid
from django.db import models


class Supplier(models.Model):

    supplier_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    supplier_name = models.CharField(max_length=255)

    contact_personname = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    email = models.EmailField(
        unique=False,
        blank=True,
        null=True
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    address = models.TextField(blank=True, null=True)

    city = models.CharField(max_length=100)

    state = models.CharField(max_length=100)

    country = models.CharField(max_length=100)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "supplier"
        ordering = ["supplier_name"]

    def __str__(self):
        return self.supplier_name