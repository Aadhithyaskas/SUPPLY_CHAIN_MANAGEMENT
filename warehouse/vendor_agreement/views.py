from django.shortcuts import render

# Create your views here.
from .models import Product

# Adding a new record
new_product = Product.objects.create(
    name="Mechanical Keyboard",
    description="RGB backlit with blue switches",
    price=89.99
)
# Get all products
all_products = Product.objects.all()

# Get a single product by ID
product = Product.objects.get(id=1)

# Filter products
expensive_items = Product.objects.filter(price__gt=50.00)
# Remove a record
product = Product.objects.get(id=1)
product.delete()