from django.contrib import admin
from .models import Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):

    list_display = (
        "supplier_name",
        "contact_personname",
        "email",
        "phone",
        "city",
        "country",
        "is_active",
    )

    search_fields = (
        "supplier_name",
        "email",
        "phone",
    )

    list_filter = (
        "city",
        "country",
        "is_active",
    )