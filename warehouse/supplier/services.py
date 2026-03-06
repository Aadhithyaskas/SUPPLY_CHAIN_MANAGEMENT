from .models import Supplier


class SupplierService:

    @staticmethod
    def create_supplier(data):
        return Supplier.objects.create(**data)

    @staticmethod
    def get_supplier_by_id(supplier_id):
        return Supplier.objects.filter(
            supplier_id=supplier_id,
            is_active=True
        ).first()

    @staticmethod
    def get_suppliers():
        return Supplier.objects.filter(is_active=True)

    @staticmethod
    def update_supplier(supplier, data):
        for field, value in data.items():
            setattr(supplier, field, value)

        supplier.save()
        return supplier

    @staticmethod
    def deactivate_supplier(supplier):
        supplier.is_active = False
        supplier.save()