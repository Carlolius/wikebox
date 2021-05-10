from django.db import models
import api.music.utils as utils

from datetime import datetime

# Create your models here.
class SongPlayingNow(models.Model):
    id = models.BigAutoField(primary_key=True)
    artists = models.CharField(max_length=1000)
    title = models.CharField(max_length=1000)
    duration = models.DurationField(default=None)
    path = models.CharField(max_length=200)
    uri = models.CharField(max_length=200, unique=True)
    votes = models.IntegerField()

# Local playlists model
class LocalPlaylist(models.Model):
    id = models.BigAutoField(primary_key=True)
    artists = models.CharField(max_length=1000)
    title = models.CharField(max_length=1000)
    duration = models.DurationField(default=None)
    uri = models.CharField(max_length=200, unique=True)
    created = datetime.now()
    votes = models.IntegerField()
