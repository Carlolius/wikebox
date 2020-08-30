from django.urls import include, path, re_path
from rest_framework import routers
from .music import spotify
from api import views

router = routers.DefaultRouter()
router.register(r'playing', views.SongPlayingNowViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
        # path('', views.HelloView.as_view() ),
        path('', views.SongPlayingNowViewSet.as_view() ),
        path('token/', views.SpotifyGet, name='token' ),
        # path('callback/', views.callBack())
        path('callback/', views.callBack),
        path('search/', views.search),
        path('playlists/', views.getPlaylists),
]
