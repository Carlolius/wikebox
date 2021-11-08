from django.contrib import admin
from .models import session, SongPlayingNow, LocalPlaylist

# Register your models here.
admin.site.register(session)
admin.site.register(SongPlayingNow)
admin.site.register(LocalPlaylist)
