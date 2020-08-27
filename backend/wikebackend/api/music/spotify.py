import os
import spotipy
import getpass # to get the system username

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

def cache():
    if auth_manager.get_cached_token() != None:
        # If there are a token get it
        auth_manager.get_cached_token()
        return spotipy.Spotify(auth_manager=auth_manager)

def callBackUrl(authCode):
    authCode = auth_manager.parse_response_code(authCode)
    # Get token
    token = auth_manager.get_access_token(code=authCode,as_dict=False)
    # Create api client
    return token

def getUrl():
    authUrl = auth_manager.get_authorize_url()
    return authUrl

def getClient2():
    client = spotipy.Spotify(auth_manager=auth_manager)
    return client

def userinfo():
    client = getClient2()
    info = client.current_user()
    print(info)
    return info['display_name']

