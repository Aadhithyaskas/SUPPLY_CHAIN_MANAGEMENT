from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Role, UserRole, OTP, WMSAdmin
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField()
    otp = serializers.CharField()


class LoginSerializer(serializers.Serializer):
    user_id = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True)
    employee_id = serializers.CharField(required=False)
    admin_id = serializers.CharField(required=False)


class AdminLoginSerializer(serializers.Serializer):         # ✅ Added
    admin_id = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()
    new_password = serializers.CharField(write_only=True)


class WMSAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = WMSAdmin
        fields = ['username', 'email', 'password', 'role', 'admin_id']
        read_only_fields = ['admin_id']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):                        # ✅ Moved outside Meta
        password = validated_data.pop('password')
        admin = WMSAdmin(**validated_data)
        admin.set_password(password)
        admin.save()
        return admin


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        if hasattr(user, 'user_role'):
            token['role'] = user.user_role.role.name
            token['employee_id'] = user.user_role.employee_id
            token['is_first_login'] = user.user_role.is_first_login

        token['email'] = user.email

        return token
