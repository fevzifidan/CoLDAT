import uuid

from rest_framework.exceptions import ValidationError
from rest_framework.pagination import BasePagination
from rest_framework.response import Response


class UUIDv7CursorPagination(BasePagination):
    default_limit = 10
    max_limit = 100
    limit_query_param = "limit"
    cursor_query_param = "after"

    def paginate_queryset(self, queryset, request, view=None):
        self.limit = self._get_limit(request)
        cursor = self._get_cursor(request)

        queryset = queryset.order_by("-id")

        if cursor is not None:
            queryset = queryset.filter(id__lt=cursor)

        results = list(queryset[: self.limit + 1])
        has_next_page = len(results) > self.limit
        self.page = results[: self.limit]
        self.next_cursor = (
            str(self.page[-1].id)
            if has_next_page and self.page
            else None
        )

        return self.page

    def get_paginated_response(self, data):
        return Response(
            {
                "data": data,
                "next_cursor": self.next_cursor,
            }
        )

    def _get_limit(self, request):
        raw_limit = request.query_params.get(
            self.limit_query_param,
            self.default_limit,
        )

        try:
            limit = int(raw_limit)
        except (TypeError, ValueError):
            raise ValidationError(
                {self.limit_query_param: "Must be an integer."}
            )

        if limit < 1 or limit > self.max_limit:
            raise ValidationError(
                {
                    self.limit_query_param: (
                        f"Must be between 1 and {self.max_limit}."
                    )
                }
            )

        return limit

    def _get_cursor(self, request):
        raw_cursor = request.query_params.get(self.cursor_query_param)

        if not raw_cursor:
            return None

        try:
            cursor = uuid.UUID(raw_cursor)
        except (AttributeError, TypeError, ValueError):
            raise ValidationError(
                {self.cursor_query_param: "Must be a valid UUIDv7 value."}
            )

        if cursor.version != 7:
            raise ValidationError(
                {self.cursor_query_param: "Must be a UUIDv7 value."}
            )

        return cursor


class UUIDv7PaginatedAPIViewMixin:
    pagination_class = UUIDv7CursorPagination

    def paginate_queryset(self, queryset):
        self.paginator = self.pagination_class()
        return self.paginator.paginate_queryset(
            queryset,
            self.request,
            view=self,
        )

    def get_paginated_response(self, data):
        return self.paginator.get_paginated_response(data)
