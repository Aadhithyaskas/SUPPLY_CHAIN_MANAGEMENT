import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .services import SupplierService


@csrf_exempt
def create_supplier(request):

    if request.method == "POST":

        try:

            data = json.loads(request.body)

            supplier = SupplierService.create_supplier(data)

            return JsonResponse({
                "message": "Supplier created successfully",
                "supplier_id": supplier.supplier_id
            }, status=201)

        except Exception as e:

            return JsonResponse({
                "error": str(e)
            }, status=400)


    return JsonResponse({"error": "Invalid method"}, status=405)



def get_all_suppliers(request):

    suppliers = SupplierService.get_all_suppliers()

    data = list(suppliers.values())

    return JsonResponse(data, safe=False)



def get_supplier_by_id(request, supplier_id):

    supplier = SupplierService.get_supplier_by_id(supplier_id)

    if supplier:

        return JsonResponse({
            "supplier_id": supplier.supplier_id,
            "supplier_name": supplier.supplier_name,
            "email": supplier.email
        })

    return JsonResponse({"error": "Supplier not found"}, status=404)



@csrf_exempt
def update_supplier(request, supplier_id):

    if request.method == "PUT":

        try:

            data = json.loads(request.body)

            supplier = SupplierService.get_supplier_by_id(supplier_id)

            if not supplier:
                return JsonResponse({"error": "Supplier not found"}, status=404)

            SupplierService.update_supplier(supplier, data)

            return JsonResponse({
                "message": "Supplier updated successfully"
            })

        except Exception as e:

            return JsonResponse({
                "error": str(e)
            }, status=400)

    return JsonResponse({"error": "Invalid method"}, status=405)



@csrf_exempt
def delete_supplier(request, supplier_id):

    if request.method == "DELETE":

        supplier = SupplierService.get_supplier_by_id(supplier_id)

        if not supplier:
            return JsonResponse({"error": "Supplier not found"}, status=404)

        SupplierService.delete_supplier(supplier)

        return JsonResponse({
            "message": "Supplier deleted successfully"
        })

    return JsonResponse({"error": "Invalid method"}, status=405)