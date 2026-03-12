from django.db.models import Sum
from .models import Inventory, PurchaseRequest


def check_reorder(product):

    total_stock = Inventory.objects.filter(
        product=product
    ).aggregate(total=Sum('quantity'))['total'] or 0

    reorder_point = product.re_order

    if total_stock <= reorder_point:

        PurchaseRequest.objects.create(
            product=product,
            requested_quantity=reorder_point * 2
        )
