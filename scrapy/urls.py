from django.urls import path
from . import views


urlpatterns = [
    path('',views.homepage,name="home"),
    path('signup/',views.signup,name="signup"),
    path('login/',views.login,name="login"),
    path('logout/<int:userid>',views.logout,name="logout"),
    path('dashboard/',views.dashboard),
    path('dashboard/CreateBot',views.CreateBot,name="CreateBot"),
    path('dashboard/StartBot',views.StartBot),
    path('dashboard/getRefreshList',views.getRefreshList),
    path('dashboard/<int:user_id>',views.dashboardForUser,name="dashboardForUser"),
    path('dashboard/data/<int:user_id>/<int:bot_id>',views.DataShow, name="DataShow"),
]