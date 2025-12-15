# BrainSpark - Cloud Build Deployment Guide

## Overview

BrainSpark uses Google Cloud Build for CI/CD deployment to GCP. This guide covers all Cloud Build configurations.

---

## Cloud Build Files

| File | Purpose |
|------|---------|
| `cloudbuild.yaml` | **Main deployment** - Builds and deploys both backend and frontend |
| `cloudbuild-setup.yaml` | **Initial setup** - Creates infrastructure (run once) |
| `cloudbuild-migrate.yaml` | **Database migrations** - Runs schema updates |
| `backend/cloudbuild.yaml` | Backend-only deployment |
| `frontend/cloudbuild.yaml` | Frontend-only deployment |

---

## Prerequisites

### 1. GCP Project Setup

```bash
# Set your project
export PROJECT_ID=your-project-id
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```

### 2. Cloud Build Service Account Permissions

```bash
# Get Cloud Build service account
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Grant required roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/artifactregistry.writer"
```

### 3. Create Secrets

```bash
# Anthropic API Key
echo -n "sk-ant-your-api-key" | \
  gcloud secrets create anthropic-api-key --data-file=-

# JWT Secret (auto-generated)
openssl rand -base64 64 | \
  gcloud secrets create jwt-secret --data-file=-
```

---

## Deployment Commands

### First-Time Setup

Run this once to create infrastructure:

```bash
gcloud builds submit --config=cloudbuild-setup.yaml \
  --substitutions=_ANTHROPIC_API_KEY=sk-ant-your-key
```

### Full Deployment (Backend + Frontend)

```bash
# Deploy to production
gcloud builds submit --config=cloudbuild.yaml

# Deploy to staging
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_ENVIRONMENT=staging
```

### Backend Only

```bash
gcloud builds submit --config=backend/cloudbuild.yaml
```

### Frontend Only

```bash
gcloud builds submit --config=frontend/cloudbuild.yaml
```

### Database Migration

```bash
gcloud builds submit --config=cloudbuild-migrate.yaml
```

---

## Configuration Variables

### Main Deployment (`cloudbuild.yaml`)

| Variable | Default | Description |
|----------|---------|-------------|
| `_REGION` | `asia-south1` | GCP region |
| `_REPO_NAME` | `brainspark` | Artifact Registry repo |
| `_ENVIRONMENT` | `prod` | Environment (dev/staging/prod) |
| `_APP_URL` | `https://brainspark.siggmatreders.com` | Frontend URL |
| `_API_URL` | `https://api.brainspark.siggmatreders.com` | API URL |
| `_BACKEND_MIN_INSTANCES` | `1` | Min backend instances |
| `_BACKEND_MAX_INSTANCES` | `10` | Max backend instances |
| `_BACKEND_MEMORY` | `1Gi` | Backend memory |
| `_BACKEND_CPU` | `2` | Backend CPU |
| `_FRONTEND_MIN_INSTANCES` | `1` | Min frontend instances |
| `_FRONTEND_MAX_INSTANCES` | `5` | Max frontend instances |

### Override Variables

```bash
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_ENVIRONMENT=staging,_BACKEND_MIN_INSTANCES=0,_BACKEND_MAX_INSTANCES=2
```

---

## Build Triggers (Automated Deployment)

### Create Trigger for Main Branch

```bash
gcloud builds triggers create github \
  --name="brainspark-deploy-prod" \
  --repo-owner="your-org" \
  --repo-name="BrainSpark" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  --substitutions="_ENVIRONMENT=prod"
```

### Create Trigger for Develop Branch

```bash
gcloud builds triggers create github \
  --name="brainspark-deploy-staging" \
  --repo-owner="your-org" \
  --repo-name="BrainSpark" \
  --branch-pattern="^develop$" \
  --build-config="cloudbuild.yaml" \
  --substitutions="_ENVIRONMENT=staging,_BACKEND_MIN_INSTANCES=0"
```

---

## Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUD BUILD PIPELINE                      │
└─────────────────────────────────────────────────────────────┘

  ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ Validate │────▶│  Build   │────▶│   Push   │
  │ Structure│     │  Images  │     │ Registry │
  └──────────┘     └──────────┘     └──────────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
     ┌──────────┐              ┌──────────┐
     │  Deploy  │              │  Deploy  │
     │ Backend  │              │ Frontend │
     │Cloud Run │              │Cloud Run │
     └──────────┘              └──────────┘
            │                         │
            └────────────┬────────────┘
                         ▼
                  ┌──────────┐
                  │  Verify  │
                  │  Health  │
                  └──────────┘
```

---

## Monitoring Builds

### View Build Logs

```bash
# List recent builds
gcloud builds list --limit=10

# Stream logs for a specific build
gcloud builds log BUILD_ID --stream

# View in console
# https://console.cloud.google.com/cloud-build/builds
```

### Check Deployment Status

```bash
# Backend status
gcloud run services describe brainspark-api --region=asia-south1

# Frontend status
gcloud run services describe brainspark-web --region=asia-south1

# View logs
gcloud run logs read --service=brainspark-api --region=asia-south1
```

---

## Troubleshooting

### Build Fails: Permission Denied

```bash
# Ensure Cloud Build SA has permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/run.admin"
```

### Build Fails: Secret Access

```bash
# Grant secret access
gcloud secrets add-iam-policy-binding anthropic-api-key \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/secretmanager.secretAccessor"
```

### Build Fails: Artifact Registry

```bash
# Create repository if not exists
gcloud artifacts repositories create brainspark \
  --repository-format=docker \
  --location=asia-south1
```

### Deployment Slow

- Increase machine type in `options.machineType`
- Use `E2_HIGHCPU_32` for faster builds

---

## Costs

| Resource | Estimated Cost |
|----------|---------------|
| Cloud Build | ~$0.003/build-minute |
| Artifact Registry | ~$0.10/GB/month |
| Cloud Run (Backend) | ~$50-150/month |
| Cloud Run (Frontend) | ~$20-50/month |

---

## Quick Reference

```bash
# Full deployment
gcloud builds submit --config=cloudbuild.yaml

# Setup infrastructure
gcloud builds submit --config=cloudbuild-setup.yaml

# Backend only
gcloud builds submit --config=backend/cloudbuild.yaml

# Frontend only
gcloud builds submit --config=frontend/cloudbuild.yaml

# View builds
gcloud builds list

# Check services
gcloud run services list --region=asia-south1
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-15 | BrainSpark Team | Initial guide |
