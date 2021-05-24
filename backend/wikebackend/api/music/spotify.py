import os
import spotipy
import getpass # to get the system username

import datetime

import json

from ..models import LocalPlaylist

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

# Copy of getPlaylistSongs
# Pasar tamén o offset e o limit para poder ver todas as cancións
def addToLocalPlaylist(playlistId, userinstance):
    client = getClient2()
    spotifyPlaylist = client.playlist_tracks(playlistId)
    songs = spotifyPlaylist['items']
    playlist = LocalPlaylist()
    print(songs) # Continuar aquí, songs non se pode recorrer porque debe de ser 1 podo facer un diccionario aquí ou algo así.
    for i in range(len(songs)):
        # id = models.BigAutoField(primary_key=True)
        # playlist.artists = songs[i] 
        playlist.title = songs[i]['track']['name']
        playlist.duration = datetime.timedelta(milliseconds = songs[i]['track']['duration_ms'])
        # playlist.uri =
        playlist.created = songs[i]['added_at']
        playlist.instance = userinstance
        playlist.save()
    return json.dumps(songs)

# Get user info, testing porpouse
def userinfo():
    client = getClient2()
    info = client.current_user()
    print(info)
    return info['display_name']

