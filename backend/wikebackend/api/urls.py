from django.urls import include, path, re_path
from rest_framework import routers
from .music import spotify
from api import views

router = routers.DefaultRouter()
router.register(r'playing', views.SongPlayingNowViewSet)
router.register(r'local', views.LocalPlaylistViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
        # path('', views.HelloView.as_view() ),
        # Next two lines make possible to use the viewsets for adding and update the databases
        path('', include(router.urls)),
        path('api-auth/', include('rest_framework.urls')),
        path('token/', views.SpotifyGet, name='token' ),
        path('callback/', views.callBack),
        path('search/', views.search),
        path('searchtolocalplaylist/', views.searchToLocalPlaylist),
        path('playlists/', views.getPlaylists),
        path('playlisttolocalplaylist/', views.playlistToLocalPlaylist),
        path('instanceregister/', views.RegisterInstance),
        path('queuesongs/', views.queueSongs),
        path('choosedevice/', views.chooseDevice),
        path('playmusic/', views.playMusic),
]
