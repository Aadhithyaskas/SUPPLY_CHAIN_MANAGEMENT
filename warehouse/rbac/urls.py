from django.urls import path
from .views import SendRegisterOTPView,VerifyRegisterOTPView, LoginView

urlpatterns = [
    path('send-register-otp/', SendRegisterOTPView.as_view(), name='send-register-otp'),
    path('verify-register-otp/', VerifyRegisterOTPView.as_view(), name='verify-register-otp'),
    path('login/', LoginView.as_view(), name='login'),
]
