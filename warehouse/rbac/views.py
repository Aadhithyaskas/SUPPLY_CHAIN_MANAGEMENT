from django.contrib.auth import get_user_model, authenticate, login
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Role, UserRole

User = get_user_model()


class RegisterView(APIView):

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        role_name = request.data.get("role")

        # Validate fields
        if not username or not password or not role_name:
            return Response(
                {"error": "Username, password and role are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check existing user
        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "User already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 🔥 Safer role handling (no crash)
        role, created = Role.objects.get_or_create(name=role_name)

        # Create user properly (handles password hashing internally)
        user = User.objects.create_user(
            username=username,
            password=password
        )

        # Assign role
        UserRole.objects.create(user=user, role=role)

        return Response(
            {"message": "User registered successfully"},
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "Username and password required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        login(request, user)

        return Response(
            {"message": "Login successful"},
            status=status.HTTP_200_OK
        )
