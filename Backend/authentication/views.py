from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from rest_framework.views import APIView # Import APIView
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, PublicParentRegistrationSerializer # Import new serializer
from .permissions import IsSuperAdmin, IsAdmin

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        elif self.action in ['list', 'retrieve']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [IsSuperAdmin]
        return [permission() for permission in permission_classes]

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class PublicParentRegisterView(APIView):
    """
    Allows public registration for users with the 'PARENT' role.
    Requires child's admission number to link the parent to the student.
    """
    permission_classes = [permissions.AllowAny] # Allow anyone to access this view

    def post(self, request, *args, **kwargs):
        serializer = PublicParentRegistrationSerializer(data=request.data, context={'request': request}) # Pass context
        if serializer.is_valid():
            user = serializer.save()
            # Optionally return limited user data or just success
            return Response({
                "message": "Parent account created successfully. Please log in.",
                # "user_id": user.id, # Avoid sending sensitive info back
                # "email": user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
