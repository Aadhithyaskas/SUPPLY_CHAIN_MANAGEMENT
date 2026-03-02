from django.contrib.auth import get_user_model, authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Role, UserRole
from django.utils import timezone
from .models import OTP
from .services import send_otp_email


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

        # 🔥 Generate JWT Tokens
        refresh = RefreshToken.for_user(user)

        # Optional: include role in response
        try:
            user_role = UserRole.objects.get(user=user)
            role_name = user_role.role.name
        except UserRole.DoesNotExist:
            role_name = None

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "role": role_name
            },
            status=status.HTTP_200_OK
        )

class SendRegisterOTPView(APIView):

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email required"}, status=400)

        send_otp_email(email, "REGISTER")

        return Response({"message": "OTP sent to email"})

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

