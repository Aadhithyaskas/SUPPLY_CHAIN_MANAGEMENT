from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        "product_id",
        "product_name",
        "brand_name",
        "sku_code",
        "category",
        "quantity",
        "unit_price",
        "re_order",
        "is_active"
    )

    search_fields = (
        "product_name",
        "sku_code",
        "brand_name"
    )

    list_filter = (
        "category",
        "is_active"
    )

    readonly_fields = (
        "product_id",
        "sku_code",
        "created_at",
        "updated_at"
    )
