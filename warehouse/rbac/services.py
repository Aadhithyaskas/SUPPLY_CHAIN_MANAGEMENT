from .models import UserRole, Permission


def has_permission(user, model_name, action):

    if not user.is_authenticated:
        return False

    # Superuser bypass (very important)
    if user.is_superuser:
        return True

    try:
        user_role = UserRole.objects.select_related("role").get(user=user)
    except UserRole.DoesNotExist:
        return False

    return Permission.objects.filter(
        role=user_role.role,
        model_name=model_name,
        action=action
    ).exists()
