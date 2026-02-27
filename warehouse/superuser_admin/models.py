from django.db import models
from django.contrib.auth.models import AbstractUser

class Role(models.Model):
    FOUNDER = "FOUNDER"
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    SUPERVISOR = "SUPERVISOR"
    INV_LOGGER = "INV_LOGGER"
    FINANCE_DIR = "FINANCE_DIR"
    DISTRIBUTOR = "DISTRIBUTOR"
    VENDOR = "VENDOR"

    ROLE_CHOICES = [
        (FOUNDER, "Founder"),
        (ADMIN, "Admin"),
        (MANAGER, "Manager"),
        (SUPERVISOR, "Supervisor"),
        (INV_LOGGER, "Inventory Logger"),
        (FINANCE_DIR, "Finance Director"),
        (DISTRIBUTOR, "Distributor"),
        (VENDOR, "Vendor"),
    ]

    name = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)
    employee_id = models.CharField(max_length=50, unique=True)

    def __str__(self):
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
