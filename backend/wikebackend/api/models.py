from django.db import models
import api.music.utils as utils

from datetime import datetime

# Create your models here.
class wike(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_lenght=100)
    url = models.CharField(max_length=1000)
    # Chave foránea ao modelo de User
    # admin = models.ForeignKey(, on_delete=models.DO_NOTHING)

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

# Local playlists model
class LocalPlaylist(models.Model):
    id = models.BigAutoField(primary_key=True)
    artists = models.CharField(max_length=1000)
    title = models.CharField(max_length=1000)
    duration = models.DurationField(default=None)
    uri = models.CharField(max_length=200, unique=True) # If 2 uri are the same, error.
    votes = models.IntegerField()
    created = datetime.now()
    wike = models.ForeignKey(wike, on_delete=models.DO_NOTHING)
    def __str__(self):
        return self.title
