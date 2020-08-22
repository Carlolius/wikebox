# Tekore api test for Wikebox

#######################################
# BORRAR isto é a proba de autentificación con tekore.
# Parece ser que para servidores hai que facelo en duas fases, o pon na web dos docs.
# Pode ser que no estea a capturar o token ben por algún tema do servidor, cando estea mais avanzado se verá.
#######################################
import tekore as tk

client_id = "your_spotify_client_id"
client_secret = "REMOVED"


# app_token = request_client_token(client_id, client_secret)

redirect_uri = 'http://localhost:8100/api/callback'

# prompt_for_user_token provides a convenient way of retrieving an access token that refreshes automatically 

user_token = tk.prompt_for_user_token(
    client_id,
    client_secret,
    redirect_uri,
    scope=tk.scope.every
)
