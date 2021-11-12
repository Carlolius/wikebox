from rest_framework import serializers
from .models import SongPlayingNow, Songs

class SongPlayingNowSerializer(serializers.ModelSerializer):
    class Meta:
        model = SongPlayingNow
        fields = '__all__'

class SongsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Songs
        fields = '__all__'
