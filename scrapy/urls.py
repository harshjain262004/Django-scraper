from django.urls import path
from . import views


urlpatterns = [
    path('',views.homepage,name="home"),
    path('signup/',views.signup,name="signup"),
    path('login/',views.login,name="login"),
    path('logout/<int:userid>',views.logout,name="logout"),
    path('dashboard/',views.dashboard),
    path('dashboard/data/<int:user_id>/<int:bot_id>',views.DataShow, name="DataShow"),
]