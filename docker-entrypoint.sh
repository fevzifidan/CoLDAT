#!/bin/sh
set -eu

echo "Waiting for PostgreSQL..."
python - <<'PY'
import os
import socket
import time

host = os.getenv("DB_HOST", "db")
port = int(os.getenv("DB_PORT", "5432"))
deadline = time.time() + 60

while True:
    try:
        with socket.create_connection((host, port), timeout=3):
            break
    except OSError:
        if time.time() > deadline:
            raise
        time.sleep(2)
PY

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Starting application..."
exec "$@"
