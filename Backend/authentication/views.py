from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from rest_framework.views import APIView # Import APIView
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, PublicParentRegistrationSerializer # Import new serializer
from .permissions import IsSuperAdmin, IsAdmin
import logging

logger = logging.getLogger(__name__)

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
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access

    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        logger.info("Login attempt with email: %s", request.data.get('email'))
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(email=request.data.get('email'))
            response.data.update({
                "role": user.role,
                "first_name": user.first_name,
                "last_name": user.last_name
            })
        else:
            logger.warning("Login failed for email: %s", request.data.get('email'))
        return response


class PublicParentRegisterView(APIView):
    """
    Allows public registration for users with the 'PARENT' role.
    Requires child's admission number to link the parent to the student.
    """
    permission_classes = [permissions.AllowAny]  # Allow anyone to access this view

    def post(self, request, *args, **kwargs):
        serializer = PublicParentRegistrationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Parent account created successfully. Please log in.",
                "user_id": user.id,
                "email": user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    """
    Returns the details of the currently authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        logger.info("CurrentUserView accessed by user: %s", request.user)
        if not request.user:
            logger.warning("No authenticated user found in request.")
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role
        }, status=status.HTTP_200_OK)


class TeacherRegisterView(APIView):
    """
    Allows registration for users with the 'TEACHER' role.
    """
    permission_classes = [permissions.AllowAny]  # Allow anyone to access this view

    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        data['role'] = 'TEACHER'  # Force the role to be 'TEACHER'
        serializer = UserSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Teacher account created successfully. Please log in.",
                "user_id": user.id,
                "email": user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterUserView(APIView):
    """
    Allows unauthenticated users to register as admins.
    """
    permission_classes = [permissions.AllowAny]  # Allow anyone to access this view

    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Admin account created successfully.",
                "user_id": user.id,
                "email": user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
