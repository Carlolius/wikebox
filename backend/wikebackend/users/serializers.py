from rest_framework import serializers
# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

from api.models import instance
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'userInstance', 'password']
        extra_kwargs = {
                'password': {'write_only': True, 'required': True},
                'userInstance': {'required': True}
                }

    def create(self, validated_data):
        uInstance = instance.objects.filter(name=validated_data['userInstance']).get() 
        user = User.objects.create_user(**validated_data)
        user.userInstance = uInstance
        # Token.objects.create(user=user)  # Creates a token when the user is created, not necessary
        return user


# class UserSerializer(serializers.ModelField):
#     # uInstance = instance.objects.filter(url=userInstance).get() 
#     # user = username
#     password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
#     password2 = serializers.CharField(write_only=True, required=True)

#     class Meta:
#         model = User
#         fields = ('username', 'password', 'password2')
#         extra_kwargs = {
#                 'userInstance': {'required': True}}

#     def validate(self, attrs):
#         if attrs['password'] != attrs['password2']:
#             raise serializers.ValidationError({"password": "Password fields didn't match."})
#         return attrs

#     def create(self, validated_data):
#         user = User.objects.create_user(validated_data['username'], validated_data['password'])
#         user.userInstance = uInstance
#         user.save()
#         return user
