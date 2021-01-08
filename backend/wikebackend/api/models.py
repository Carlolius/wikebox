from django.db import models
import api.music.utils as utils

# Create your models here.
class SongPlayingNow(models.Model):
    artist = models.CharField(max_length=1000)
    title = models.CharField(max_length=1000)
    duration = models.DurationField()
    path = models.CharField(max_length=200)
    url = models.CharField(max_length=200, unique=True)
    votes = models.IntegerField()
    # def __str__(self):
    #     return self.title + ' (' + self.url + ')'
    # def songname(self):
    #     return utils.songname(self.artist, self.title)

# Local playlists model
class LocalPlaylist(models.Model):
    title = models.CharField(max_length=100)
    artists = models.CharField(max_length=100)
    duration = models.DurationField
    uri = models.CharField()
    votes = models.IntegerField()

    def __str__(self):
        return self
