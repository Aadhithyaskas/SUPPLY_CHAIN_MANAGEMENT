from rest_framework import serializers
from .models import User, Role

class UserRegistrationSerializer(serializers.ModelSerializer):
    # We define role as a choice/string to make React integration easier
    role_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'password', 'role_name', 
            'company_name', 'gstin', 'department', 'qualification'
        ]

    def validate(self, data):
        """
        Custom validation logic based on the Role.
        """
        role_name = data.get('role_name')
        
        # 1. Check if Role exists
        try:
            data['role_object'] = Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            raise serializers.ValidationError({"role": "This role does not exist."})

        # 2. Role-specific validation
        if role_name == "FOUNDER":
            if not data.get('company_name') or not data.get('gstin'):
                raise serializers.ValidationError(
                    {"error": "Founders must provide company_name and gstin."}
                )
        else:
            if not data.get('department') or not data.get('qualification'):
                raise serializers.ValidationError(
                    {"error": "Employees must provide department and qualification."}
                )
        
        return data

    def create(self, validated_data):
        """
        Create the user with the hashed password.
        """
        role = validated_data.pop('role_object')
        validated_data.pop('role_name') # Remove the string name
        
        user = User.objects.create_user(
            role=role,
            **validated_data
        )
        return user