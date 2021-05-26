from rest_framework import serializers
# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'userInstance', 'password']
        extra_kwargs = {'password': {'write_only': True, 'required': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        # Token.objects.create(user=user)  # Creates a token when the user is created, not necessary
        return user


# from rest_framework import serializers
# from rest_framework.validators import UniqueValidator
# from django.contrib.auth.models import User

# class UserSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(
#             max_length=32,
#             required=True,
#             validators=[UniqueValidator(queryset=User.objects.all())]
#             )
#     password = serializers.CharField(min_length=8, write_only=True)

#     class Meta:
#         model = User
#         fields = ('id', 'username', 'password')
#         write_only_fields = ('password',)

#     def create(self, validated_data):
#         user = User(username=validated_data['username'])
#         user.set_password(validated_data['password'])
#         user.save()
#         return user
    
#     def delete(self, validated_data):
#     # This  needs to check if you have permissions to delete the user
#         user = User(username=validated_data['username'])
#         user.delete()
#         return("Deleted")

    # def change_password()
    # Also needs to check who you are

    # login https://docs.djangoproject.com/en/3.0/topics/auth/default/#django.contrib.auth.login
    # logout
