from django.urls import path
from . import views


urlpatterns = [
    path('',views.homepage,name="home"),
    path('signup/',views.signup,name="signup"),
    path('login/',views.login,name="login"),
    path('logout/',views.logout,name="logout"),
    path('dashboard/',views.dashboard),
]