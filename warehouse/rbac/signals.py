from django.db.models.signals import post_save, post_migrate
from django.dispatch import receiver
from django.apps import apps
from .models import Role, Permission


@receiver(post_save, sender=Role)
def assign_default_permissions(sender, instance, created, **kwargs):

    if not created:
        return

    if instance.name == "inventory_manager":
        for action in ["create", "read", "update", "delete"]:
            Permission.objects.get_or_create(
                role=instance,
                model_name="inventory",
                action=action
            )

    elif instance.name == "quality_assistant":
        Permission.objects.get_or_create(
            role=instance,
            model_name="quality",
            action="read"
        )


@receiver(post_migrate)
def create_founder_admin(sender, **kwargs):

    User = apps.get_model("auth", "User")
    Role = apps.get_model("rbac", "Role")
    UserRole = apps.get_model("rbac", "UserRole")

    if not Role.objects.filter(name="admin").exists():
        role = Role.objects.create(name="admin")
    else:
        role = Role.objects.get(name="admin")

    if not User.objects.filter(username="founder_admin").exists():

        user = User.objects.create_user(
            username="founder_admin",
            email="admin@company.com",
            password="Admin@123"
        )

        UserRole.objects.create(
            user=user,
            role=role,
            employee_id="EMP0001",
            is_first_login=False
        )