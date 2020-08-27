from rest_framework import generics
# Auth imports
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from django.http import HttpRequest, HttpResponse
from .serializers import SongPlayingNowSerializer
from .models import SongPlayingNow

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

def SpotifyGet(self):
    url = spotify.getUrl()
    resp = "[{\"url\":" + "\"" + url + "\"" + "}]"
    return HttpResponse(resp)

@api_view(['POST'])
def callBack(request):
    authCode = request.data['url']
    spotify.callBackUrl(authCode)
    info = spotify.userinfo()
    resp = "[{\"url\":" + "\"" + info + "\"" + "}]"
    return HttpResponse(resp)
