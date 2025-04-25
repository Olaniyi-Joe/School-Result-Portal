from rest_framework import serializers, exceptions
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from myresult.models import Student # Import Student model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 'role')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data['role']
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['email'] = self.user.email
        data['first_name'] = self.user.first_name
        data['last_name'] = self.user.last_name
        return data


class PublicParentRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=30)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=30)
    child_admission_number = serializers.CharField(required=True, write_only=True)

    def validate_email(self, value):
        """Check if the email is already registered."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_child_admission_number(self, value):
        """Check if the admission number is valid and the student doesn't have a parent yet."""
        try:
            student = Student.objects.get(registration_number=value)
            if student.parent:
                raise serializers.ValidationError("This student is already linked to a parent account.")
            # Store the student instance for use in the create method
            self.context['student'] = student
        except Student.DoesNotExist:
            raise serializers.ValidationError("Invalid admission number.")
        return value

    def create(self, validated_data):
        student = self.context['student']
        child_admission_number = validated_data.pop('child_admission_number') # Remove before creating user

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    email=validated_data['email'],
                    password=validated_data['password'],
                    first_name=validated_data.get('first_name', ''),
                    last_name=validated_data.get('last_name', ''),
                    role='PARENT' # Explicitly set role to PARENT
                )
                # Link the student to the newly created parent
                student.parent = user
                student.save(update_fields=['parent'])
        except Exception as e:
             # Catch potential integrity errors or other issues during user/student update
             raise exceptions.APIException(f"Failed to create parent account: {e}")

        return user
