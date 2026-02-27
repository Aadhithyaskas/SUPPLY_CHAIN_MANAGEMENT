from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .serializers import UserRegistrationSerializer

<<<<<<< HEAD
# from .models import Zone
from .serializers import ZoneSerializer
from .permissions import IsFounder


class AuthViewSet(viewsets.ViewSet):
    """
    Handles login
    """

    @action(detail=False, methods=["post"])
    def login(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "token": token.key,
            "role": user.role.name if user.role else None,
            "username": user.username
        })


# class ZoneViewSet(viewsets.ModelViewSet):
#     queryset = Zone.objects.all()
#     serializer_class = ZoneSerializer
#     permission_classes = [IsAuthenticated, IsFounder]

#     def perform_create(self, serializer):
#         serializer.save(created_by=self.request.user)
=======
@api_view(["POST"])
@permission_classes([AllowAny]) # Anyone can register
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "User registered successfully"}, 
            status=status.HTTP_201_CREATED
        )
    
    # Returns structured errors (e.g. {"username": ["Already exists"]}) to React
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
>>>>>>> f8f42d08ea32b8d47df291409f1ccdb95f990d4d
