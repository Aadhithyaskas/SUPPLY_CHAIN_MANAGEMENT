import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Supplier


# CREATE SUPPLIER
@csrf_exempt
def create_supplier(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            supplier = Supplier.objects.create(
                supplier_name=data.get("supplier_name"),
                contact_personname=data.get("contact_personname"),
                email=data.get("email"),
                phone=data.get("phone"),
                address=data.get("address"),
                city=data.get("city"),
                state=data.get("state"),
                country=data.get("country"),
                is_active=data.get("is_active", True),
            )

            return JsonResponse({
                "message": "Supplier created successfully",
                "supplier_id": str(supplier.supplier_id)
            }, status=201)

        except Exception as e:
            return JsonResponse({
                "error": str(e)
            }, status=400)

    return JsonResponse({
        "error": "Invalid request method"
    }, status=405)


# GET ALL SUPPLIERS
def get_supplier(request):
    if request.method == "GET":

        supplier = list(
            Supplier.objects.all().values()
        )

        return JsonResponse({
            "supplier": supplier
        })

    return JsonResponse({"error": "Invalid request method"}, status=405)


# GET SINGLE SUPPLIER
def get_supplier_by_id(request, supplier_id):
    if request.method == "GET":
        try:
            supplier = Supplier.objects.values().get(
                supplier_id=supplier_id
            )

            return JsonResponse(supplier)

        except Supplier.DoesNotExist:
            return JsonResponse({
                "error": "Supplier not found"
            }, status=404)

    return JsonResponse({"error": "Invalid request method"}, status=405)


# UPDATE SUPPLIER
@csrf_exempt
def update_supplier(request, supplier_id):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)

            supplier = Supplier.objects.get(
                supplier_id=supplier_id
            )

            supplier.supplier_name = data.get(
                "supplier_name", supplier.supplier_name
            )

            supplier.contact_personname = data.get(
                "contact_personname", supplier.contact_personname
            )

            supplier.email = data.get(
                "email", supplier.email
            )

            supplier.phone = data.get(
                "phone", supplier.phone
            )

            supplier.address = data.get(
                "address", supplier.address
            )

            supplier.city = data.get(
                "city", supplier.city
            )

            supplier.state = data.get(
                "state", supplier.state
            )

            supplier.country = data.get(
                "country", supplier.country
            )

            supplier.is_active = data.get(
                "is_active", supplier.is_active
            )

            supplier.save()

            return JsonResponse({
                "message": "Supplier updated successfully"
            })

        except Supplier.DoesNotExist:
            return JsonResponse({
                "error": "Supplier not found"
            }, status=404)

        except Exception as e:
            return JsonResponse({
                "error": str(e)
            }, status=400)

    return JsonResponse({
        "error": "Invalid request method"
    }, status=405)


# DELETE SUPPLIER
@csrf_exempt
def delete_supplier(request, supplier_id):
    if request.method == "DELETE":
        try:
            supplier = Supplier.objects.get(
                supplier_id=supplier_id
            )

            supplier.delete()

            return JsonResponse({
                "message": "Supplier deleted successfully"
            })

        except Supplier.DoesNotExist:
            return JsonResponse({
                "error": "Supplier not found"
            }, status=404)

    return JsonResponse({
        "error": "Invalid request method"
    }, status=405)