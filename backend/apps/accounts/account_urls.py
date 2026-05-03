from django.urls import path

from .views import AccountMeView

#This handles the "Me" page.


urlpatterns = [
    path("me/", AccountMeView.as_view(), name="account-me"),
]