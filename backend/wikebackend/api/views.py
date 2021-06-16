from rest_framework import generics
# Auth imports
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import HttpRequest, HttpResponse

from api.music import spotify
from api.models import instance, LocalPlaylist

from datetime import datetime, timedelta
import json
import re  # regular expressions

# import viewsets
from rest_framework import viewsets
from api.models import SongPlayingNow, LocalPlaylist
from api.serializers import SongPlayingNowSerializer, LocalPlaylistSerializer

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

# Register new instance
@api_view(['POST'])
def RegisterInstance(request):
    name = re.sub(r'\W+', '', request.data['urlInstance'])
    newInstance = instance.objects.create(
            url=name,
            name=request.data['urlInstance']
            )
    return Response(data=name, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def playingNow(request):
    playing = list(SongPlayingNow.objects.filter(instance=request.user.userInstance).values('artists', 'title'))
    if not playing:
        playing = [{'artists': 'song', 'title': 'No playing'}]
    jplaying = json.dumps(playing)
    return HttpResponse(jplaying)
    
# Pops the first song of the list if is the one playing
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def popTop(request):
    current = SongPlayingNow.objects.filter(instance=request.user.userInstance).values('uri').first()
    top = LocalPlaylist.objects.filter(instance=request.user.userInstance).order_by('votes', 'created').values('uri').first()
    if current == top:
        res = "same"
        LocalPlaylist.objects.filter(instance=request.user.userInstance).order_by('votes', 'created').first().delete()
    else:
        res = "notSame"
    return Response(data=res, status=200)

# Adds the next song to the queue
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addToQueue(request):
    totalTime = SongPlayingNow.objects.filter(instance=request.user.userInstance).values('duration').first()
    nowTime = spotify.currentProgress()
    if nowTime != None:
        totalTime = totalTime['duration']
        nowTime = timedelta(milliseconds=nowTime['progress_ms'])
        changeTime = nowTime + timedelta(seconds=20)
        if changeTime > totalTime:
            spotify.addToQueue(request.user.userInstance)
            res = "Change"
        else:
            res = "No change"
    else:
        res = "No playing"

    return Response(data=res, status=200)

# Get the songs of the LocalPlaylist
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def queueSongs(request):
    songs = list(LocalPlaylist.objects.filter(instance=request.user.userInstance).order_by('votes', 'created').values('artists', 'title', 'votes', 'uri'))
    jsongs = json.dumps(songs)
    return HttpResponse(jsongs)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def voteP(request):
    N = LocalPlaylist.objects.values_list('votes', flat=True).get(instance=request.user.userInstance, uri=request.data['uri'])
    N = N+1
    LocalPlaylist.objects.filter(instance=request.user.userInstance).filter(uri=request.data['uri']).update(votes=N)
    return Response(data="lala", status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def voteN(request):
    N = LocalPlaylist.objects.values_list('votes', flat=True).get(instance=request.user.userInstance, uri=request.data['uri'])
    N = N-1
    LocalPlaylist.objects.filter(instance=request.user.userInstance).filter(uri=request.data['uri']).update(votes=N)
    return Response(data="lala", status=200)

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

# Return the current playing song
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def currentSong(request):
    currentPlaying = spotify.currentSong(request.user.userInstance)
    return Response(data=currentPlaying, status=200)

# Select device where music plays
@permission_classes([IsAuthenticated])
def chooseDevice(self):
    devices = spotify.chooseDevice()
    return HttpResponse(devices)

# Start to play
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def playMusic(request):
    spotify.playMusic(request.data['device'], request.user.userInstance)
    return Response(data=None, status=200)

# Add a searched song to playlist given the song uri
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def searchToLocalPlaylist(request):
    searchToPlaylist = spotify.searchToLocalPlaylist(request.data['songUri'], request.user.userInstance)
    return HttpResponse(searchToPlaylist)

# Add songs to LocalPlaylist given the playlist uri
# Aquí habería que meter tamén o limit e o offset para poder engadir todas as cancións
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def playlistToLocalPlaylist(request):
    playlistSongs = spotify.playlistToLocalPlaylist(request.data['playlistId'], request.user.userInstance)
    return HttpResponse(playlistSongs)

# # Load the songs of a playlist given the playlist uri
# # Aquí habería que meter tamén o limit e o offset para poder ver todas as cancións
# @permission_classes([IsAuthenticated])
# @api_view(['POST'])
# def getPlaylistSongs(request):
#     playlistId = request.data['playlistId']
#     playlistSongs = spotify.getPlaylistSongs(playlistId)
#     return HttpResponse(playlistSongs)
