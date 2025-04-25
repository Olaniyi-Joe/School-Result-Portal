from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
# Import the new view
from .views import UserViewSet, CustomTokenObtainPairView, PublicParentRegisterView

router = DefaultRouter()
router.register('users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Add the new public parent registration endpoint
    path('public-parent-register/', PublicParentRegisterView.as_view(), name='public_parent_register'),
]
