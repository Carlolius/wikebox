from rest_framework import generics
# Auth imports
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import HttpRequest, HttpResponse

from .music import spotify

# import viewsets
from rest_framework import viewsets
from .models import SongPlayingNow, LocalPlaylist
from .serializers import SongPlayingNowSerializer, LocalPlaylistSerializer

# Create your views here.

# View for test auth purpouses
class HelloView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        content = {'message': 'Hello, World!'}
        return Response(content)

# class SongPlayingNowViewSet(generics.ListCreateAPIView):
#     # Error from pylint
#     queryset = SongPlayingNow.objects.all()
#     serializer_class = SongPlayingNowSerializer
@permission_classes([IsAuthenticated])
class SongPlayingNowViewSet(viewsets.ModelViewSet):
    # Error from pylint
    queryset = SongPlayingNow.objects.all()
    serializer_class = SongPlayingNowSerializer

@permission_classes([IsAuthenticated])
class LocalPlaylistViewSet(viewsets.ModelViewSet):
    queryset = LocalPlaylist.objects.all()
    serializer_class = LocalPlaylistSerializer


## Spotify ##

# Get the url to make the login in the Spotify api
@permission_classes([IsAuthenticated])
def SpotifyGet(self):
    url = spotify.getUrl()
    resp = "[{\"url\":" + "\"" + url + "\"" + "}]"
    return HttpResponse(resp)

# Crops the callback url given by the Spotify api and obtains the token
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def callBack(request):
    authCode = request.data['url']
    spotify.callBackUrl(authCode)
    info = spotify.userinfo()
    resp = "[{\"url\":" + "\"" + info + "\"" + "}]"
    return HttpResponse(resp)

# Get user playlists
# Aquí habería que meter tamén o limit e o offset para poder ver todas as listas
@permission_classes([IsAuthenticated])
def getPlaylists(self):
    playlists = spotify.getPlaylists()
    return HttpResponse(playlists)

# Load the songs of a playlist given the playlist uri
# Aquí habería que meter tamén o limit e o offset para poder ver todas as cancións
@permission_classes([IsAuthenticated])
@api_view(['POST'])
def getPlaylistSongs(request):
    playlistId = request.data['playlistId']
    playlistSongs = spotify.getPlaylistSongs(playlistId)
    return HttpResponse(playlistSongs)

# Search for a song
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def search(request):
    search = request.data['search']
    # Necessary for when you delete all the chars in the search bar, avoids empty request
    if search != '':
        songs = spotify.search(request.data['search'])
        # resp = "[{\"song\":" + "\"" + songs + "\"" + "}]"
        return HttpResponse(songs)
    else:
        return Response(data=None, status=200)
