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

# Create your views here.

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

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




