from django.db import models
from vendors.models import Vendor
from supplier.models import Supplier


class Product(models.Model):

    product_id = models.CharField(max_length=10, primary_key=True, editable=False)

    product_name = models.CharField(max_length=255)
    brand_name = models.CharField(max_length=100)

    # ✅ FIX: blank=True so empty string passes validation when user leaves it blank
    size = models.CharField(max_length=10, blank=True, default='')
    sku_code = models.CharField(max_length=100, unique=True, editable=False)

    # ✅ FIX: blank=True on TextField — description is optional
    description = models.TextField(blank=True, default='')

    category = models.CharField(max_length=100)

    # ✅ FIX: default=0 so quantity can be omitted from the form
    quantity = models.IntegerField(default=0)

    ABC = models.CharField(max_length=1)
    VED = models.CharField(max_length=1)
    XYZ = models.CharField(max_length=1)

    unit_price = models.IntegerField()
    re_order = models.IntegerField()

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    vendor = models.ForeignKey(
        "vendors.Vendor",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        null=True,   # ✅ FIX: allow null so supplier is truly optional
        blank=True,
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

        if not self.sku_code:
            brand_code = self.brand_name[:3].upper()
            product_code = ''.join([word[0] for word in self.product_name.split()]).upper()
            size_part = self.size.upper() if self.size else 'NA'
            self.sku_code = f"{brand_code}-{product_code}-{size_part}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product_name} ({self.product_id})"