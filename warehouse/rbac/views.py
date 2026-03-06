from django.contrib.auth import get_user_model, authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Role, UserRole
from django.utils import timezone
from .models import OTP
from django.utils.timezone import now
# from vendors.models import Vendor
from .models import LoginLogs
from .services import send_otp_email
from .serializers import RegisterSerializer
from .serializers import LoginSerializer,ResetPasswordSerializer,ResetPasswordSerializer,ForgotPasswordSerializer
from django.contrib.auth import authenticate, login
from .services import generate_random_password
from django.core.mail import send_mail
# from rest_framework.permissions import IsAuthenticated
User = get_user_model()

class LogoutView(APIView):

    def post(self, request):

        log = LoginLogs.objects.filter(
            user=request.user,
            login_status=True
        ).last()

        if log:
            log.logout_time = now()
            log.save()

        return Response(
            {"message": "Logged out successfully"},
            status=status.HTTP_200_OK
        )
        
class ListEmployeeView(APIView):
    def get(self, request):
        # Fetch UserRoles to get access to both User and Employee ID
        # select_related avoids the "N+1" database query problem
        employees = UserRole.objects.select_related('user', 'role').all()
        
        data = []
        for emp in employees:
            data.append({
                "id": emp.user.id,
                "employee_id": emp.employee_id,
                "username": emp.user.username,
                "email": emp.user.email,
                "role": emp.role.name,
                "is_first_login": emp.is_first_login
            })

        return Response(data, status=status.HTTP_200_OK)
class UpdateEmployeeView(APIView):
    def put(self, request, employee_id):
        try:
            # 1. Find the UserRole object
            user_role = UserRole.objects.select_related('user').get(employee_id=employee_id)
            user = user_role.user
            
            # 2. Extract data from request
            new_username = request.data.get("username", user.username)
            new_email = request.data.get("email", user.email)
            new_role_name = request.data.get("role")

            # 3. Update User model fields
            user.username = new_username
            user.email = new_email
            user.save()

            # 4. Update Role if provided
            if new_role_name:
                role_obj, _ = Role.objects.get_or_create(name=new_role_name)
                user_role.role = role_obj
                user_role.save()

            return Response({
                "message": f"Employee {employee_id} updated successfully",
                "employee_id": employee_id
            }, status=status.HTTP_200_OK)

        except UserRole.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)
        
class DeleteUserView(APIView):
    
    def delete(self, request, employee_id):

        try:
            userrole = UserRole.objects.get(employee_id=employee_id)
            user = userrole.user

            user.delete()

            return Response(
                {"message": "User deleted successfully"},
                status=200
            )

        except UserRole.DoesNotExist:
            return Response(
                {"error": "Employee not found"},
                status=404
            )



class AdminCreateUserView(APIView):
    
    def post(self, request):

        username = request.data.get("username")
        email = request.data.get("email")
        role_name = request.data.get("role")

        # Validation
        if not username or not email or not role_name:
            return Response({"error": "All fields required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

        # Logic
        password = generate_random_password()
        role, _ = Role.objects.get_or_create(name=role_name)

        last_user = User.objects.order_by('-id').first()
        next_id = last_user.id + 1 if last_user else 1
        custom_id = f"EMP{next_id:04d}"

        # Create User
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # Create UserRole
        user_role = UserRole.objects.create(
            employee_id=custom_id,
            user=user,
            role=role,
            is_first_login=True
        )

        # Send Email
        send_mail(
            subject="Your Account Password",
            message=f"Your login password is: {password} and your Employee ID is: {user_role.employee_id}",
            from_email=None,
            recipient_list=[email],
        )

        # Response
        return Response({
            "message": "User created and password sent",
            "employee_id": user_role.employee_id
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    # Fixed: get_client_ip must take 'self' if it's inside the class, 
    # OR be a staticmethod. I'll make it a staticmethod for easier access.
    @staticmethod
    def get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        # UPDATED: Getting email instead of username
        email = serializer.validated_data.get("email")
        password = serializer.validated_data.get("password")
        user_id = serializer.validated_data.get("user_id")

        # 1. Identify user by email
        try:
           user_obj = User.objects.get(id=user_id, email=email)
        except User.DoesNotExist:
           return Response({"error": "Invalid credentials"}, status=401)


        # 2. Authenticate using the username associated with that email
        user = authenticate(username=user_obj.username, password=password)

        if not user:
            return Response({"error": "Invalid credentials"}, status=401)

        # Logic remains the same: Send OTP, don't login yet
        send_otp_email(user.email, "LOGIN")
        
        # Fixed: Call static method using class name or self
        ip = self.get_client_ip(request)
        device = request.META.get('HTTP_USER_AGENT')

        # Log the login attempt
        LoginLogs.objects.create(
            user=user,
            ip_address=ip,
            device_info=device,
            login_status=False # Should be False until OTP is verified
        )

        return Response({
             "message": "OTP sent",
             "email": email,
             "user_id": user.id
})

class VerifyLoginOTPView(APIView):
    
    def post(self, request):

        user_id = request.data.get("user_id")
        otp_code = request.data.get("otp")

        if not user_id or not otp_code:
            return Response({"error": "user_id and otp required"}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        otp = OTP.objects.filter(
            email=user.email,
            otp_code=otp_code,
            purpose="LOGIN",
            is_used=False
        ).order_by("-created_at").first()

        if not otp:
            return Response({"error": "Invalid OTP"}, status=400)

        if otp.is_expired():
            return Response({"error": "OTP expired"}, status=400)

        otp.is_used = True
        otp.save()

        login(request, user)

        # Update login log
        log = LoginLogs.objects.filter(
    user=user,
    login_status=False
).last()


        if log:
            log.login_status = True
            log.save()

        user_role = UserRole.objects.get(user=user)

        return Response({
            "message": "Login successful",
            "force_change_password": user_role.is_first_login
        })
        
class ForceChangePasswordView(APIView):
    # permission_classes = [IsAuthenticated]
    def post(self, request):

        if not request.user.is_authenticated:
            return Response({"error": "Not authenticated"}, status=401)

        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if new_password != confirm_password:
            return Response({"error": "Passwords do not match"}, status=400)

        request.user.set_password(new_password)
        request.user.save()

        user_role = UserRole.objects.get(user=request.user)
        user_role.is_first_login = False
        user_role.save()

        return Response({"message": "Password changed successfully"})


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
