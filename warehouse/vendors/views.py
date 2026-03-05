from django.shortcuts import get_object_or_404
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


class ListVendorView(APIView):

    def get(self, request):

        vendors = Vendor.objects.all().order_by('lead_time')

        serializer = VendorSerializer(vendors, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class DeleteVendor(APIView):

    def delete(self, request, pk):

        vendor = get_object_or_404(Vendor, pk=pk)

        vendor.delete()

        return Response(
            {"message": "Vendor deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )


class UpdateVendor(APIView):

    def put(self, request, pk):

        vendor = get_object_or_404(Vendor, pk=pk)

        serializer = VendorSerializer(vendor, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
