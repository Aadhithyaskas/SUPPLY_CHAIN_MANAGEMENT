from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.core.mail import send_mail
from django.conf import settings

from .models import Supplier
from .serializers import SupplierSerializer


class CreateSupplierView(APIView):

    def post(self, request):

        serializer = SupplierSerializer(data=request.data)

        if serializer.is_valid():

            supplier = serializer.save()

            subject = "Welcome to Warehouse Management System"

            message = f"""
Hello {supplier.contact_personname},

Your organization {supplier.supplier_name} has been registered
as a supplier in our Warehouse Management System.

Contact us when products are required.

Warehouse Team
"""

            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [supplier.email],
                fail_silently=False
            )

            return Response(
                {"message": "Supplier created and email sent successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# UPDATE SUPPLIER
class UpdateSupplierView(APIView):

    def put(self, request, pk):

        try:
            supplier = Supplier.objects.get(pk=pk)
        except Supplier.DoesNotExist:
            return Response(
                {"error": "Supplier not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SupplierSerializer(supplier, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Supplier updated successfully", "data": serializer.data}
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# DELETE SUPPLIER
class DeleteSupplierView(APIView):

    def delete(self, request, pk):

        try:
            supplier = Supplier.objects.get(pk=pk)
        except Supplier.DoesNotExist:
            return Response(
                {"error": "Supplier not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        supplier.delete()

        return Response(
            {"message": "Supplier deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )

# VIEW ALL SUPPLIERS
class ListSupplierView(APIView):

    def get(self, request):

        suppliers = Supplier.objects.all().order_by("supplier_code")

        serializer = SupplierSerializer(suppliers, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)



# VIEW SINGLE SUPPLIER
class SupplierDetailView(APIView):

    def get(self, request, pk):

        try:
            supplier = Supplier.objects.get(pk=pk)
        except Supplier.DoesNotExist:
            return Response(
                {"error": "Supplier not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SupplierSerializer(supplier)

        return Response(serializer.data, status=status.HTTP_200_OK)