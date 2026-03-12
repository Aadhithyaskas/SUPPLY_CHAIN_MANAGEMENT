
from django.db import models
from vendors.models import Vendor
from supplier.models import Supplier

class Product(models.Model):

    product_id = models.CharField(max_length=10, primary_key=True, editable=False)

    product_name = models.CharField(max_length=255)
    sku_code = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    category = models.CharField(max_length=100)

    quantity = models.IntegerField()

    ABC = models.CharField(max_length=1)
    VED = models.CharField(max_length=1)
    XYZ = models.CharField(max_length=1)

    unit_price = models.IntegerField()
    re_order = models.IntegerField()

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 🔹 Correct relationship
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE
    )

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE
    )
    def save(self, *args, **kwargs):

        if not self.product_id:
            last_product = Product.objects.order_by('product_id').last()

            if last_product:
                last_id = int(last_product.product_id[3:])
                new_id = last_id + 1
            else:
                new_id = 1

            self.product_id = f"PRO{new_id:03d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return self.product_id