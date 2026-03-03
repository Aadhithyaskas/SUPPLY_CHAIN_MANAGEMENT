from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings

from .models import Vendor
from .serializers import VendorSerializer


class CreateVendorView(APIView):

    def post(self, request):

        serializer = VendorSerializer(data=request.data)

        if serializer.is_valid():
            vendor = serializer.save()

            # Fetch warehouse details
            warehouse = vendor.warehouse

            subject = "Welcome to Our Warehouse Management System"

            message = f"""
Hello {vendor.vendor_name},

You have been successfully registered as a Vendor.

Vendor Details:
---------------
Vendor Name: {vendor.vendor_name}
Lead Time: {vendor.lead_time} days

Warehouse Details:
------------------
Warehouse Name: {warehouse.warehouse_name}
Address: {warehouse.address}

Inventory Manager:
------------------
Name: {warehouse.inventory_manager_name}
Phone: {warehouse.inventory_manager_phone}


Thank You,
WMS Team
"""

            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [vendor.email],
                fail_silently=False,
            )

            return Response(
                {"message": "Vendor created and invitation email sent successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)