from django import forms
from .models import Supplier


class SupplierForm(forms.ModelForm):

    class Meta:
        model = Supplier

        fields = [
            "supplier_name",
            "contact_personname",
            "email",
            "phone",
            "address",
            "city",
            "state",
            "country",
            "is_active"
        ]