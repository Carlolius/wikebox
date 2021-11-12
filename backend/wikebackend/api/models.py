from django.db import models
import api.music.utils as utils

from django import utils
from datetime import datetime

# Create your models here.
class session(models.Model):
    # id = models.BigAutoField(primary_key=True)
    url = models.CharField(max_length=1000, primary_key=True)
    name = models.CharField(max_length=100)
    spotify_token = models.CharField(max_length=1000, null=True, blank= True)
    # Chave foránea ao modelo de User
    admin = models.ForeignKey("users.CustomUser", on_delete=models.DO_NOTHING, null=True, blank=True)
    def __str__(self):
        return self.name

# Local playlists model
class Songs(models.Model):
    id = models.BigAutoField(primary_key=True)
    artists = models.CharField(max_length=1000)
    title = models.CharField(max_length=1000)
    duration = models.DurationField(default=None)
    uri = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)
    created = models.DateTimeField(default=datetime.now, blank=True)
    added_mode = models.CharField(max_length=50)  # Added during search or during playlist load
    session = models.ForeignKey(session, on_delete=models.DO_NOTHING)
    def __str__(self):
        return self.title

class SongPlayingNow(models.Model):
    id = models.BigAutoField(primary_key=True)
    artists = models.CharField(max_length=1000)
    title = models.CharField(max_length=1000)
    duration = models.DurationField(default=None)
    # uri = models.CharField(max_length=200, unique=True)
    uri = models.CharField(max_length=200)
    session = models.ForeignKey(session, on_delete=models.DO_NOTHING)
    def __str__(self):
        return self.title
