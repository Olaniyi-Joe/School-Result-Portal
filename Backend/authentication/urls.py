from django.urls import path, include
from rest_framework.routers import SimpleRouter
from rest_framework_simplejwt.views import TokenRefreshView
# Import the new view
from .views import UserViewSet, CustomTokenObtainPairView, PublicParentRegisterView, CurrentUserView, TeacherRegisterView, RegisterUserView

router = SimpleRouter()  # Use SimpleRouter to avoid automatic trailing slash conflicts
router.register('users', UserViewSet)

urlpatterns = [
    path('users/me/', CurrentUserView.as_view(), name='current_user'),  # Explicitly add this before including router URLs
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Add the new public parent registration endpoint
    path('public-parent-register/', PublicParentRegisterView.as_view(), name='public_parent_register'),
    path('teacher-register/', TeacherRegisterView.as_view(), name='teacher_register'),
    path('register/', RegisterUserView.as_view(), name='register'),
]
