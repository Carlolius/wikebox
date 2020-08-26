from rest_framework import generics
from .serializers import SongPlayingNowSerializer
from .models import SongPlayingNow
# Auth imports
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.http import HttpResponse

from .music import spotify

# Create your views here.

# View for test auth purpouses
class HelloView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        content = {'message': 'Hello, World!'}
        return Response(content)

class SongPlayingNowViewSet(generics.ListCreateAPIView):
    queryset = SongPlayingNow.objects.all()
    serializer_class = SongPlayingNowSerializer

# class SpotifyToken(generics.ListCreateAPIView):
#     url = cred.user_authorisation_url()
#     code = ...  # Redirect user to login and retrieve code
#     user_token = cred.request_user_token(code)
#     cred = tk.Credentials(client_id, client_secret, redirect_uri)


def SpotifyGet(self):
    url = spotify.getUrl()
    resp = "[{\"url\":" + "\"" + url + "\"" + "}]"
    return HttpResponse(resp)

def callBack(self):
    print("Por callback")
    authCode = 'responsefromfront'
    spotify.callBackUrl(authCode)
    resp = "[{\"cosa\":" + "\"" + "mascosa" + "\"" + "}]"
    return HttpResponse(resp)
