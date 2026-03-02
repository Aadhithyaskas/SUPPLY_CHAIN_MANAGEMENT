from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Role, Permission


@receiver(post_save, sender=Role)
def assign_default_permissions(sender, instance, created, **kwargs):

    if not created:
        return

    if instance.name == "inventory_manager":
        for action in ["create", "read", "update", "delete"]:
            Permission.objects.create(
                role=instance,
                model_name="inventory",
                action=action
            )

    elif instance.name == "quality_assistant":
        Permission.objects.create(
            role=instance,
            model_name="quality",
            action="read"
        )
