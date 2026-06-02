from typing import Any

from rest_framework.response import Response
from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException



def _flatten_message(data: Any) -> str:
    if isinstance(data, dict):
        if "detail" in data:
            return _flatten_message(data["detail"])

        messages = []

        for field, value in data.items():
            field_message = _flatten_message(value)

            if field == "non_field_errors":
                messages.append(field_message)
            else:
                messages.append(f"{field}: {field_message}")

        return " ".join(messages)

    if isinstance(data, list):
        return " ".join(_flatten_message(item) for item in data)

    return str(data)


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return None

    message = _flatten_message(response.data)

    return Response(
        {
            "code": response.status_code,
            "message": message,
        },
        status=response.status_code,
        headers=response.headers,
    )

class Conflict(APIException):
    status_code = 409
    default_detail = "Resource already exists."
    default_code = "conflict"


class Gone(APIException):
    status_code = 410
    default_detail = "Resource is no longer available."
    default_code = "gone"


class TooManyRequests(APIException):
    status_code = 429
    default_detail = "Too many requests."
    default_code = "too_many_requests"