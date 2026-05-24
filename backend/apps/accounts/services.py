from django.contrib.auth import get_user_model


User = get_user_model()


def create_user(
    *,
    username: str,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
) -> User:
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        auth_provider=User.AuthProvider.EMAIL,
        is_active=True,
    )

    return user

def update_user_account(*, user: User, data: dict) -> User:
    allowed_fields = [
        "username",
        "email",
        "first_name",
        "last_name",
    ]

    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])

    user.save(update_fields=allowed_fields)

    return user