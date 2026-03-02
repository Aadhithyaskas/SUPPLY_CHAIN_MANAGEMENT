from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

class Role(models.Model):

    ROLE_CHOICES = (
        ("inventory_manager", "Inventory Manager"),
        ("quality_assistant", "Quality Assistant"),
        ("admin", "Admin"),
        ("manager", "Manager"),
        ("supervisor","Supervisor")
    )

    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)

    def __str__(self):
        return self.get_name_display()



class Permission(models.Model):
    ACTION_CHOICES = (
        ("create", "Create"),
        ("read", "Read"),
        ("update", "Update"),
        ("delete", "Delete"),
    )

    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    model_name = models.CharField(max_length=100)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)

    def __str__(self):
        return f"{self.role.name} - {self.model_name} - {self.action}"


class UserRole(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.role.name}"
    
    

User = get_user_model()

class OTP(models.Model):

    PURPOSE_CHOICES = (
        ("REGISTER", "Register"),
        ("RESET_PASSWORD", "Reset Password"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    expiry_time = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.expiry_time

    def __str__(self):
        return f"{self.email} - {self.purpose}"