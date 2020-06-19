from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'new', views.UserCreate.as_view(), name='users-create'),
    # url(r'login'),
    # url(r'logout'),
    # url(r'newpassword'),
]
