# Base image
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system deps sometimes needed by scientific Python
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential gcc libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Expose the port (Render/Railway set $PORT)
ENV PORT=8000
EXPOSE 8000

# Start with Gunicorn + Eventlet for Flask-SocketIO
CMD ["sh", "-c", "gunicorn -k eventlet -w 1 -b 0.0.0.0:${PORT:-8000} app:app"]
