# BrainSpark - DevOps Guide

## Document Purpose

This document provides comprehensive DevOps procedures for BrainSpark, including CI/CD pipelines, deployment processes, and operational procedures.

---

## Table of Contents

1. [CI/CD Pipeline](#1-cicd-pipeline)
2. [Deployment Process](#2-deployment-process)
3. [Environment Configuration](#3-environment-configuration)
4. [Container Management](#4-container-management)
5. [Database Operations](#5-database-operations)
6. [Secrets Management](#6-secrets-management)

---

## 1. CI/CD Pipeline

### 1.1 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CI/CD Pipeline                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Push/PR                                                                     │
│     │                                                                        │
│     ▼                                                                        │
│  ┌──────────────┐                                                           │
│  │    Lint      │ ─── Fail ──→ Block PR                                     │
│  └──────┬───────┘                                                           │
│         │ Pass                                                               │
│         ▼                                                                    │
│  ┌──────────────┐                                                           │
│  │    Test      │ ─── Fail ──→ Block PR                                     │
│  └──────┬───────┘                                                           │
│         │ Pass                                                               │
│         ▼                                                                    │
│  ┌──────────────┐                                                           │
│  │    Build     │ ─── Fail ──→ Block PR                                     │
│  └──────┬───────┘                                                           │
│         │ Pass                                                               │
│         ▼                                                                    │
│  ┌──────────────┐                                                           │
│  │   Security   │ ─── Critical ──→ Block PR                                 │
│  │    Scan      │                                                           │
│  └──────┬───────┘                                                           │
│         │ Pass                                                               │
│         ▼                                                                    │
│  ┌──────────────────────────────────────────┐                               │
│  │              Merge to Main               │                               │
│  └──────┬───────────────────────────────────┘                               │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │   Deploy     │ ──→ │   Deploy     │ ──→ │   Deploy     │                │
│  │   Staging    │     │   Canary     │     │   Production │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 GitHub Actions Workflows

```yaml
# .github/workflows/ci.yml

name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Frontend Lint
        run: |
          cd frontend
          npm ci
          npm run lint

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Backend Lint
        run: |
          cd backend
          pip install ruff
          ruff check .

  test:
    needs: lint
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Frontend Tests
        run: |
          cd frontend
          npm ci
          npm run test -- --coverage

      - name: Backend Tests
        run: |
          cd backend
          pip install -r requirements-dev.txt
          pytest --cov=app --cov-report=xml
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379

      - name: Upload Coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GCR
        uses: docker/login-action@v3
        with:
          registry: gcr.io
          username: _json_key
          password: ${{ secrets.GCP_SA_KEY }}

      - name: Build and Push API
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: ${{ github.ref == 'refs/heads/main' }}
          tags: gcr.io/${{ secrets.GCP_PROJECT }}/brainspark-api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and Push Frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: ${{ github.ref == 'refs/heads/main' }}
          tags: gcr.io/${{ secrets.GCP_PROJECT }}/brainspark-web:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  security:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Snyk
        uses: snyk/actions/node@master
        with:
          args: --severity-threshold=high
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'gcr.io/${{ secrets.GCP_PROJECT }}/brainspark-api:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'

  deploy-staging:
    needs: security
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to Staging
        run: |
          gcloud run deploy brainspark-api-staging \
            --image gcr.io/${{ secrets.GCP_PROJECT }}/brainspark-api:${{ github.sha }} \
            --region us-central1 \
            --platform managed

  deploy-production:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Production (Canary)
        run: |
          gcloud run deploy brainspark-api \
            --image gcr.io/${{ secrets.GCP_PROJECT }}/brainspark-api:${{ github.sha }} \
            --region us-central1 \
            --platform managed \
            --no-traffic

          gcloud run services update-traffic brainspark-api \
            --to-revisions ${{ github.sha }}=10

      - name: Wait and Verify
        run: sleep 300 && ./scripts/verify-deployment.sh

      - name: Full Rollout
        run: |
          gcloud run services update-traffic brainspark-api \
            --to-revisions ${{ github.sha }}=100
```

---

## 2. Deployment Process

### 2.1 Deployment Commands

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production

# Rollback
./scripts/rollback.sh production <revision>
```

### 2.2 Deployment Script

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENVIRONMENT=$1
IMAGE_TAG=${2:-latest}

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: ./deploy.sh <environment> [image_tag]"
    exit 1
fi

echo "Deploying to $ENVIRONMENT with tag $IMAGE_TAG"

# Set project
if [ "$ENVIRONMENT" == "production" ]; then
    PROJECT="brainspark-prod"
    REGION="us-central1"
elif [ "$ENVIRONMENT" == "staging" ]; then
    PROJECT="brainspark-staging"
    REGION="us-central1"
else
    echo "Invalid environment"
    exit 1
fi

gcloud config set project $PROJECT

# Deploy API
echo "Deploying API..."
gcloud run deploy brainspark-api \
    --image gcr.io/$PROJECT/brainspark-api:$IMAGE_TAG \
    --region $REGION \
    --platform managed \
    --set-env-vars="ENVIRONMENT=$ENVIRONMENT"

# Deploy Frontend
echo "Deploying Frontend..."
gcloud run deploy brainspark-web \
    --image gcr.io/$PROJECT/brainspark-web:$IMAGE_TAG \
    --region $REGION \
    --platform managed

echo "Deployment complete!"
```

---

## 3. Environment Configuration

### 3.1 Environment Variables

```bash
# .env.example

# Application
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/brainspark
DATABASE_POOL_SIZE=10

# Redis
REDIS_URL=redis://localhost:6379

# AI
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRY=86400

# Firebase
FIREBASE_PROJECT_ID=brainspark-dev
FIREBASE_CREDENTIALS_PATH=/path/to/creds.json

# External Services
SENDGRID_API_KEY=SG.xxxxx
STRIPE_API_KEY=sk_test_xxxxx
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Feature Flags
FEATURE_VOICE_OVER=true
FEATURE_MULTIPLAYER=false
```

---

## 4. Container Management

### 4.1 Dockerfiles

```dockerfile
# backend/Dockerfile

FROM python:3.11-slim as builder

WORKDIR /app

RUN pip install --no-cache-dir poetry

COPY pyproject.toml poetry.lock ./
RUN poetry export -f requirements.txt --output requirements.txt

FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN adduser --disabled-password --gecos '' appuser
USER appuser

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

```dockerfile
# frontend/Dockerfile

FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

---

## 5. Database Operations

### 5.1 Migration Commands

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one version
alembic downgrade -1

# Show current version
alembic current

# Show migration history
alembic history
```

### 5.2 Backup and Restore

```bash
# Manual backup
gcloud sql export sql brainspark-db gs://brainspark-backups/manual/$(date +%Y%m%d).sql \
    --database=brainspark

# Restore from backup
gcloud sql import sql brainspark-db gs://brainspark-backups/manual/20241215.sql \
    --database=brainspark
```

---

## 6. Secrets Management

### 6.1 Secret Operations

```bash
# Create secret
echo -n "secret-value" | gcloud secrets create my-secret --data-file=-

# Update secret
echo -n "new-value" | gcloud secrets versions add my-secret --data-file=-

# Access secret
gcloud secrets versions access latest --secret=my-secret

# List secrets
gcloud secrets list

# Delete secret
gcloud secrets delete my-secret
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-15 | BrainSpark Team | Initial document |
