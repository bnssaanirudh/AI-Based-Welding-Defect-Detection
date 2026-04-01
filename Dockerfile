# Welding AI — Backend Dockerfile
# For deployment on Render.com

FROM python:3.11-slim

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Expose port (Render sets $PORT dynamically)
EXPOSE 8000

# Start the FastAPI server
CMD uvicorn backend.api:app --host 0.0.0.0 --port ${PORT:-8000}
