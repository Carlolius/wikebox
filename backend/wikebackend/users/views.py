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


# from django.shortcuts import render
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from users.serializers import UserSerializer
# from django.contrib.auth.models import User

# class UserCreate(APIView):
#     # Creates the user. 

#     def post(self, request, format='json'):
#         serializer = UserSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#             if user:
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class UserDelete(APIView):
#     # Delete the user

#     def post(self, request, format='json'):
#         serializer = UserSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#             if user:
#                 return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
