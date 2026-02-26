from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .serializers import UserRegistrationSerializer

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