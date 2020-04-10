# from django.shortcuts import render
from rest_framework import generics
from .serializers import SongPlayingNowSerializer
from .models import SongPlayingNow

# Create your views here.

class SongPlayingNowViewSet(generics.ListCreateAPIView):
    queryset = SongPlayingNow.objects.all()
    serializer_class = SongPlayingNowSerializer
