from rest_framework import serializers
# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

from api.models import session
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'userSession', 'password']
        extra_kwargs = {
                'password': {'write_only': True, 'required': True},
                'userSession': {'required': True}
                }

    def create(self, validated_data):
        uSession = session.objects.filter(name=validated_data['userSession']).get() 
        # Check if there are an admin at the session if there aren't first one it's admin.
        try:
            # No admin
            haveAdmin = session.objects.filter(name=validated_data['userSession'], admin=None).get()
            user = User.objects.create_admin(**validated_data)
            user.userSession = uSession
            # Updates the session admin to user
            session.objects.filter(name=validated_data['userSession']).update(admin=user)
        except:
            # Already admin
            user = User.objects.create_user(**validated_data)
            user.userSession = uSession

        return user


# class UserSerializer(serializers.ModelField):
#     # uSession = session.objects.filter(url=userSession).get() 
#     # user = username
#     password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
#     password2 = serializers.CharField(write_only=True, required=True)

#     class Meta:
#         model = User
#         fields = ('username', 'password', 'password2')
#         extra_kwargs = {
#                 'userSession': {'required': True}}

#     def validate(self, attrs):
#         if attrs['password'] != attrs['password2']:
#             raise serializers.ValidationError({"password": "Password fields didn't match."})
#         return attrs

#     def create(self, validated_data):
#         user = User.objects.create_user(validated_data['username'], validated_data['password'])
#         user.userSession = uSession
#         user.save()
#         return user
