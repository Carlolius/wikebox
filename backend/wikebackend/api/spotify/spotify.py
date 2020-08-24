import spotipy
# from spotipy.oauth2 import SpotifyOAuth
import getpass

client_id = 'your_spotify_client_id'
client_secret = 'REMOVED'
redirect_uri = 'http://localhost:8100/api/callback'

scope = 'user-library-read'

username = getpass.getuser()

# https://github.com/plamere/spotipy/blob/master/examples/app.py

auth_manager = spotipy.oauth2.SpotifyOAuth(client_id=client_id, client_secret=client_secret, redirect_uri=redirect_uri, scope=scope, cache_path=".cache-" + username)

auth_url = auth_manager.get_authorize_url() # Mandar isto o frontend

auth_manager.get_access_token("code") # Paresear dende o front o "code" que é o token da redirect uri
# me da que esta función está deprecated que use get_cached_token

spotify = spotipy.Spotify(auth_manager=auth_manager) # Traballar coas funcións de spotify directamente

# Check if token is expired https://stackoverflow.com/questions/49239516/spotipy-refreshing-a-token-with-authorization-code-flow

def refresh():
    global token_info, sp

    if sp_oauth.is_token_expired(token_info):
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
        token = token_info['access_token']
        sp = spotipy.Spotify(auth=token)
