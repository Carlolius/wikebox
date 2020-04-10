from rest_framework import serializers
from .models import SongPlayingNow

class SongPlayingNowSerializer(serializers.ModelSerializer):
    class Meta:
        model = SongPlayingNow
        fields = ('artist', 'title', 'duration', 'path', 'url', 'votes')
