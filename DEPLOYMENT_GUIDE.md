# BrainSpark - Production Deployment Guide

Complete guide for deploying BrainSpark to Google Cloud Platform using Cloud Run.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Configure Secrets](#configure-secrets)
4. [Deploy to Production](#deploy-to-production)
5. [Post-Deployment](#post-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)
8. [CI/CD Setup](#cicd-setup)

---

## Prerequisites

### Required Tools

1. **Google Cloud SDK (gcloud)**
   ```bash
   # Install gcloud CLI
   # https://cloud.google.com/sdk/docs/install

   # Verify installation
   gcloud version
   ```

2. **Git**
   ```bash
   git --version
   ```

3. **Project Access**
   - GCP Project: `brainspark-kids-companion`
   - Required IAM Roles:
     - Cloud Build Editor
     - Cloud Run Admin
     - Secret Manager Admin
     - Artifact Registry Admin

### API Keys

1. **Anthropic Claude API**
   - Sign up: https://console.anthropic.com
   - Create API key
   - Copy key (starts with `sk-ant-`)

2. **xAI Grok API**
   - Sign up: https://console.x.ai
   - Create API key
   - Copy key (starts with `xai-`)

---

## Initial Setup

### 1. Authenticate with Google Cloud

```bash
# Login to Google Cloud
gcloud auth login

# Set project
gcloud config set project brainspark-kids-companion

# Verify configuration
gcloud config list
```

### 2. Enable Required APIs

```bash
# Enable all required GCP APIs
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    secretmanager.googleapis.com \
    artifactregistry.googleapis.com \
    cloudresourcemanager.googleapis.com
```

### 3. Create Artifact Registry Repository

```bash
# Create Docker repository
gcloud artifacts repositories create brainspark \
    --repository-format=docker \
    --location=asia-south1 \
    --description="BrainSpark Docker images"

# Verify creation
gcloud artifacts repositories list --location=asia-south1
```

---

## Configure Secrets

### Option 1: Automated Setup (Recommended)

Use the provided script to configure all secrets:

```bash
# Make script executable
chmod +x scripts/setup-secrets.sh

# Run secrets setup
./scripts/setup-secrets.sh
```

The script will prompt you for:
- ✅ Claude API key
- ✅ Grok API key
- ✅ JWT secret (auto-generated if not provided)
- ✅ Database URL

### Option 2: Manual Setup

Create secrets manually using gcloud:

```bash
# 1. Claude API Key
echo -n "sk-ant-your-claude-api-key" | \
    gcloud secrets create anthropic-api-key --data-file=-

# 2. Grok API Key
echo -n "xai-your-grok-api-key" | \
    gcloud secrets create grok-api-key --data-file=-

# 3. JWT Secret (generate random)
openssl rand -hex 32 | \
    gcloud secrets create jwt-secret --data-file=-

# 4. Database URL (SQLite for now, PostgreSQL for production)
echo -n "sqlite:///./brainspark.db" | \
    gcloud secrets create database-url --data-file=-
```

### Verify Secrets

```bash
# List all secrets
gcloud secrets list

# View a secret value
gcloud secrets versions access latest --secret=grok-api-key
```

---

## Deploy to Production

### Quick Deployment

```bash
# Make deployment script executable
chmod +x scripts/deploy-production.sh

# Run deployment
./scripts/deploy-production.sh
```

The script will:
1. ✅ Validate your GCP project
2. ✅ Trigger Cloud Build
3. ✅ Build backend Docker image
4. ✅ Build frontend Docker image
5. ✅ Deploy to Cloud Run
6. ✅ Run health checks
7. ✅ Display service URLs

### Manual Deployment

```bash
# Submit build to Cloud Build
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_ENVIRONMENT=prod,_REGION=asia-south1 \
    --timeout=1200s
```

### Deployment Configuration

Edit `cloudbuild.yaml` to customize:

```yaml
substitutions:
  _REGION: 'asia-south1'              # GCP region
  _ENVIRONMENT: 'prod'                 # Environment name
  _APP_URL: 'https://brainspark.siggmatreders.com'
  _API_URL: 'https://api.brainspark.siggmatreders.com'

  # Backend scaling
  _BACKEND_MIN_INSTANCES: '1'          # Always-on instances
  _BACKEND_MAX_INSTANCES: '10'         # Max scale
  _BACKEND_MEMORY: '1Gi'               # Memory per instance
  _BACKEND_CPU: '2'                    # CPU per instance

  # Frontend scaling
  _FRONTEND_MIN_INSTANCES: '1'
  _FRONTEND_MAX_INSTANCES: '5'
  _FRONTEND_MEMORY: '256Mi'
  _FRONTEND_CPU: '1'

  # AI Model
  _DEFAULT_AI_MODEL: 'claude'          # 'claude' or 'grok'
```

---

## Post-Deployment

### 1. Get Service URLs

```bash
# Backend API URL
gcloud run services describe brainspark-api \
    --region=asia-south1 \
    --format='value(status.url)'

# Frontend URL
gcloud run services describe brainspark-web \
    --region=asia-south1 \
    --format='value(status.url)'
```

### 2. Test Deployment

```bash
# Test backend health
curl https://YOUR-API-URL/health

# Test API docs
open https://YOUR-API-URL/docs

# Test frontend
open https://YOUR-FRONTEND-URL
```

### 3. Configure Custom Domains

#### Map Backend Domain

```bash
# Create domain mapping for API
gcloud run domain-mappings create \
    --service=brainspark-api \
    --domain=api.brainspark.siggmatreders.com \
    --region=asia-south1
```

#### Map Frontend Domain

```bash
# Create domain mapping for web
gcloud run domain-mappings create \
    --service=brainspark-web \
    --domain=brainspark.siggmatreders.com \
    --region=asia-south1
```

#### Update DNS Records

After creating domain mappings, add DNS records:

```bash
# Get DNS records to create
gcloud run domain-mappings describe \
    --domain=api.brainspark.siggmatreders.com \
    --region=asia-south1
```

Add the provided DNS records to your domain registrar:
- Type: A or CNAME
- Name: api or @
- Value: (provided by Cloud Run)

### 4. Enable HTTPS (Automatic)

Cloud Run automatically provisions and manages SSL certificates for custom domains. Wait 15-30 minutes for certificate provisioning.

---

## Monitoring & Maintenance

### View Logs

```bash
# Backend logs
gcloud run logs read brainspark-api \
    --region=asia-south1 \
    --limit=50

# Frontend logs
gcloud run logs read brainspark-web \
    --region=asia-south1 \
    --limit=50

# Follow logs in real-time
gcloud run logs tail brainspark-api --region=asia-south1
```

### Monitor Performance

```bash
# View service metrics
gcloud run services describe brainspark-api \
    --region=asia-south1 \
    --format=yaml

# Get request count
gcloud monitoring time-series list \
    --filter='metric.type="run.googleapis.com/request_count"' \
    --format=json
```

### Update Environment Variables

```bash
# Update backend environment
gcloud run services update brainspark-api \
    --region=asia-south1 \
    --set-env-vars="DEFAULT_AI_MODEL=grok"
```

### Update Secrets

```bash
# Update Grok API key
echo -n "new-grok-api-key" | \
    gcloud secrets versions add grok-api-key --data-file=-

# Cloud Run will automatically use new version
```

### Scale Services

```bash
# Scale backend
gcloud run services update brainspark-api \
    --region=asia-south1 \
    --min-instances=2 \
    --max-instances=20

# Scale frontend
gcloud run services update brainspark-web \
    --region=asia-south1 \
    --min-instances=2 \
    --max-instances=10
```

---

## Troubleshooting

### Deployment Fails

```bash
# Check Cloud Build logs
gcloud builds list --limit=5

# View specific build
gcloud builds log BUILD_ID
```

### Service Not Starting

```bash
# Check service status
gcloud run services describe brainspark-api \
    --region=asia-south1

# Check recent logs
gcloud run logs read brainspark-api \
    --region=asia-south1 \
    --limit=100
```

### Database Connection Issues

```bash
# Verify database URL secret
gcloud secrets versions access latest --secret=database-url

# Update if needed
echo -n "postgresql://..." | \
    gcloud secrets versions add database-url --data-file=-
```

### AI API Errors

```bash
# Check API key secrets
gcloud secrets versions access latest --secret=anthropic-api-key
gcloud secrets versions access latest --secret=grok-api-key

# Test keys manually
curl -X POST https://api.x.ai/v1/chat/completions \
    -H "Authorization: Bearer YOUR-GROK-KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"grok-2-latest","messages":[{"role":"user","content":"test"}]}'
```

### High Costs

```bash
# View current costs
gcloud billing accounts list

# Check usage
gcloud monitoring dashboards create \
    --config-from-file=monitoring-dashboard.yaml

# Reduce costs:
# 1. Lower min instances to 0
# 2. Reduce max instances
# 3. Use smaller instance sizes
```

---

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yaml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - id: 'auth'
        uses: 'google-github-actions/auth@v1'
        with:
          credentials_json: '${{ secrets.GCP_SA_KEY }}'

      - name: 'Set up Cloud SDK'
        uses: 'google-github-actions/setup-gcloud@v1'

      - name: 'Deploy'
        run: |
          gcloud builds submit \
            --config=cloudbuild.yaml \
            --substitutions=_ENVIRONMENT=prod
```

### Cloud Build Triggers

```bash
# Create trigger for main branch
gcloud builds triggers create github \
    --repo-name=brainspark \
    --repo-owner=YOUR-GITHUB-USERNAME \
    --branch-pattern=^main$ \
    --build-config=cloudbuild.yaml
```

---

## Production Checklist

Before going live:

- [ ] All secrets configured in Secret Manager
- [ ] Custom domains mapped and DNS configured
- [ ] SSL certificates provisioned (automatic)
- [ ] Monitoring and alerting set up
- [ ] Backup strategy for database
- [ ] API rate limiting configured
- [ ] CORS configured for production domains
- [ ] Error tracking (Sentry/Cloud Error Reporting)
- [ ] Load testing completed
- [ ] Security review completed
- [ ] Privacy policy and terms of service published
- [ ] GDPR compliance reviewed (if applicable)
- [ ] API quotas and limits understood
- [ ] Cost alerts configured
- [ ] Incident response plan documented

---

## Cost Optimization

### Reduce Cloud Run Costs

```bash
# Use smaller instances
gcloud run services update brainspark-api \
    --memory=512Mi \
    --cpu=1

# Reduce min instances (cold starts acceptable)
gcloud run services update brainspark-api \
    --min-instances=0

# Set max concurrency
gcloud run services update brainspark-api \
    --concurrency=100
```

### Estimated Monthly Costs

**Current Configuration:**
- Backend: 1 min instance, 10 max @ 1GB RAM, 2 CPU
- Frontend: 1 min instance, 5 max @ 256MB RAM, 1 CPU
- Estimated: $50-100/month for low traffic
- AI API costs separate (Claude ~$3-15/M tokens, Grok varies)

---

## Support & Resources

### Documentation
- Cloud Run: https://cloud.google.com/run/docs
- Secret Manager: https://cloud.google.com/secret-manager/docs
- Cloud Build: https://cloud.google.com/build/docs

### API Documentation
- Claude API: https://docs.anthropic.com
- Grok API: https://docs.x.ai

### Monitoring
- GCP Console: https://console.cloud.google.com
- Cloud Run Dashboard: https://console.cloud.google.com/run
- Logs Explorer: https://console.cloud.google.com/logs

---

## Quick Reference

```bash
# Deploy
./scripts/deploy-production.sh

# View logs
gcloud run logs tail brainspark-api --region=asia-south1

# Update secret
echo "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Scale
gcloud run services update SERVICE_NAME --max-instances=20

# Rollback
gcloud run services update-traffic SERVICE_NAME --to-revisions=PREVIOUS_REVISION=100
```

---

**Last Updated:** December 17, 2025
**Version:** 1.0.0
**Maintainer:** BrainSpark DevOps Team
