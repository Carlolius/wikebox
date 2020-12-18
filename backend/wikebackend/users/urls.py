from django.contrib import admin
from django.urls import path
from django.conf.urls import include
from rest_framework import routers
from .views import UserViewSet
from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView)
from rest_framework.authtoken.views import obtain_auth_token # Probably not necessary

router = routers.DefaultRouter()
router.register('users', UserViewSet)

urlpatterns = [
        path('', include(router.urls)),
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh_sliding'),
        # path('token/', obtain_auth_token) # Probably not necessary
]

# from django.conf.urls import url
# from . import views

# urlpatterns = [
#     url(r'new', views.UserCreate.as_view(), name='users-create'),
#     url(r'delete', views.UserDelete.as_view(), name='users-delete',)
#     # url(r'login'),
#     # url(r'logout'),
#     # url(r'newpassword'),
# ]
