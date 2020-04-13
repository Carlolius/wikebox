# Tekore api test for Wikebox

#######################################
# BORRAR isto é a proba de autentificación con tekore.
# Parece ser que para servidores hai que facelo en duas fases, o pon na web dos docs.
# Pode ser que no estea a capturar o token ben por algún tema do servidor, cando estea mais avanzado se verá.
#######################################
from tekore.util import request_client_token

client_id = "your_spotify_client_id"
client_secret = "REMOVED"


# app_token = request_client_token(client_id, client_secret)

from tekore.scope import every
from tekore.util import prompt_for_user_token

redirect_uri = 'http://localhost:8000/wikebox/callback'

# prompt_for_user_token provides a convenient way of retrieving an access token that refreshes automatically 
user_token = prompt_for_user_token( 
    client_id,
    client_secret,
    redirect_uri,
    scope=every
)
