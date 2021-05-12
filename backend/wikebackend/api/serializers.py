from rest_framework import serializers
from .models import SongPlayingNow, LocalPlaylist

class SongPlayingNowSerializer(serializers.ModelSerializer):
    class Meta:
        model = SongPlayingNow
        fields = '__all__'

class LocalPlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocalPlaylist
        fields = '__all__'
