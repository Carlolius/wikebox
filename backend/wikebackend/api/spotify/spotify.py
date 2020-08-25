# El flow es:
# Implementar el code flow que pilla los datos de la aplicación para autenticarse contra eso
# Comprobar si hay un token por ahí ya
# Obtener url de acceso, pasar esto al front, allí abrir la url hacer login
# Recibir la url de callback desde el front y cropear el código de la url
# Obtener el token pasando el código
# Pasar el token al cliente 
# Si el token no está fresco, refrescarlo

import os
import spotipy
import getpass # to get the system username

client_id = 'your_spotify_client_id'
client_secret = 'REMOVED'
redirect_uri = 'http://localhost:8100/api/callback'
scope = 'user-library-read'
username = getpass.getuser() # get system username

# En front comprobar la respuesta, si es http abrir ventana para login, si no se supone que ya tienes el client
def getClient(response_url):
    # Authorization Code Flow for Spotify’s OAuth implementation
    auth_manager = spotipy.oauth2.SpotifyOAuth(client_id=client_id, client_secret=client_secret, redirect_uri=redirect_uri, scope=scope, cache_path=".spotify_cache_" + username)
    if auth_manager.get_cached_token() != None:
        # If there are a token get it
        token = auth_manager.get_cached_token()
        return spotipy.Spotify(auth_manager=token)
    else:
        if response_url != None:
            # Crop the response url to get the code
            authCode = auth_manager.parse_response_code("response_url")
            # Get token
            token = auth_manager.get_access_token(code=authCode,as_dict=False)
            # Create api client
            return spotipy.Spotify(auth_manager=token)
        else:
            # Get authentification url, open it and authentificate user
            auth_url = auth_manager.get_authorize_url()
            return auth_url
