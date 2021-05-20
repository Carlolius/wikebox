from django.db import models

from django.contrib.auth.models import AbstractUser

from django.utils.translation import ugettext_lazy as _

from .manager import CustomUserManager


class CustomUser(AbstractUser):
    id = models.AutoField(primary_key=True)
    # username = None
    # email = models.EmailField(_('email address'), unique=True)
    instance_number = models.IntegerField(null=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.username
