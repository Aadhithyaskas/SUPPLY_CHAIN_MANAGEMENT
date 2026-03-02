from django.contrib.auth import get_user_model, authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Role, UserRole
from django.utils import timezone
from .models import OTP
from .services import send_otp_email
from .serializers import RegisterSerializer
from .serializers import LoginSerializer,ResetPasswordSerializer,ResetPasswordSerializer
from django.contrib.auth import authenticate, login
User = get_user_model()


# class RegisterView(APIView):
    # def post(self, request):
    #     username = request.data.get("username")
    #     password = request.data.get("password")
    #     role_name = request.data.get("role")

    #     if not username or not password or not role_name:
    #         return Response(
    #             {"error": "Username, password and role are required"},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )

    #     if User.objects.filter(username=username).exists():
    #         return Response(
    #             {"error": "User already exists"},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )

    #     role, created = Role.objects.get_or_create(name=role_name)

    #     user = User.objects.create_user(
    #         username=username,
    #         password=password
    #     )

    #     UserRole.objects.create(user=user, role=role)

    #     return Response(
    #         {"message": "User registered successfully"},
    #         status=status.HTTP_201_CREATED
    #     )
class VerifyRegisterOTPView(APIView):

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        data = serializer.validated_data

        otp = OTP.objects.filter(
            email=data["email"],
            otp_code=data["otp"],
            purpose="REGISTER",
            is_used=False
        ).last()

        if not otp:
            return Response({"error": "Invalid OTP"}, status=400)

        if otp.is_expired():
            return Response({"error": "OTP expired"}, status=400)

        otp.is_used = True
        otp.save()

        role, _ = Role.objects.get_or_create(name=data["role"])

        user = User.objects.create_user(
            username=data["username"],
            email=data["email"],
            password=data["password"]
        )

        UserRole.objects.create(user=user, role=role)

        # ✅ Session Login
        login(request, user)

        return Response({"message": "User registered successfully"})

class LoginView(APIView):

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(username=username, password=password)

        if not user:
            return Response({"error": "Invalid credentials"}, status=401)

        login(request, user)

        return Response({"message": "Login successful"})

class SendRegisterOTPView(APIView):

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email required"}, status=400)

        send_otp_email(email, "REGISTER")
        return Response({"message": "OTP sent"})


class VerifyRegisterOTPView(APIView):

    def post(self, request):
        email = request.data.get("email")
        otp_code = request.data.get("otp")
        username = request.data.get("username")
        password = request.data.get("password")
        role_name = request.data.get("role")

        otp = OTP.objects.filter(
            email=email,
            otp_code=otp_code,
            purpose="REGISTER",
            is_used=False
        ).last()

        if not otp:
            return Response({"error": "Invalid OTP"}, status=400)

        if otp.is_expired():
            return Response({"error": "OTP expired"}, status=400)

        otp.is_used = True
        otp.save()

        role, _ = Role.objects.get_or_create(name=role_name)

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email
        )

        UserRole.objects.create(user=user, role=role)

        return Response({"message": "User registered successfully"})

class ForgotPasswordOTPView(APIView):

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]

        if not User.objects.filter(email=email).exists():
            return Response({"error": "User not found"}, status=404)

        send_otp_email(email, "RESET_PASSWORD")

        return Response({"message": "OTP sent for password reset"})

class ResetPasswordView(APIView):

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        data = serializer.validated_data

        otp = OTP.objects.filter(
            email=data["email"],
            otp_code=data["otp"],
            purpose="RESET_PASSWORD",
            is_used=False
        ).last()

        if not otp:
            return Response({"error": "Invalid OTP"}, status=400)

        if otp.is_expired():
            return Response({"error": "OTP expired"}, status=400)

        user = User.objects.get(email=data["email"])
        user.set_password(data["new_password"])
        user.save()

        otp.is_used = True
        otp.save()

        return Response({"message": "Password reset successful"})
