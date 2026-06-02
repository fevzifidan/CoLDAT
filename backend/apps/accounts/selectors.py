from django.contrib.auth import get_user_model
from django.db.models import Q


User = get_user_model()


def user_lookup(*, query: str):
    query = query.strip()

    if not query:
        return User.objects.none()

    return (
        User.objects.filter(
            Q(username__icontains=query)
            | Q(email__icontains=query)
            | Q(first_name__icontains=query)
            | Q(last_name__icontains=query)
        )
        .filter(is_active=True)
        .order_by("username")[:10]
    )