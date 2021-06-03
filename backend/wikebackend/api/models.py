from django.db import models
import api.music.utils as utils

from django import utils
from datetime import datetime

# Create your models here.
class instance(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    url = models.CharField(max_length=1000, unique=True)
    spotify_token = models.CharField(max_length=1000, null=True, blank= True)
    # Chave foránea ao modelo de User
    admin = models.ForeignKey("users.CustomUser", on_delete=models.DO_NOTHING)
    def __str__(self):
        return self.name

# Local playlists model
class LocalPlaylist(models.Model):
    id = models.BigAutoField(primary_key=True)
    artists = models.CharField(max_length=1000)
    title = models.CharField(max_length=1000)
    duration = models.DurationField(default=None)
    uri = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)
    created = models.DateTimeField(default=datetime.now, blank=True)
    added_mode = models.CharField(max_length=50)  # Added during search or during playlist load
    instance = models.ForeignKey(instance, on_delete=models.DO_NOTHING)
    def __str__(self):
        return self.title

# Tal vez modelo non necesario
class SongPlayingNow(models.Model):
    id = models.BigAutoField(primary_key=True)
    artists = models.CharField(max_length=1000)
    title = models.CharField(max_length=1000)
    duration = models.DurationField(default=None)
    path = models.CharField(max_length=200)
    uri = models.CharField(max_length=200, unique=True)
    votes = models.IntegerField()
    def __str__(self):
        return self.uri
