from django.urls import include, path
from rest_framework import routers
from . import views, spotify

router = routers.DefaultRouter()
router.register(r'playing', views.SongPlayingNowViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
        # path('', views.HelloView.as_view() ),
        path('', views.SongPlayingNowViewSet.as_view() ),
        path('token/', views.SpotifyToken.as_view() ),
        path('token/', spotify.spotify, name='token' ), # Like this I can execute a function
]
