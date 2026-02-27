# inventory/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser


class Role(models.Model):

    ROLE_CHOICES = [
        ("FOUNDER", "Founder"),
        ("MANAGER", "Manager"),
        ("SUPERVISOR", "Supervisor"),
        ("QUALITY_CHECKER", "Quality Checker"),
        ("INVENTORY_LOGGER", "Inventory Logger"),
    ]

    name = models.CharField(max_length=30, choices=ROLE_CHOICES, unique=True)

    def __str__(self):
        return self.name


class User(AbstractUser):  # ✅ MUST extend AbstractUser

    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)

    # Founder fields
    company_name = models.CharField(max_length=100, null=True, blank=True)
    gstin = models.CharField(max_length=20, null=True, blank=True)

    # Employee fields
    department = models.CharField(max_length=100, null=True, blank=True)
    qualification = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
<<<<<<< HEAD
        return f"{self.username} - {self.role.name if self.role else 'No Role'}"


# class Zone(models.Model):
#     ZONE_TYPES = [
#         ("COLD", "Cold"),
#         ("DRY", "Dry"),
#         ("HAZ", "Hazardous"),
#     ]

#     name = models.CharField(max_length=100)
#     zone_type = models.CharField(max_length=10, choices=ZONE_TYPES)
#     created_by = models.ForeignKey(User, on_delete=models.CASCADE)

#     def __str__(self):
#         return self.name
=======
        return f"{self.username} - {self.role}"
>>>>>>> f8f42d08ea32b8d47df291409f1ccdb95f990d4d
