from .models import UserRole, Permission


def has_permission(user, model_name, action):

    if not user.is_authenticated:
        return False

    try:
        user_role = UserRole.objects.get(user=user)
    except UserRole.DoesNotExist:
        return False

    return Permission.objects.filter(
        role=user_role.role,
        model_name=model_name,
        action=action
    ).exists()
