from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import Mock, patch
import uuid

import jwt
from cryptography.hazmat.primitives.asymmetric import rsa
from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase, override_settings
from rest_framework_simplejwt.tokens import AccessToken

from .msal import (
    MSALAuthenticationFailed,
    MicrosoftIdentity,
    validate_msal_token,
)


User = get_user_model()

TENANT_ID = "11111111-1111-4111-8111-111111111111"
OBJECT_ID = "22222222-2222-4222-8222-222222222222"
CLIENT_ID = "33333333-3333-4333-8333-333333333333"
ISSUER = f"https://login.microsoftonline.com/{TENANT_ID}/v2.0"
JWKS_URL = (
    f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"
)


@override_settings(
    MSAL_CLIENT_ID=CLIENT_ID,
    MSAL_TENANT_ID=TENANT_ID,
    MSAL_ISSUER=ISSUER,
    MSAL_JWKS_URL=JWKS_URL,
)
class MSALTokenValidationTests(SimpleTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        cls.public_key = cls.private_key.public_key()

    def _build_token(self, **claim_overrides):
        now = datetime.now(tz=timezone.utc)
        claims = {
            "aud": CLIENT_ID,
            "exp": now + timedelta(minutes=5),
            "iat": now,
            "iss": ISSUER,
            "oid": OBJECT_ID,
            "sub": "test-subject",
            "tid": TENANT_ID,
            "preferred_username": "person@example.com",
            "given_name": "Test",
            "family_name": "Person",
        }
        claims.update(claim_overrides)

        return jwt.encode(
            claims,
            self.private_key,
            algorithm="RS256",
            headers={"kid": "test-key"},
        )

    def _fake_jwks_client(self):
        client = Mock()
        client.get_signing_key_from_jwt.return_value = SimpleNamespace(
            key=self.public_key
        )
        return client

    def test_validates_signature_and_required_microsoft_claims(self):
        token = self._build_token()

        with patch(
            "apps.accounts.msal._get_jwks_client",
            return_value=self._fake_jwks_client(),
        ):
            identity = validate_msal_token(token)

        self.assertEqual(identity.object_id, OBJECT_ID)
        self.assertEqual(identity.tenant_id, TENANT_ID)
        self.assertEqual(identity.email, "person@example.com")
        self.assertEqual(identity.first_name, "Test")
        self.assertEqual(identity.last_name, "Person")

    def test_rejects_token_for_another_application(self):
        token = self._build_token(aud=str(uuid.uuid4()))

        with patch(
            "apps.accounts.msal._get_jwks_client",
            return_value=self._fake_jwks_client(),
        ):
            with self.assertRaises(MSALAuthenticationFailed):
                validate_msal_token(token)


class MSALLoginEndpointTests(TestCase):
    endpoint = "/api/v1/auth/msal-login"

    def setUp(self):
        self.identity = MicrosoftIdentity(
            object_id=OBJECT_ID,
            tenant_id=TENANT_ID,
            email="person@example.com",
            first_name="Test",
            last_name="Person",
        )

    @patch("apps.accounts.views.validate_msal_token")
    def test_jit_provisions_user_and_reuses_stable_identity(self, validate):
        validate.return_value = self.identity

        first_response = self.client.post(
            self.endpoint,
            {"msal_token": "valid-token"},
            content_type="application/json",
        )
        second_response = self.client.post(
            self.endpoint,
            {"msal_token": "valid-token"},
            content_type="application/json",
        )

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 200)
        self.assertEqual(set(first_response.data), {"access_token", "user"})
        self.assertEqual(User.objects.count(), 1)

        user = User.objects.get()
        self.assertEqual(user.auth_provider, User.AuthProvider.MSAL)
        self.assertEqual(user.msal_oid, OBJECT_ID)
        self.assertEqual(user.msal_tenant_id, TENANT_ID)
        self.assertFalse(user.has_usable_password())
        self.assertEqual(first_response.data["user"]["id"], str(user.id))
        self.assertEqual(second_response.data["user"]["id"], str(user.id))
        self.assertEqual(
            str(AccessToken(first_response.data["access_token"])["user_id"]),
            str(user.id),
        )
        validate.assert_called_with("valid-token")

    @patch("apps.accounts.views.validate_msal_token")
    def test_existing_email_account_is_linked_to_microsoft(self, validate):
        validate.return_value = self.identity
        user = User.objects.create_user(
            username="existing-user",
            email=self.identity.email,
            password="existing-password-123",
            is_active=True,
        )

        response = self.client.post(
            self.endpoint,
            {"msal_token": "valid-token"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(user.auth_provider, User.AuthProvider.MSAL)
        self.assertEqual(user.msal_oid, OBJECT_ID)
        self.assertFalse(user.has_usable_password())

    @patch("apps.accounts.views.validate_msal_token")
    def test_disabled_existing_account_is_not_reactivated(self, validate):
        validate.return_value = self.identity
        User.objects.create_user(
            username="disabled-user",
            email=self.identity.email,
            password="existing-password-123",
            is_active=False,
        )

        response = self.client.post(
            self.endpoint,
            {"msal_token": "valid-token"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 401)

    def test_requires_yaml_msal_token_field(self):
        response = self.client.post(
            self.endpoint,
            {},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
