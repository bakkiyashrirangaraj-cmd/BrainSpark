# BrainSpark - GCP Deployment Architecture

## Production Domain
**https://brainspark.siggmatreders.com**

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BRAINSPARK GCP ARCHITECTURE                          │
│                      brainspark.siggmatreders.com                           │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   USERS     │
                              │  (Parents   │
                              │  & Children)│
                              └──────┬──────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLOUDFLARE / CLOUD CDN                            │
│                        brainspark.siggmatreders.com                         │
│                     ┌─────────────────────────────────┐                     │
│                     │  SSL/TLS  │  DDoS  │  Caching   │                     │
│                     └─────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
┌──────────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│   FRONTEND (PWA)     │ │   BACKEND API    │ │   STATIC ASSETS      │
│   Cloud Run          │ │   Cloud Run      │ │   Cloud Storage      │
│                      │ │                  │ │                      │
│ brainspark.          │ │ api.brainspark.  │ │ cdn.brainspark.      │
│ siggmatreders.com    │ │ siggmatreders.com│ │ siggmatreders.com    │
│                      │ │                  │ │                      │
│ • React 18 + TS      │ │ • FastAPI        │ │ • Images/Icons       │
│ • Tailwind CSS       │ │ • Python 3.11    │ │ • Audio files        │
│ • PWA (offline)      │ │ • SQLAlchemy     │ │ • Mascot assets      │
└──────────────────────┘ └────────┬─────────┘ └──────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
┌──────────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│   CLOUD SQL          │ │   MEMORYSTORE    │ │   EXTERNAL APIs      │
│   PostgreSQL 15      │ │   Redis 7        │ │                      │
│                      │ │                  │ │ • Anthropic Claude   │
│ • User data          │ │ • Session cache  │ │ • Firebase Auth      │
│ • Conversations      │ │ • Rate limiting  │ │ • SendGrid (email)   │
│ • Progress           │ │ • AI responses   │ │                      │
└──────────────────────┘ └──────────────────┘ └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            MONITORING & LOGGING                             │
│         Cloud Monitoring  │  Cloud Logging  │  Error Reporting              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Domain Configuration

### 2.1 DNS Records (siggmatreders.com DNS Provider)

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | brainspark | `<GCP Load Balancer IP>` | 300 |
| CNAME | api.brainspark | ghs.googlehosted.com | 300 |
| CNAME | cdn.brainspark | c.storage.googleapis.com | 300 |
| TXT | brainspark | google-site-verification=`<token>` | 300 |
| TXT | _dmarc.brainspark | v=DMARC1; p=reject | 300 |

### 2.2 SSL Certificates
- **Provider:** Google-managed SSL (automatic)
- **Domains covered:**
  - brainspark.siggmatreders.com
  - api.brainspark.siggmatreders.com
  - cdn.brainspark.siggmatreders.com

---

## 3. GCP Project Structure

### 3.1 Project Setup

```
GCP Organization
└── Project: brainspark-prod
    ├── Region: us-central1 (primary)
    ├── Zone: us-central1-a
    └── Billing: Enabled
```

### 3.2 Required GCP APIs

| API | Purpose |
|-----|---------|
| Cloud Run API | Container hosting |
| Cloud SQL Admin API | PostgreSQL database |
| Cloud Storage API | Static assets |
| Cloud Build API | CI/CD |
| Secret Manager API | API keys & secrets |
| Cloud Monitoring API | Metrics & alerts |
| Cloud Logging API | Application logs |
| Artifact Registry API | Docker images |
| Redis API | Memorystore cache |
| Identity Platform | Firebase Auth |

### 3.3 Service Accounts

| Account | Purpose | Roles |
|---------|---------|-------|
| brainspark-api@*.iam | Backend service | Cloud SQL Client, Secret Accessor |
| brainspark-frontend@*.iam | Frontend service | Storage Object Viewer |
| brainspark-deploy@*.iam | CI/CD deployment | Cloud Run Admin, Cloud Build Editor |

---

## 4. Infrastructure Components

### 4.1 Cloud Run Services

#### Frontend Service
```yaml
Service: brainspark-frontend
URL: https://brainspark.siggmatreders.com
Region: us-central1
CPU: 1
Memory: 512Mi
Min Instances: 1
Max Instances: 10
Concurrency: 80
```

#### Backend API Service
```yaml
Service: brainspark-api
URL: https://api.brainspark.siggmatreders.com
Region: us-central1
CPU: 2
Memory: 1Gi
Min Instances: 1
Max Instances: 20
Concurrency: 100
Timeout: 300s
```

### 4.2 Cloud SQL (PostgreSQL)

```yaml
Instance: brainspark-db
Database Version: POSTGRES_15
Region: us-central1
Tier: db-custom-2-4096 (2 vCPU, 4GB RAM)
Storage: 20GB SSD (auto-increase)
High Availability: Enabled (prod)
Backups: Daily, 7-day retention
Point-in-time Recovery: Enabled
```

### 4.3 Memorystore (Redis)

```yaml
Instance: brainspark-cache
Version: REDIS_7_0
Region: us-central1
Tier: BASIC (Standard for prod)
Memory: 1GB
```

### 4.4 Cloud Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| brainspark-assets | Mascots, icons, images | Public (CDN) |
| brainspark-audio | Sound effects, voice | Public (CDN) |
| brainspark-backups | Database backups | Private |
| brainspark-uploads | User uploads (if any) | Private |

---

## 5. Code Requirements Checklist

### 5.1 Backend (Python/FastAPI)

| Component | File Path | Status |
|-----------|-----------|--------|
| Main Application | `backend/app/main.py` | ❌ Required |
| Database Models | `backend/app/models/` | ❌ Required |
| API Routes | `backend/app/routes/` | ❌ Required |
| Authentication | `backend/app/auth/` | ❌ Required |
| Claude Integration | `backend/app/services/claude.py` | ❌ Required |
| Database Migrations | `backend/alembic/` | ❌ Required |
| Requirements | `backend/requirements.txt` | ❌ Required |
| Dockerfile | `backend/Dockerfile` | ❌ Required |
| Config | `backend/app/config.py` | ❌ Required |

### 5.2 Frontend (React/TypeScript)

| Component | File Path | Status |
|-----------|-----------|--------|
| App Entry | `frontend/src/App.tsx` | ❌ Required |
| Components | `frontend/src/components/` | ❌ Required |
| Pages | `frontend/src/pages/` | ❌ Required |
| API Client | `frontend/src/api/` | ❌ Required |
| Auth Context | `frontend/src/contexts/auth.tsx` | ❌ Required |
| PWA Manifest | `frontend/public/manifest.json` | ❌ Required |
| Service Worker | `frontend/src/sw.ts` | ❌ Required |
| Dockerfile | `frontend/Dockerfile` | ❌ Required |
| Package.json | `frontend/package.json` | ❌ Required |

### 5.3 Infrastructure (Terraform)

| Component | File Path | Status |
|-----------|-----------|--------|
| Main Config | `terraform/main.tf` | ❌ Required |
| Variables | `terraform/variables.tf` | ❌ Required |
| Cloud Run | `terraform/modules/cloud-run/` | ❌ Required |
| Cloud SQL | `terraform/modules/cloud-sql/` | ❌ Required |
| Networking | `terraform/modules/networking/` | ❌ Required |
| Secrets | `terraform/modules/secrets/` | ❌ Required |

### 5.4 CI/CD (GitHub Actions)

| Component | File Path | Status |
|-----------|-----------|--------|
| Main Pipeline | `.github/workflows/deploy.yml` | ❌ Required |
| Test Pipeline | `.github/workflows/test.yml` | ❌ Required |
| PR Checks | `.github/workflows/pr.yml` | ❌ Required |

### 5.5 Configuration Files

| File | Purpose | Status |
|------|---------|--------|
| `docker-compose.yml` | Local development | ❌ Required |
| `.env.example` | Environment template | ❌ Required |
| `cloudbuild.yaml` | GCP Cloud Build | ❌ Required |
| `.gitignore` | Git ignore rules | ❌ Required |

---

## 6. Environment Variables

### 6.1 Backend Environment

```bash
# Application
APP_NAME=BrainSpark
APP_ENV=production
APP_URL=https://brainspark.siggmatreders.com
API_URL=https://api.brainspark.siggmatreders.com
DEBUG=false

# Database
DATABASE_URL=postgresql://user:pass@/brainspark?host=/cloudsql/project:region:instance

# Redis
REDIS_URL=redis://10.0.0.x:6379

# Authentication
FIREBASE_PROJECT_ID=brainspark-prod
FIREBASE_API_KEY=<from-firebase-console>

# Claude API
ANTHROPIC_API_KEY=<from-anthropic-console>
CLAUDE_MODEL=claude-3-sonnet-20240229

# Email
SENDGRID_API_KEY=<from-sendgrid>
FROM_EMAIL=noreply@brainspark.siggmatreders.com

# Security
SECRET_KEY=<generate-256-bit-key>
CORS_ORIGINS=https://brainspark.siggmatreders.com
```

### 6.2 Frontend Environment

```bash
# API
VITE_API_URL=https://api.brainspark.siggmatreders.com
VITE_APP_URL=https://brainspark.siggmatreders.com

# Firebase
VITE_FIREBASE_API_KEY=<from-firebase-console>
VITE_FIREBASE_AUTH_DOMAIN=brainspark-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=brainspark-prod

# Analytics (optional)
VITE_MIXPANEL_TOKEN=<token>
VITE_SEGMENT_WRITE_KEY=<key>
```

---

## 7. Deployment Process

### 7.1 Initial Setup (One-time)

```bash
# Step 1: Create GCP Project
gcloud projects create brainspark-prod --name="BrainSpark Production"
gcloud config set project brainspark-prod

# Step 2: Enable APIs
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  redis.googleapis.com

# Step 3: Create Artifact Registry
gcloud artifacts repositories create brainspark \
  --repository-format=docker \
  --location=us-central1

# Step 4: Create Cloud SQL Instance
gcloud sql instances create brainspark-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-2-4096 \
  --region=us-central1 \
  --root-password=<secure-password>

# Step 5: Create Redis Instance
gcloud redis instances create brainspark-cache \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0

# Step 6: Store Secrets
gcloud secrets create anthropic-api-key \
  --data-file=./anthropic-key.txt
```

### 7.2 Deployment Commands

```bash
# Build and push backend
docker build -t us-central1-docker.pkg.dev/brainspark-prod/brainspark/api:latest ./backend
docker push us-central1-docker.pkg.dev/brainspark-prod/brainspark/api:latest

# Deploy backend to Cloud Run
gcloud run deploy brainspark-api \
  --image=us-central1-docker.pkg.dev/brainspark-prod/brainspark/api:latest \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --add-cloudsql-instances=brainspark-prod:us-central1:brainspark-db \
  --set-env-vars="APP_ENV=production"

# Build and push frontend
docker build -t us-central1-docker.pkg.dev/brainspark-prod/brainspark/frontend:latest ./frontend
docker push us-central1-docker.pkg.dev/brainspark-prod/brainspark/frontend:latest

# Deploy frontend to Cloud Run
gcloud run deploy brainspark-frontend \
  --image=us-central1-docker.pkg.dev/brainspark-prod/brainspark/frontend:latest \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated

# Map custom domains
gcloud run domain-mappings create \
  --service=brainspark-frontend \
  --domain=brainspark.siggmatreders.com \
  --region=us-central1

gcloud run domain-mappings create \
  --service=brainspark-api \
  --domain=api.brainspark.siggmatreders.com \
  --region=us-central1
```

---

## 8. Repository Structure (Target)

```
BrainSpark/
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   └── versions/
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── config.py
│       ├── models/
│       │   ├── __init__.py
│       │   ├── parent.py
│       │   ├── child.py
│       │   ├── conversation.py
│       │   └── progress.py
│       ├── routes/
│       │   ├── __init__.py
│       │   ├── auth.py
│       │   ├── conversations.py
│       │   ├── progress.py
│       │   └── dashboard.py
│       ├── services/
│       │   ├── __init__.py
│       │   ├── claude.py
│       │   └── email.py
│       └── auth/
│           ├── __init__.py
│           └── firebase.py
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── public/
│   │   ├── manifest.json
│   │   ├── sw.js
│   │   └── icons/
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── components/
│       ├── pages/
│       ├── contexts/
│       ├── hooks/
│       └── api/
│
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── environments/
│   │   ├── dev.tfvars
│   │   └── prod.tfvars
│   └── modules/
│       ├── cloud-run/
│       ├── cloud-sql/
│       ├── redis/
│       └── networking/
│
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       ├── test.yml
│       └── pr.yml
│
└── docs/
    ├── architecture/
    │   └── 00-GCP-DEPLOYMENT-ARCHITECTURE.md (this file)
    ├── planning/
    ├── technical/
    ├── design/
    └── operations/
```

---

## 9. Cost Estimation (Monthly)

| Service | Configuration | Est. Cost |
|---------|---------------|-----------|
| Cloud Run (API) | 1-20 instances | $30-80 |
| Cloud Run (Frontend) | 1-10 instances | $15-40 |
| Cloud SQL | db-custom-2-4096 | $50-70 |
| Memorystore Redis | 1GB Basic | $35 |
| Cloud Storage | 10GB + egress | $5-15 |
| Cloud CDN | Moderate traffic | $10-30 |
| Secrets Manager | 10 secrets | $1 |
| Cloud Monitoring | Basic | Free tier |
| **Subtotal GCP** | | **$146-271** |
| Anthropic Claude API | ~10k conversations | $50-200 |
| SendGrid | 10k emails | Free-$20 |
| **Total** | | **$200-500/month** |

---

## 10. Next Steps to Deploy

### Immediate Actions Required

| # | Action | Owner | Time Est. |
|---|--------|-------|-----------|
| 1 | Create GCP project "brainspark-prod" | DevOps | 1 hour |
| 2 | Enable required APIs | DevOps | 30 min |
| 3 | Configure DNS records on siggmatreders.com | Admin | 30 min |
| 4 | Set up Firebase project + Auth | DevOps | 1 hour |
| 5 | Write backend code (FastAPI) | Developer | 2-3 weeks |
| 6 | Write frontend code (React) | Developer | 2-3 weeks |
| 7 | Create Terraform infrastructure | DevOps | 1 week |
| 8 | Set up CI/CD pipelines | DevOps | 2-3 days |
| 9 | Deploy to staging | DevOps | 1 day |
| 10 | Testing & QA | QA | 1 week |
| 11 | Production deployment | DevOps | 1 day |

### Development Priority Order

```
Week 1-2: Backend API
├── Database models & migrations
├── Authentication (Firebase)
├── Claude API integration
└── Core API endpoints

Week 2-3: Frontend
├── React app scaffolding
├── Authentication flow
├── Conversation UI
└── Basic progress display

Week 3-4: Infrastructure & Deployment
├── Terraform modules
├── CI/CD pipelines
├── Staging deployment
└── Production deployment

Week 4+: Beta Testing
├── Invite 20-50 families
├── Collect feedback
└── Iterate
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-15 | BrainSpark Team | Initial architecture document |
