from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.common.ids import uuid7

# Create your models here.

class User(AbstractUser):
    class AuthProvider(models.TextChoices):
        EMAIL = "email", "Email"
        MSAL = "msal", "Microsoft"
        
    id = models.UUIDField(
        primary_key=True,
        default=uuid7,
        editable=False,
    )

    email = models.EmailField(unique=True)

    auth_provider = models.CharField(
        max_length=20,
        choices=AuthProvider.choices,
        default=AuthProvider.EMAIL,
    )

    msal_oid = models.CharField(
        max_length=36,
        null=True,
        blank=True,
        help_text="Microsoft Entra object ID (oid claim).",
    )

    msal_tenant_id = models.CharField(
        max_length=36,
        null=True,
        blank=True,
        help_text="Microsoft Entra tenant ID (tid claim).",
    )

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"
        constraints = [
            models.UniqueConstraint(
                fields=["msal_tenant_id", "msal_oid"],
                condition=models.Q(
                    msal_tenant_id__isnull=False,
                    msal_oid__isnull=False,
                ),
                name="unique_msal_identity",
            )
        ]

    def __str__(self):
        return self.username


