from django.db import models

from django.contrib.auth.models import AbstractUser

from django.utils.translation import ugettext_lazy as _

from .manager import CustomUserManager


class CustomUser(AbstractUser):
    id = models.AutoField(primary_key=True)
    # username = None
    # email = models.EmailField(_('email address'), unique=True)
    user_instance = models.ForeignKey("api.instance", on_delete=models.CASCADE, null=True, blank=True)  # Non debería de ser nulo pero non podo crear superuser se non

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.username
