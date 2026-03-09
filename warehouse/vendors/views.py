from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings

from .models import Vendor, Warehouse
from .serializers import VendorSerializer


# ==============================
# CREATE WAREHOUSE (ONLY ONE)
# ==============================

class CreateWarehouse(APIView):

    def post(self, request):

        if Warehouse.objects.exists():
            return Response(
                {"error": "Warehouse already exists. Only one warehouse allowed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = request.data

        warehouse = Warehouse.objects.create(
            warehouse_name=data.get("warehouse_name"),
            warehouse_email=data.get("warehouse_email"),
            warehouse_phone=data.get("warehouse_phone"),
            address=data.get("address")
        )

        return Response({
            "message": "Warehouse created successfully",
            "warehouse_id": warehouse.warehouse_id
        }, status=status.HTTP_201_CREATED)


# ==============================
# UPDATE WAREHOUSE
# ==============================

class UpdateWarehouse(APIView):

    def put(self, request):

        warehouse = Warehouse.objects.first()

        if not warehouse:
            return Response(
                {"error": "Warehouse not created yet"},
                status=status.HTTP_404_NOT_FOUND
            )

        data = request.data

        warehouse.warehouse_name = data.get(
            "warehouse_name", warehouse.warehouse_name
        )

        warehouse.warehouse_email = data.get(
            "warehouse_email", warehouse.warehouse_email
        )

        warehouse.warehouse_phone = data.get(
            "warehouse_phone", warehouse.warehouse_phone
        )

        warehouse.address = data.get(
            "address", warehouse.address
        )

        warehouse.save()

        return Response({
            "message": "Warehouse updated successfully"
        })


# ==============================
# CREATE VENDOR
# ==============================

class CreateVendorView(APIView):

    def post(self, request):

        warehouse = Warehouse.objects.first()

        if not warehouse:
            return Response(
                {"error": "Please create warehouse first"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = VendorSerializer(data=request.data)

        if serializer.is_valid():

            vendor = serializer.save(warehouse=warehouse)

            subject = "Welcome to Our Warehouse Management System"

            message = f"""
Hello {vendor.vendor_name},

You have been successfully registered as a Vendor.

Vendor Details
--------------
Vendor ID: {vendor.vendor_id}
Vendor Name: {vendor.vendor_name}
Lead Time: {vendor.lead_time} days

Warehouse Details
-----------------
Warehouse Name: {warehouse.warehouse_name}
Warehouse Email: {warehouse.warehouse_email}
Warehouse Phone: {warehouse.warehouse_phone}
Address: {warehouse.address}

Thank You
WMS Team
"""

            if vendor.email:
                send_mail(
                    subject,
                    message,
                    settings.EMAIL_HOST_USER,
                    [vendor.email],
                    fail_silently=True
                )

            return Response({
                "message": "Vendor created successfully",
                "vendor_id": vendor.vendor_id
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==============================
# LIST VENDORS
# ==============================

class ListVendorView(APIView):

    def get(self, request):

        vendors = Vendor.objects.all().order_by("lead_time")

        serializer = VendorSerializer(vendors, many=True)

        return Response(serializer.data)


# ==============================
# GET SINGLE VENDOR
# ==============================

class GetVendorView(APIView):

    def get(self, request, vendor_id):

        vendor = get_object_or_404(Vendor, vendor_id=vendor_id)

        serializer = VendorSerializer(vendor)

        return Response(serializer.data)


# ==============================
# UPDATE VENDOR
# ==============================

class UpdateVendor(APIView):

    def put(self, request, vendor_id):

        vendor = get_object_or_404(Vendor, vendor_id=vendor_id)

        serializer = VendorSerializer(
            vendor,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response({
                "message": "Vendor updated successfully"
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==============================
# DELETE VENDOR
# ==============================

class DeleteVendor(APIView):

    def delete(self, request, vendor_id):

        vendor = get_object_or_404(Vendor, vendor_id=vendor_id)

        vendor.delete()

        return Response({
            "message": "Vendor deleted successfully"
        }, status=status.HTTP_200_OK)