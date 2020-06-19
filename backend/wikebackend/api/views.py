from rest_framework import generics
from .serializers import SongPlayingNowSerializer
from .models import SongPlayingNow
# Auth imports
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

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
