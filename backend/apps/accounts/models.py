import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class User(AbstractUser):
    class AuthProvider(models.TextChoices):
        EMAIL = "email", "Email"
        MSAL = "msal", "Microsoft"
        
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    email = models.EmailField(unique=True)

    auth_provider = models.CharField(
        max_length=20,
        choices=AuthProvider.choices,
        default=AuthProvider.EMAIL,
    )

    def __str__(self):
        return self.username


