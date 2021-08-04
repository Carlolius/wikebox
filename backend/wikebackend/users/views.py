from rest_framework import viewsets
# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer

from users.models import CustomUser
from rest_framework.decorators import api_view
from django.http import HttpRequest, HttpResponse
from rest_framework.response import Response

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@api_view(['POST'])
def getInstance(request):
    user = CustomUser.objects.filter(username=request.data['username']).values()
    userInstance = user[0]['userInstance_id']
    return Response(data=userInstance, status=200)
