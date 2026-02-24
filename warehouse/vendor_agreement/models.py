from django.db import models
from django.utils import timezone


class AgreementMaster(models.Model):

    AGREEMENT_TYPE = [
        ('SUPPLY', 'Supply'),
        ('SERVICE', 'Service'),
        ('STRATEGIC', 'Strategic'),
    ]

    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('ACTIVE', 'Active'),
        ('EXPIRED', 'Expired'),
        ('TERMINATED', 'Terminated'),
    ]

    agreement_id = models.CharField(max_length=100, unique=True)
    vendor = models.ForeignKey('vendor_agreement.Vendor', on_delete=models.CASCADE)
    agreement_type = models.CharField(max_length=20, choices=AGREEMENT_TYPE)

    effective_date = models.DateField()
    expiry_date = models.DateField()

    renewal_terms = models.TextField(blank=True)
    termination_clause = models.TextField(blank=True)
    governing_law = models.CharField(max_length=200)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')

    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return self.expiry_date < timezone.now().date()

    def save(self, *args, **kwargs):
        if self.is_expired():
            self.status = 'EXPIRED'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.agreement_id
    
class CommercialTerms(models.Model):

    agreement = models.OneToOneField(
        'vendor_agreement.AgreementMaster',
        on_delete=models.CASCADE,
        related_name='commercial_terms'
    )

    currency = models.CharField(max_length=10)
    tax_applicable = models.BooleanField(default=True)
    incoterms = models.CharField(max_length=50)
    freight_responsibility = models.CharField(max_length=100)
    insurance_responsibility = models.CharField(max_length=100)

class PricingSlab(models.Model):

    commercial_terms = models.ForeignKey(
        CommercialTerms,
        on_delete=models.CASCADE,
        related_name='pricing_slabs'
    )

    min_quantity = models.IntegerField()
    max_quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)

class PaymentTerms(models.Model):

    agreement = models.OneToOneField(
        'vendor_agreement.AgreementMaster',
        on_delete=models.CASCADE,
        related_name='payment_terms'
    )

    payment_term_days = models.IntegerField()
    advance_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    partial_settlement_allowed = models.BooleanField(default=True)
    credit_period_days = models.IntegerField()
    late_payment_interest = models.DecimalField(max_digits=5, decimal_places=2)
    refund_timeline_days = models.IntegerField()

class DeliveryTerms(models.Model):

    agreement = models.OneToOneField(
        'vendor_agreement.AgreementMaster',
        on_delete=models.CASCADE,
        related_name='delivery_terms'
    )

    delivery_window_start = models.TimeField()
    delivery_window_end = models.TimeField()

    expected_lead_time_days = models.IntegerField()
    delay_penalty_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    partial_shipment_allowed = models.BooleanField(default=True)
    asn_mandatory = models.BooleanField(default=True)

class QATerms(models.Model):

    agreement = models.OneToOneField(
        'vendor_agreement.AgreementMaster',
        on_delete=models.CASCADE,
        related_name='qa_terms'
    )

    qa_certificate_required = models.BooleanField(default=False)
    certification_type = models.CharField(max_length=200, blank=True)
    inspection_level = models.CharField(max_length=100)
    quarantine_required = models.BooleanField(default=True)
    holding_cost_per_pallet_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    rtv_allowed = models.BooleanField(default=True)

class WarrantyTerms(models.Model):

    agreement = models.OneToOneField(
        'vendor_agreement.AgreementMaster',
        on_delete=models.CASCADE,
        related_name='warranty_terms'
    )

    warranty_period_days = models.IntegerField()
    replacement_timeline_days = models.IntegerField()
    freight_responsibility = models.CharField(max_length=100)
    scrap_responsibility = models.CharField(max_length=100)
    claim_settlement_days = models.IntegerField()

class ComplianceTerms(models.Model):

    agreement = models.OneToOneField(
        'vendor_agreement.AgreementMaster',
        on_delete=models.CASCADE,
        related_name='compliance_terms'
    )

    gst_compliance_required = models.BooleanField(default=True)
    tds_applicable = models.BooleanField(default=False)
    import_export_compliance = models.BooleanField(default=False)
    insurance_document_required = models.BooleanField(default=True)
    audit_rights_clause = models.BooleanField(default=True)

class AgreementDocument(models.Model):

    agreement = models.ForeignKey(
        'vendor_agreement.AgreementMaster',
        on_delete=models.CASCADE,
        related_name='documents'
    )

    version = models.IntegerField()
    document = models.FileField(upload_to="agreements/")
    signed = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

class PerformanceTerms(models.Model):

    agreement = models.OneToOneField(
        'vendor_agreement.AgreementMaster',
        on_delete=models.CASCADE,
        related_name='performance_terms'
    )

    sla_on_time_delivery_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    warning_threshold = models.DecimalField(max_digits=5, decimal_places=2)
    suspension_threshold = models.DecimalField(max_digits=5, decimal_places=2)
    penalty_percentage = models.DecimalField(max_digits=5, decimal_places=2)