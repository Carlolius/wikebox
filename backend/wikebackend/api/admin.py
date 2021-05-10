from django.contrib import admin
from .models import SongPlayingNow, LocalPlaylist

# Register your models here.
admin.site.register(SongPlayingNow)
admin.site.register(LocalPlaylist)
