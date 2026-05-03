from django.urls import path

from .views import RegisterView, LoginView

#This handles register and login

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
]