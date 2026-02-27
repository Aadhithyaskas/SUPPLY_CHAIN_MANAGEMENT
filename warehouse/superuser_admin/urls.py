<<<<<<< HEAD
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthViewSet

router = DefaultRouter()
=======
# inventory/urls.py

from django.urls import path
from .views import register
>>>>>>> f8f42d08ea32b8d47df291409f1ccdb95f990d4d

urlpatterns = [
    path("register/", register, name="register"),
]
