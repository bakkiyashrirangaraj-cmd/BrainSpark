# BrainSpark Backend Dockerfile
# Supports Python 3.9, 3.10, 3.11, 3.12, 3.13
ARG PYTHON_VERSION=3.11
FROM python:${PYTHON_VERSION}-slim

# Set working directory
WORKDIR /app

# Verify Python version meets requirements (>=3.9)
RUN python -c "import sys; assert sys.version_info >= (3, 9), f'Python 3.9+ required, got {sys.version}'"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
