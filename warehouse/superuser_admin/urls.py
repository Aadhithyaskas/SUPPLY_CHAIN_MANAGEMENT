from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthViewSet, ZoneViewSet

router = DefaultRouter()
router.register("zones", ZoneViewSet, basename="zones")

urlpatterns = [
    path("login/", AuthViewSet.as_view({"post": "login"}), name="login"),
    path("", include(router.urls)),
]
