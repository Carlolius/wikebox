from django.contrib import admin
from .models import instance, SongPlayingNow, LocalPlaylist

# Register your models here.
admin.site.register(instance)
admin.site.register(SongPlayingNow)
admin.site.register(LocalPlaylist)
