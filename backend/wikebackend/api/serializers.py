from rest_framework import serializers
from .models import SongPlayingNow, LocalPlaylist

class SongPlayingNowSerializer(serializers.ModelSerializer):
    class Meta:
        model = SongPlayingNow
        # fields = ('artist', 'title', 'duration', 'path', 'url', 'votes')
        fields = '__all__'

# class PlaylistLocalSerializer(serializers.Serializer):
#     id = serializers.CharField(primary_key=True)
#     artists = serializers.CharField(max_length=1000)
#     title = serializers.CharField(max_length=1000)
#     duration = serializers.DurationField()
#     uri = serializers.CharField(max_length=200, unique=True)
#     created = serializers.DateTimeField()
#     votes = serializers.IntegerField()

class LocalPlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        meta = LocalPlaylist
        fields = '__all__'
