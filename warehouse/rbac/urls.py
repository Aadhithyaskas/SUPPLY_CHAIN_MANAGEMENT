from django.urls import path
from .views import (
    SendRegisterOTPView,
    VerifyRegisterOTPView,
    LoginView,
    ForgotPasswordOTPView,
    ResetPasswordView,
)

urlpatterns = [
    # 🔐 Registration
    path('send-register-otp/', SendRegisterOTPView.as_view(), name='send-register-otp'),
    path('verify-register-otp/', VerifyRegisterOTPView.as_view(), name='verify-register-otp'),

    # 🔑 Login
    path('login/', LoginView.as_view(), name='login'),

    # 🔁 Forgot Password
    path('forgot-password-otp/', ForgotPasswordOTPView.as_view(), name='forgot-password-otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
]
