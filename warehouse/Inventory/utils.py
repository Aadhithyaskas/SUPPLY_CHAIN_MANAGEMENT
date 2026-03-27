from django.db.models import Sum, F
from .models import Inventory, PurchaseRequest, Bin


def check_reorder(product):

    total_stock = Inventory.objects.filter(
        product=product
    ).aggregate(total=Sum("quantity"))["total"] or 0

    if total_stock <= product.re_order:

        existing_pr = PurchaseRequest.objects.filter(
            product=product,
            status="Pending"
        ).exists()

        if not existing_pr:
            reorder_qty = product.re_order * 2

            PurchaseRequest.objects.create(
                product=product,
                vendor=product.vendor,
                requested_quantity=reorder_qty,
                total_amount=reorder_qty * product.unit_price,  # ← explicit, not accidental
            )


def assign_bin(product, quantity):

    # Step 1: filter bins with available capacity
    bins = Bin.objects.filter(
        capacity__gt=F("current_load")  # ← F imported from django.db.models
    )

    if not bins.exists():
        raise Exception("No bins available")

    # Step 2: apply ABC logic
    if product.ABC == "A":
        bins = bins.order_by("distance_from_dispatch")   # nearest
    else:
        bins = bins.order_by("-distance_from_dispatch")  # farthest

    # Step 3: choose best bin
    return bins.first()