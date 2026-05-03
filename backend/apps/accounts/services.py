from django.contrib.auth import get_user_model


User = get_user_model()


def create_user(*, username: str, email: str, password: str) -> User:
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
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