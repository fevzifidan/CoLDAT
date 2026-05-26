from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    AccountUpdateSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserLookupSerializer,
    UserSerializer,
)
from .services import update_user_account
from .selectors import user_lookup
from django.contrib.auth import get_user_model

from apps.common.mail_service import (
    send_verification_email,
    send_password_reset_email,
    verify_email_token,
    reset_password_with_token,
    RateLimitExceeded,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Helper: get user locale from Accept-Language header
# ---------------------------------------------------------------------------

def _get_user_locale(request) -> str:
    """
    Accept-Language header'indan kullanici dilini alir.
    Varsayilan: "en"
    """
    lang = request.headers.get("Accept-Language", "en")[:2]
    if lang not in ("en", "tr"):
        return "en"
    return lang


# Create your views here.

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        # Send verification email after registration
        # Only for email-auth users; MSAL users are verified by their provider
        if user.auth_provider == User.AuthProvider.EMAIL:
            try:
                send_verification_email(
                    user,
                    user_locale=_get_user_locale(request),
                )
            except RateLimitExceeded:
                # First email after registration; rate limit not enforced here
                pass

        return Response(
            {
                "message": "Account created successfully. Please verify your email before logging in.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {
                    "errorCode": "INVALID_CREDENTIALS",
                    "message": "Wrong email or password.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.check_password(password):
            return Response(
                {
                    "errorCode": "INVALID_CREDENTIALS",
                    "message": "Wrong email or password.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {
                    "errorCode": "ACCOUNT_NOT_VERIFIED",
                    "message": "You did not verify your account yet.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )

class AccountMeView(APIView):
    def get(self, request):
        return Response(
            UserSerializer(request.user).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        serializer = AccountUpdateSerializer(
            data=request.data,
            context={"request": request},
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        user = update_user_account(
            user=request.user,
            data=serializer.validated_data,
        )

        return Response(
            UserSerializer(user).data,
            status=status.HTTP_200_OK,
        )

class UserLookupView(APIView):
    def get(self, request):
        query = request.query_params.get("q", "")

        users = user_lookup(query=query)

        return Response(
            UserLookupSerializer(users, many=True).data,
            status=status.HTTP_200_OK,
        )


# -----------------------------------------------------------------------
# Email-related views
# -----------------------------------------------------------------------

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response(
                {"error": "Token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = verify_email_token(token)
        if user is None:
            return Response(
                {"error": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"success": True, "message": "Email verified successfully."},
            status=status.HTTP_200_OK,
        )


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response(
                {"error": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)

            # MSAL users authenticate through their provider; password is not managed here
            if user.auth_provider == User.AuthProvider.MSAL:
                return Response(
                    {
                        "success": True,
                        "message": (
                            "This account is linked to Microsoft. "
                            "Please use Microsoft to manage your password."
                        ),
                    },
                    status=status.HTTP_200_OK,
                )

            try:
                send_password_reset_email(
                    user,
                    user_locale=_get_user_locale(request),
                )
            except RateLimitExceeded as exc:
                return Response(
                    {
                        "error": str(exc),
                        "retry_after_seconds": exc.remaining_seconds,
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )
        except User.DoesNotExist:
            pass  # Security: don't reveal if user exists

        return Response(
            {
                "success": True,
                "message": "If the email exists, a reset link has been sent.",
            },
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not token or not new_password:
            return Response(
                {"error": "Token and new_password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = reset_password_with_token(token, new_password)
        if user is None:
            return Response(
                {"error": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"success": True, "message": "Password reset successfully."},
            status=status.HTTP_200_OK,
        )


class ResendVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response(
                {"error": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email, is_active=False)

            # MSAL users do not go through email verification
            if user.auth_provider == User.AuthProvider.MSAL:
                return Response(
                    {
                        "success": True,
                        "message": "If the account exists, a verification email has been sent.",
                    },
                    status=status.HTTP_200_OK,
                )

            try:
                send_verification_email(
                    user,
                    user_locale=_get_user_locale(request),
                )
            except RateLimitExceeded as exc:
                return Response(
                    {
                        "error": str(exc),
                        "retry_after_seconds": exc.remaining_seconds,
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )
        except User.DoesNotExist:
            pass  # Security: don't reveal if user exists

        return Response(
            {
                "success": True,
                "message": "If the account exists, a verification email has been sent.",
            },
            status=status.HTTP_200_OK,
        )
