import sentry_sdk

class SentryClientErrorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        client_errors = [400, 404, 405, 406, 409, 413, 414, 415, 416, 422, 425, 428, 429, 431, 444, 494, 495, 496, 497, 499]

        if response.status_code in client_errors:
            # 1. Eğer bu hata zaten custom_exception_handler tarafından Sentry'ye gönderildiyse es geç
            if getattr(request, "_sentry_captured", False):
                return response

            # 2. Dosya indirme veya streaming işlemlerinde hata oluşmasını engellemek için kontrol
            if hasattr(response, "streaming") and response.streaming:
                content = "[Streaming Response / File Export]"
            else:
                try:
                    # Yanıt içeriğini (örn. serializer hata mesajlarını) okuyup Sentry'ye ekleyelim
                    content = response.content.decode("utf-8")[:1000]  # Maksimum 1000 karakter
                except Exception:
                    content = "[Okunamayan içerik]"

            # Sentry'ye warning olarak gönder
            sentry_sdk.capture_message(
                f"Client Error ({response.status_code}) on {request.method} {request.path}: {content}",
                level="warning"
            )

        return response