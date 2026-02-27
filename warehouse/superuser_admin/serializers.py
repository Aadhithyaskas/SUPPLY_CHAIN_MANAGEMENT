from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="role.name", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "employee_id", "role"]

