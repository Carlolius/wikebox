import os
import spotipy
import getpass # to get the system username

import datetime

import json

from api.models import LocalPlaylist, SongPlayingNow

from django.core import serializers

client_id = 'your_spotify_client_id'
client_secret = 'REMOVED'
redirect_uri = 'http://localhost:8100/callback/'
scope = 'user-library-read'
username = getpass.getuser() # get system username
auth_manager = spotipy.oauth2.SpotifyOAuth(client_id=client_id, client_secret=client_secret, redirect_uri=redirect_uri, scope=scope, cache_path=".spotify_cache_" + username)

# En front comprobar la respuesta, si es http abrir ventana para login, si no se supone que ya tienes el client
def getClient(response_url):
    # Authorization Code Flow for Spotify’s OAuth implementation
    auth_manager = spotipy.oauth2.SpotifyOAuth(client_id=client_id, client_secret=client_secret, redirect_uri=redirect_uri, scope=scope, cache_path=".spotify_cache_" + username)
    if auth_manager.get_cached_token() != None:
        # If there are a token get it
        auth_manager.get_cached_token()
        return spotipy.Spotify(auth_manager=auth_manager)
    else:
        if response_url != None:
            # Crop the response url to get the code
            authCode = auth_manager.parse_response_code("response_url")
            # Get token
            auth_manager.get_access_token(code=authCode,as_dict=False)
            # Create api client
            return spotipy.Spotify(auth_manager=auth_manager)
        else:
            # Get authentification url, open it and authentificate user
            auth_url = auth_manager.get_authorize_url()
            return auth_url

# Get client obtiene el cliente que necesita → token
# Token se obtiene del cache o de callbackurl que necesita → authCode
# AuthCode se obtiene del front que necesita → auth url
# Authurl necesita el auth_manager que se crea  al principio con las variables asignadas

# If there are a cached token (.spotify_cache_username) gets it
def cache():
    if auth_manager.get_cached_token() != None:
        # If there are a token get it
        auth_manager.get_cached_token()
        return spotipy.Spotify(auth_manager=auth_manager)

# Crops the callback url given by the Spotify api and obtains the token
def callBackUrl(authCode):
    authCode = auth_manager.parse_response_code(authCode)
    # Get token
    token = auth_manager.get_access_token(code=authCode,as_dict=False)
    # Create api client
    return token

# Get the url to make the login in the Spotify api
def getUrl():
    authUrl = auth_manager.get_authorize_url()
    return authUrl

# Get the Spotify client, to interact with the Spotify api
def getClient2():
    client = spotipy.Spotify(auth_manager=auth_manager)
    return client

# Get the user active devices
def chooseDevice():
    client = getClient2()
    devices = client.devices()
    devices = devices['devices']
    devicesDict = {}
    # If no active devices send no active devices
    if len(devices) >= 1:
        for i in range(len(devices)):
            devicesDict[i] = {
                    'id': devices[i]['id'],
                    'name': devices[i]['name']
                    }
    else:
        devicesDict[0] = {
                'id': "No id",
                'name': "No active devices"
                }
        
    devicesJson = json.dumps(devicesDict)
    return devicesJson

# Add next song from LocalPlaylist to Spotify queue
def addToQueue(userInstance):
    client = getClient2()
    curi = LocalPlaylist.objects.filter(instance=userInstance).order_by('-votes', 'created').values('uri').first() # Get the uri of the next song
    ccuri = json.dumps(curi['uri']) # Get just the compleat uri
    cccuri = ccuri[15:] # Cleans the not important part of uri
    rcccuri = cccuri.replace("\"", "") # Remove the quotation marks "
    try: # Sometimes Spotify returns 404 if can't find the device, with try we dont get the error
        client.add_to_queue(rcccuri, None)
    except:
        raise FileNotFoundError('Spotify error 404 not found')

# Start to play music
def playMusic(device, userInstance):
    client = getClient2()
    song = LocalPlaylist.objects.filter(instance=userInstance).order_by('-votes', 'created').values('uri').first()
    uriSongs = [song['uri']]
    client.start_playback(device_id = device, uris = uriSongs)

# Get the progress of the playing song
def currentProgress():
    client = getClient2()
    currentProgress = client.current_user_playing_track()
    return currentProgress

# Get the current playing song
def currentSong(userInstance):
    client = getClient2()
    # SongPlayingNow.objects.all().delete() # Cleans the SongPlayingNow when song changes
    songPlaying = SongPlayingNow()  # Assign the model
    # currentSong = client.current_user_playing_track()
    currentSong = client.currently_playing()

    # O seguinte é para testar

    # if currentSong != None:
    #     print("#####")
    #     print("Currentsong:", currentSong['item']['name'])
    #     print("uri:", currentSong['item']['uri'])
    #     print("progress_ms:", currentSong['progress_ms'])
    #     print("duration_ms:", currentSong['item']['duration_ms'])
    #     print("isplaying:", currentSong['is_playing'])
    #     print("#####")
    # else:
    #     print("#####")
    #     print("song is NONE")
    #     print("#####")

    if (currentSong != None) and (currentSong['is_playing'] == True):
        SongPlayingNow.objects.filter(instance=userInstance).delete() # Cleans the SongPlayingNow when song changes
        songPlaying.pk = None  # The pk is assigned automatically, this is needed for that
        artists = currentSong['item']['artists']  # Loop in the artist if there are more than one
        string = ""
        for j in range(len(artists)):
            string += artists[j]['name']
            if j+1 != len(artists):
                string += ", "  # Separate the artist names
        songPlaying.artists = string
        songPlaying.title = currentSong['item']['name']
        songPlaying.duration = datetime.timedelta(milliseconds = currentSong['item']['duration_ms'])
        songPlaying.uri = currentSong['item']['uri']
        songPlaying.instance = userInstance  # The instance of the user comes as parameter
        songPlaying.save()
        return json.dumps(currentSong)
    elif (currentSong == None) or (currentSong['is_playing'] == False):
        SongPlayingNow.objects.filter(instance=userInstance).delete() # Cleans the SongPlayingNow when song changes
        return json.dumps(None)
        

# Para non ter que facer o bucle desta función pode ser boa idea facer un serializer que transforme os datos.
# Search for a song
def search(search):
    client = getClient2()
    searchResponse = client.search(search, limit=10) # Retuns a 'dict' of songs
    cleanlist = searchResponse['tracks']['items'] # Gets the important part of the response
    # Creates a dictionary and populates it with the responses
    songList = {}
    for i in range(len(cleanlist)):
        songList[i] = {
                'song': cleanlist[i]['name'],
                'artists': cleanlist[i]['artists'][0]['name'],
                'uri': cleanlist[i]['uri']
                }
    songJson = json.dumps(songList) # Convert the dictionary to a json
    return songJson

# Generate a new session playlist
def generateSession(name):
    client = getClient2()

# Get the user playlists
# Functionality similar to search fuction
# Pasar tamén o offset e o limit para poder ver todas as listas
def getPlaylists():
    client = getClient2()
    user = client.current_user()
    # dictPlaylists = client.user_playlists(user['id'], limit=limite, offset=offset)
    dictPlaylists = client.user_playlists(user['id'])
    nextresult = dictPlaylists['next']
    dictPlaylists = dictPlaylists['items']
    playlists = {}
    for i in range(len(dictPlaylists)):
        playlists[i] = {
                'playlist': dictPlaylists[i]['name'],
                'playlistId': dictPlaylists[i]['id']
                }


    # El rollo este de next no vale porque tendría que meter la petición por aquí de alguna forma, voy a tener que hacerlo con numeritos o algo así
    # El next me valdría para saber si hay que cargar más, pero tampoco le paso el dato de donde tiene que empezar a cargar, así que la verdad ni idea de que cosa puede funcionar mejor
    # de todas formas con lo que llevo hecho creo que calculando numeritos pues casi mejor


    playlists['nextresult'] = nextresult # Adds the next page results to try to use "next"
    playlistsJson = json.dumps(playlists)
    return playlistsJson

# Get the songs of a playlist given the uri
# Pasar tamén o offset e o limit para poder ver todas as cancións
def getPlaylistSongs(playlistId):
    client = getClient2()
    dictsongs = client.playlist_tracks(playlistId)
    dictsongs = dictsongs['items']
    songs = {}
    for i in range(len(dictsongs)):
        songs[i] = {
                'song': dictsongs[i]['track']['name'],
                'artists': dictsongs[i]['track']['artists'][0]['name']
                }
    return json.dumps(songs)

# Pasar tamén o offset e o limit para poder ver todas as cancións
def playlistToLocalPlaylist(playlistId, userinstance):
    client = getClient2()
    spotifyPlaylist = client.playlist_tracks(playlistId)
    songs = spotifyPlaylist['items']  # Takes just the songs
    playlist = LocalPlaylist()  # Assign the model
    LocalPlaylist.objects.filter(added_mode="playlist").filter(instance=userinstance).delete() # Cleans the LocalPlaylist when selected playlist chagnes
    for i in range(len(songs)):
        playlist.pk = None  # The pk is assigned automatically, this is needed for that
        artists = songs[i]['track']['artists']  # Loop in the artist if there are more than one
        string = ""
        for j in range(len(artists)):
            string += artists[j]['name']
            if j+1 != len(artists):
                string += ", "  # Separate the artist names
        playlist.artists = string
        playlist.title = songs[i]['track']['name']
        playlist.duration = datetime.timedelta(milliseconds = songs[i]['track']['duration_ms'])
        playlist.uri = songs[i]['track']['uri']
        # playlist.created = songs[i]['added_at']
        playlist.created = datetime.datetime.now()
        playlist.added_mode = "playlist"
        playlist.instance = userinstance  # The instance of the user comes as parameter
        playlist.save()
    return json.dumps(songs)

def searchToLocalPlaylist(songUri, userinstance):
    client = getClient2()
    playlist = LocalPlaylist()  # Assign the model
    searchedSong = client.track(songUri)
    playlist.pk = None  # The pk is assigned automatically, this is needed for that
    artists = searchedSong['artists']  # Loop in the artist if there are more than one
    string = ""
    for j in range(len(artists)):
        string += artists[j]['name']
        if j+1 != len(artists):
            string += ", "  # Separate the artist names
    playlist.artists = string
    playlist.title = searchedSong['name']
    playlist.duration = datetime.timedelta(milliseconds = searchedSong['duration_ms'])
    playlist.uri = searchedSong['uri']
    playlist.created = datetime.datetime.now()
    playlist.added_mode = "search"
    playlist.instance = userinstance  # The instance of the user comes as parameter
    playlist.save()
    return json.dumps(searchedSong)

# Get user info, testing porpouse
def userinfo():
    client = getClient2()
    info = client.current_user()
    print(info)
    return info['display_name']

