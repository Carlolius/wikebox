import datetime
import json

import spotipy
from api.models import LocalPlaylist, SongPlayingNow
from django.core import serializers

client_id = 'your_spotify_client_id'
client_secret = 'REMOVED'
redirect_uri = 'http://192.168.1.106:8100/callback/'
scope = 'user-library-read, user-read-playback-position, user-read-playback-state, user-modify-playback-state, user-read-currently-playing, playlist-modify-public, playlist-modify-private, playlist-read-private'

# Get client obtiene el cliente que necesita → token
# Token se obtiene del cache o de callbackurl que necesita → authCode
# AuthCode se obtiene del front que necesita → auth url
# Authurl necesita el auth_manager que se crea  al principio con las variables asignadas

# Generate auth manager
def amanager(userInstance):
    instance = str(userInstance)
    auth_manager = spotipy.oauth2.SpotifyOAuth(client_id=client_id, client_secret=client_secret, redirect_uri=redirect_uri, scope=scope, cache_path=".spotify_token_" + instance)
    return auth_manager

# If there are a cached token (.spotify_token_userInstance) gets it
def cache(userInstance):
    auth_manager = amanager(userInstance)
    return auth_manager.get_cached_token()

# Crops the callback url given by the Spotify api and obtains the token
def callBackUrl(authCode, userInstance):
    auth_manager = amanager(userInstance)
    authCode = auth_manager.parse_response_code(authCode)
    # Get token
    token = auth_manager.get_access_token(code=authCode,as_dict=False)
    # Create api client
    return token

# Get the url to make the login in the Spotify api
def getUrl(userInstance):
    auth_manager = amanager(userInstance)
    authUrl = auth_manager.get_authorize_url()
    return authUrl

# Get the Spotify client, to interact with the Spotify api
def getClient(userInstance):
    auth_manager = amanager(userInstance)
    client = spotipy.Spotify(auth_manager=auth_manager)
    return client

# Check if the token exists on the system
def areToken(userInstance):
    token = cache(userInstance)
    if token != None:
        return True
    else:
        return False

# Get the user active devices
def chooseDevice(userInstance):
    client = getClient(userInstance)
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
    client = getClient(userInstance)
    curi = LocalPlaylist.objects.filter(instance=userInstance).order_by('-added_mode', '-votes', 'created').values('uri').first() # Get the uri of the next song
    ccuri = json.dumps(curi['uri']) # Get just the compleat uri
    cccuri = ccuri[15:] # Cleans the not important part of uri
    rcccuri = cccuri.replace("\"", "") # Remove the quotation marks "
    try: # Sometimes Spotify returns 404 if can't find the device, so we try
        client.add_to_queue(rcccuri, None)
    except:
        pass
        # raise FileNotFoundError('Spotify error 404 not found')

# Start to play music
def playMusic(device, userInstance):
    client = getClient(userInstance)
    song = LocalPlaylist.objects.filter(instance=userInstance).order_by('-added_mode', '-votes', 'created').values('uri').first()
    uriSongs = [song['uri']]
    client.start_playback(device_id = device, uris = uriSongs)

# Get the progress of the playing song
def currentProgress(userInstance):
    client = getClient(userInstance)
    currentProgress = client.current_user_playing_track()
    return currentProgress

# Get the current playing song
def currentSong(userInstance):
    client = getClient(userInstance)
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
    elif (currentSong != None) and (currentSong['is_playing'] == False):
        SongPlayingNow.objects.filter(instance=userInstance).delete() # Cleans the SongPlayingNow when song changes
        return json.dumps(currentSong)
    else:
        return json.dumps(currentSong) 
        

# Search for a song
def search(search, userInstance):
    client = getClient(userInstance)
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

# Get the user playlists
# Functionality similar to search fuction
# Pasar tamén o offset e o limit para poder ver todas as listas
def getPlaylists(userInstance):
    client = getClient(userInstance)
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
def getPlaylistSongs(playlistId, userInstance):
    client = getClient(userInstance)
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
def playlistToLocalPlaylist(playlistId, userInstance):
    client = getClient(userInstance)
    spotifyPlaylist = client.playlist_tracks(playlistId)
    songs = spotifyPlaylist['items']  # Takes just the songs
    playlist = LocalPlaylist()  # Assign the model
    LocalPlaylist.objects.filter(added_mode="playlist").filter(instance=userInstance).delete() # Cleans the LocalPlaylist when selected playlist chagnes
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
        playlist.instance = userInstance  # The instance of the user comes as parameter
        playlist.save()
    return json.dumps(songs)

def searchToLocalPlaylist(songUri, userInstance):
    client = getClient(userInstance)
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
    playlist.instance = userInstance  # The instance of the user comes as parameter
    playlist.save()
    return json.dumps(searchedSong)

# Get user info, testing porpouse
def userinfo(userInstance):
    client = getClient(userInstance)
    info = client.current_user()
    print(info)
    return info['display_name']
