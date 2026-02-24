from django.core.exceptions import ValidationError
from django.utils import timezone


def validate_agreement_for_po(agreement):
    if agreement.status == "TERMINATED":
        raise ValidationError("Vendor Agreement Terminated. PO cannot be created.")

    if agreement.expiry_date < timezone.now().date():
        raise ValidationError("Agreement Expired. PO cannot be created.")