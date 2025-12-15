# BrainSpark - Technical Architecture Document

## Document Purpose

This document defines the technical architecture for the BrainSpark application, including system components, technology choices, infrastructure design, and integration patterns.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Components](#3-system-components)
4. [Infrastructure Design](#4-infrastructure-design)
5. [Data Architecture](#5-data-architecture)
6. [Security Architecture](#6-security-architecture)
7. [Integration Architecture](#7-integration-architecture)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Monitoring & Observability](#9-monitoring--observability)
10. [Disaster Recovery](#10-disaster-recovery)

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Mobile    │  │   Tablet    │  │   Desktop   │  │   Parent    │   │
│  │   (PWA)     │  │   (PWA)     │  │   (PWA)     │  │  Dashboard  │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
│         │                │                │                │           │
│         └────────────────┴────────────────┴────────────────┘           │
│                                   │                                     │
│                          HTTPS / WebSocket                              │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────┐
│                           EDGE LAYER                                     │
├───────────────────────────────────┼─────────────────────────────────────┤
│  ┌────────────────────────────────┴────────────────────────────────┐   │
│  │                    Cloud CDN / Load Balancer                     │   │
│  │              (GCP Cloud CDN + Cloud Load Balancing)              │   │
│  └────────────────────────────────┬────────────────────────────────┘   │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────┐
│                         APPLICATION LAYER                                │
├───────────────────────────────────┼─────────────────────────────────────┤
│  ┌────────────────────────────────┴────────────────────────────────┐   │
│  │                    API Gateway (Cloud Endpoints)                 │   │
│  └────────┬───────────────────┬───────────────────┬────────────────┘   │
│           │                   │                   │                     │
│  ┌────────▼────────┐ ┌────────▼────────┐ ┌───────▼────────┐           │
│  │   Auth Service  │ │   Core API      │ │   AI Service   │           │
│  │  (Cloud Run)    │ │  (Cloud Run)    │ │  (Cloud Run)   │           │
│  └────────┬────────┘ └────────┬────────┘ └───────┬────────┘           │
│           │                   │                   │                     │
│           └───────────────────┴───────────────────┘                     │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────┐
│                           DATA LAYER                                     │
├───────────────────────────────────┼─────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  Cloud SQL  │  │   Redis     │  │   Cloud     │  │   Firestore │   │
│  │ (PostgreSQL)│  │MemoryStore  │  │   Storage   │  │  (Sessions) │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────┐
│                        EXTERNAL SERVICES                                 │
├───────────────────────────────────┼─────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  Claude AI  │  │  Firebase   │  │   SendGrid  │  │   Sentry    │   │
│  │    API      │  │    Auth     │  │   (Email)   │  │  (Errors)   │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Architecture Principles

| Principle | Description |
|-----------|-------------|
| **Cloud-Native** | Designed for GCP services, containers, auto-scaling |
| **Microservices** | Loosely coupled services with clear boundaries |
| **API-First** | All functionality exposed through well-documented APIs |
| **Security-by-Design** | Security considerations at every layer |
| **Event-Driven** | Asynchronous communication where appropriate |
| **Progressive Enhancement** | Core functionality works offline |

---

## 2. Technology Stack

### 2.1 Frontend Stack

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Framework | React | 18.x | Component-based, large ecosystem |
| Language | TypeScript | 5.x | Type safety, better DX |
| Styling | Tailwind CSS | 3.x | Utility-first, rapid development |
| State | Zustand | 4.x | Simple, performant state management |
| Animation | Framer Motion | 10.x | Smooth animations for children |
| PWA | Workbox | 7.x | Service worker management |
| Forms | React Hook Form | 7.x | Performance, validation |
| Data Fetching | TanStack Query | 5.x | Caching, background updates |
| Testing | Vitest + Testing Library | Latest | Fast, React-focused testing |

### 2.2 Backend Stack

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Framework | FastAPI | 0.104+ | Async, automatic OpenAPI docs |
| Language | Python | 3.11+ | AI/ML ecosystem, readability |
| ORM | SQLAlchemy | 2.x | Async support, mature |
| Validation | Pydantic | 2.x | Fast validation, OpenAPI |
| Task Queue | Celery | 5.x | Background jobs, scheduled tasks |
| Testing | pytest + pytest-asyncio | Latest | Comprehensive async testing |

### 2.3 Data Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Primary DB | PostgreSQL 15 | ACID, JSONB, mature |
| Cache | Redis 7 | Sessions, rate limiting, leaderboards |
| File Storage | GCP Cloud Storage | Scalable, CDN integration |
| Real-time | Firestore | WebSocket alternative for progress |

### 2.4 AI Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| LLM Provider | Anthropic Claude | Best reasoning, safety features |
| Model | Claude 3 Sonnet | Balance of quality and speed |
| Content Filter | Custom + Claude | Multi-layer safety |

### 2.5 Infrastructure Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Cloud | Google Cloud Platform | Existing expertise, integrated services |
| Containers | Docker | Consistent environments |
| Orchestration | Cloud Run | Serverless containers, auto-scale |
| CDN | Cloud CDN | Global distribution |
| DNS | Cloud DNS | Managed DNS |
| Secrets | Secret Manager | Secure credential storage |
| Monitoring | Cloud Monitoring + Sentry | Full observability |
| CI/CD | GitHub Actions | Integrated with repository |

---

## 3. System Components

### 3.1 Frontend Application

```
frontend/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # Offline support
│   └── assets/
│       ├── mascots/           # Age-group mascots
│       ├── sounds/            # UI sounds
│       └── animations/        # Lottie files
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── common/            # Buttons, inputs, etc.
│   │   ├── constellation/     # Knowledge map
│   │   ├── conversation/      # Chat interface
│   │   ├── rewards/           # Badges, streaks
│   │   └── mascot/            # AI companion
│   ├── features/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── brain-spark/
│   │   ├── explore/
│   │   └── dashboard/
│   ├── hooks/
│   │   ├── useConversation.ts
│   │   ├── useConstellation.ts
│   │   └── useRewards.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── ai.ts
│   ├── stores/
│   │   ├── userStore.ts
│   │   ├── conversationStore.ts
│   │   └── progressStore.ts
│   └── types/
│       └── index.ts
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

### 3.2 Backend Services

#### Auth Service
- User registration and login
- JWT token management
- Parent-child relationship management
- COPPA consent tracking

#### Core API Service
- User profile management
- Progress tracking
- Constellation state
- Streak management
- Rewards system

#### AI Service
- Conversation orchestration
- Content generation
- Safety filtering
- Personalization engine

```
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── dependencies.py
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── children.py
│   │   │   ├── conversations.py
│   │   │   ├── progress.py
│   │   │   ├── rewards.py
│   │   │   └── dashboard.py
│   │   └── router.py
│   ├── services/
│   │   ├── ai_engine.py
│   │   ├── content_filter.py
│   │   ├── conversation_manager.py
│   │   ├── progress_tracker.py
│   │   ├── reward_engine.py
│   │   └── notification_service.py
│   ├── models/
│   │   ├── user.py
│   │   ├── child.py
│   │   ├── conversation.py
│   │   ├── topic.py
│   │   └── reward.py
│   ├── schemas/
│   │   └── ...
│   ├── repositories/
│   │   └── ...
│   └── utils/
│       ├── security.py
│       ├── rate_limiter.py
│       └── validators.py
├── tests/
├── alembic/
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

### 3.3 AI Engine Detail

```python
# Conceptual AI Engine Architecture

class AIEngine:
    """
    Orchestrates AI-powered conversations with children.
    """

    def __init__(self):
        self.claude_client = AnthropicClient()
        self.content_filter = ContentFilter()
        self.personalization = PersonalizationEngine()

    async def generate_response(
        self,
        child_profile: ChildProfile,
        conversation_history: List[Message],
        user_input: str
    ) -> AIResponse:
        """
        Generate age-appropriate, personalized response.
        """
        # 1. Filter user input for safety
        filtered_input = await self.content_filter.filter_input(user_input)

        # 2. Build context-aware prompt
        prompt = self.build_prompt(
            age_group=child_profile.age_group,
            interests=child_profile.interests,
            history=conversation_history,
            input=filtered_input
        )

        # 3. Get AI response
        raw_response = await self.claude_client.complete(prompt)

        # 4. Filter output for safety
        safe_response = await self.content_filter.filter_output(raw_response)

        # 5. Add personalization touches
        final_response = self.personalization.enhance(
            response=safe_response,
            child_profile=child_profile
        )

        return final_response

    def build_prompt(self, age_group, interests, history, input):
        """
        Build age-appropriate prompt with system instructions.
        """
        system_prompts = {
            AgeGroup.WONDER_CUBS: WONDER_CUBS_SYSTEM_PROMPT,
            AgeGroup.CURIOUS_EXPLORERS: CURIOUS_EXPLORERS_SYSTEM_PROMPT,
            AgeGroup.MIND_MASTERS: MIND_MASTERS_SYSTEM_PROMPT,
        }

        return {
            "system": system_prompts[age_group],
            "messages": history + [{"role": "user", "content": input}]
        }
```

---

## 4. Infrastructure Design

### 4.1 GCP Resource Architecture

```yaml
# terraform/main.tf conceptual structure

# Project and APIs
project: brainspark-prod
region: us-central1
zone: us-central1-a

# Networking
vpc:
  name: brainspark-vpc
  subnets:
    - name: app-subnet
      cidr: 10.0.1.0/24
    - name: data-subnet
      cidr: 10.0.2.0/24

# Compute (Cloud Run)
services:
  - name: auth-service
    image: gcr.io/brainspark/auth:latest
    cpu: 1
    memory: 512Mi
    min_instances: 1
    max_instances: 10

  - name: core-api
    image: gcr.io/brainspark/core-api:latest
    cpu: 2
    memory: 1Gi
    min_instances: 2
    max_instances: 50

  - name: ai-service
    image: gcr.io/brainspark/ai-service:latest
    cpu: 2
    memory: 2Gi
    min_instances: 1
    max_instances: 20

# Database
cloud_sql:
  - name: brainspark-db
    tier: db-custom-2-4096
    disk_size: 100GB
    disk_type: SSD
    availability: REGIONAL
    backup: true
    point_in_time_recovery: true

# Cache
memorystore:
  - name: brainspark-cache
    tier: STANDARD_HA
    memory_size_gb: 1
    redis_version: REDIS_7_0

# Storage
cloud_storage:
  - name: brainspark-assets
    location: US
    storage_class: STANDARD
    lifecycle:
      - action: SetStorageClass
        condition: { age: 365 }
        storage_class: NEARLINE

# Load Balancing
load_balancer:
  type: EXTERNAL_MANAGED
  ssl: managed
  domains:
    - brainspark.app
    - api.brainspark.app
  cdn: enabled

# Secret Manager
secrets:
  - ANTHROPIC_API_KEY
  - DATABASE_URL
  - REDIS_URL
  - JWT_SECRET
  - FIREBASE_CREDENTIALS
```

### 4.2 Auto-Scaling Configuration

```yaml
# Cloud Run auto-scaling settings

ai-service:
  scaling:
    min_instances: 1
    max_instances: 20
    concurrency: 10  # Lower due to AI response time
    cpu_utilization_target: 70

core-api:
  scaling:
    min_instances: 2
    max_instances: 50
    concurrency: 80
    cpu_utilization_target: 80

# Scale-up triggers:
# - CPU > 70%
# - Request count spike
# - Memory > 80%

# Scale-down:
# - After 5 minutes of low utilization
# - Gradual (remove 1 instance at a time)
```

---

## 5. Data Architecture

### 5.1 Database Schema Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Schema                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐        │
│  │   parents   │────<│  children   │────<│conversations│        │
│  └─────────────┘     └─────────────┘     └─────────────┘        │
│         │                   │                   │                │
│         │                   │                   │                │
│         │            ┌──────┴──────┐     ┌──────┴──────┐        │
│         │            │             │     │             │        │
│         │      ┌─────▼─────┐ ┌─────▼─────┐ ┌───────────▼───┐   │
│         │      │  streaks  │ │ progress  │ │   messages    │   │
│         │      └───────────┘ └───────────┘ └───────────────┘   │
│         │                                                       │
│         │      ┌───────────┐ ┌───────────┐ ┌───────────────┐   │
│         └─────>│  consents │ │  rewards  │ │    topics     │   │
│                └───────────┘ └───────────┘ └───────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Key Tables

```sql
-- Core User Tables

CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    auth_provider VARCHAR(50),  -- 'email', 'google', 'apple'
    auth_provider_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}'
);

CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    age_group VARCHAR(20) NOT NULL,  -- 'wonder_cubs', 'curious_explorers', 'mind_masters'
    avatar_id VARCHAR(50),
    interests TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{}',
    CONSTRAINT valid_age_group CHECK (age_group IN ('wonder_cubs', 'curious_explorers', 'mind_masters'))
);

-- Progress & Engagement Tables

CREATE TABLE streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_history JSONB DEFAULT '[]',
    UNIQUE(child_id)
);

CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id),
    depth_level INTEGER DEFAULT 1,
    time_spent_seconds INTEGER DEFAULT 0,
    questions_asked INTEGER DEFAULT 0,
    last_interaction TIMESTAMPTZ,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(child_id, topic_id)
);

CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL,  -- 'badge', 'star', 'unlock'
    reward_id VARCHAR(100) NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Content Tables

CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    parent_topic_id UUID REFERENCES topics(id),
    prerequisites UUID[],
    age_groups VARCHAR(20)[],
    position_x FLOAT,  -- Constellation position
    position_y FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    depth_reached INTEGER DEFAULT 1,
    summary TEXT,
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,  -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Compliance Tables

CREATE TABLE consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL,  -- 'coppa', 'terms', 'marketing'
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT
);

-- Indexes

CREATE INDEX idx_children_parent ON children(parent_id);
CREATE INDEX idx_progress_child ON progress(child_id);
CREATE INDEX idx_conversations_child ON conversations(child_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_rewards_child ON rewards(child_id);
CREATE INDEX idx_streaks_child ON streaks(child_id);
```

### 5.3 Caching Strategy

```yaml
# Redis Cache Structure

session:
  key: "session:{session_id}"
  ttl: 7 days
  data: { user_id, child_id, permissions }

rate_limit:
  key: "ratelimit:{user_id}:{endpoint}"
  ttl: 1 minute
  data: request_count

conversation_context:
  key: "conv:{conversation_id}"
  ttl: 1 hour
  data: { messages[], topic_context }

leaderboard:
  key: "leaderboard:{type}:{period}"
  ttl: 5 minutes
  data: sorted_set

daily_spark:
  key: "spark:{date}:{age_group}"
  ttl: 24 hours
  data: { question, hints, follow_ups }

child_progress:
  key: "progress:{child_id}"
  ttl: 10 minutes
  data: { constellation_state, rewards }
```

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    1. Login Request    ┌──────────────────────┐  │
│  │  Client  │ ─────────────────────> │    Auth Service      │  │
│  └──────────┘                        └──────────────────────┘  │
│       │                                       │                 │
│       │                              2. Verify with Firebase    │
│       │                                       │                 │
│       │                                       ▼                 │
│       │                              ┌──────────────────────┐  │
│       │                              │   Firebase Auth      │  │
│       │                              └──────────────────────┘  │
│       │                                       │                 │
│       │                              3. Create JWT              │
│       │                                       │                 │
│       │    4. Return JWT + Refresh   ┌───────┴───────┐        │
│       │ <─────────────────────────── │  JWT Service  │        │
│       │                              └───────────────┘        │
│       │                                                        │
│       │    5. API Request + JWT      ┌──────────────────────┐ │
│       │ ─────────────────────────>   │   API Gateway        │ │
│       │                              └──────────────────────┘ │
│       │                                       │                │
│       │                              6. Validate JWT           │
│       │                                       │                │
│       │    7. Protected Resource             ▼                │
│       │ <─────────────────────────   ┌──────────────────────┐ │
│       │                              │   Protected API      │ │
│       │                              └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 JWT Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "parent_uuid",
    "email": "parent@example.com",
    "children": ["child_uuid_1", "child_uuid_2"],
    "active_child": "child_uuid_1",
    "role": "parent",
    "iat": 1702627200,
    "exp": 1702713600,
    "iss": "brainspark.app"
  }
}
```

### 6.3 Content Safety Pipeline

```
User Input → PII Detection → Profanity Filter → Intent Analysis → AI Response → Output Filter → Client

┌─────────────────────────────────────────────────────────────────────────┐
│                       Content Safety Pipeline                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Input Stage:                                                            │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                │
│  │ PII Detector │ → │ Profanity    │ → │ Intent       │                │
│  │ - Names      │   │ Filter       │   │ Classifier   │                │
│  │ - Addresses  │   │ - Blocklist  │   │ - Safe/Unsafe│                │
│  │ - Phone #s   │   │ - ML Model   │   │ - Category   │                │
│  └──────────────┘   └──────────────┘   └──────────────┘                │
│         │                 │                   │                         │
│         ▼                 ▼                   ▼                         │
│  ┌─────────────────────────────────────────────────────┐               │
│  │              Filtered User Input                     │               │
│  └─────────────────────────────────────────────────────┘               │
│                            │                                            │
│                            ▼                                            │
│  ┌─────────────────────────────────────────────────────┐               │
│  │              Claude AI (with safety prompt)          │               │
│  └─────────────────────────────────────────────────────┘               │
│                            │                                            │
│  Output Stage:             ▼                                            │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐               │
│  │ Content      │ → │ Tone         │ → │ Age-Approp.  │               │
│  │ Validator    │   │ Checker      │   │ Validator    │               │
│  └──────────────┘   └──────────────┘   └──────────────┘               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.4 Security Measures Summary

| Layer | Measure | Implementation |
|-------|---------|----------------|
| Network | WAF | Cloud Armor |
| Network | DDoS Protection | Cloud CDN |
| Transport | Encryption | TLS 1.3 |
| Application | Authentication | Firebase Auth + JWT |
| Application | Authorization | RBAC |
| Application | Input Validation | Pydantic schemas |
| Data | Encryption at Rest | GCP default encryption |
| Data | Encryption in Transit | TLS |
| Data | PII Protection | Redaction + limited access |
| API | Rate Limiting | Redis-based |
| API | Request Signing | HMAC for webhooks |

---

## 7. Integration Architecture

### 7.1 External Service Integrations

```yaml
integrations:
  anthropic:
    purpose: AI conversation engine
    endpoint: https://api.anthropic.com/v1
    auth: API key (Secret Manager)
    rate_limit: 1000 req/min
    fallback: Cached responses

  firebase_auth:
    purpose: User authentication
    auth: Service account
    features:
      - Email/password
      - Google OAuth
      - Apple OAuth

  sendgrid:
    purpose: Transactional email
    endpoint: https://api.sendgrid.com/v3
    auth: API key
    templates:
      - welcome_parent
      - verify_email
      - password_reset
      - weekly_summary

  sentry:
    purpose: Error tracking
    dsn: environment variable
    environments:
      - production
      - staging
    sampling_rate: 0.1
```

### 7.2 API Integration Patterns

```python
# Circuit Breaker Pattern for AI Service

class AIServiceClient:
    def __init__(self):
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=5,
            recovery_timeout=30,
            expected_exception=AIServiceException
        )

    @circuit_breaker
    async def generate_response(self, prompt: str) -> str:
        try:
            response = await self.client.complete(prompt)
            return response
        except RateLimitError:
            # Use cached response or simpler fallback
            return self.get_fallback_response(prompt)
        except TimeoutError:
            # Retry with exponential backoff
            return await self.retry_with_backoff(prompt)

# Retry Pattern

async def retry_with_backoff(
    func: Callable,
    max_retries: int = 3,
    base_delay: float = 1.0
) -> Any:
    for attempt in range(max_retries):
        try:
            return await func()
        except RetryableError:
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (2 ** attempt)
            await asyncio.sleep(delay)
```

---

## 8. Deployment Architecture

### 8.1 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml

name: Deploy BrainSpark

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Tests
        run: |
          # Frontend tests
          cd frontend && npm test
          # Backend tests
          cd backend && pytest

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker Images
        run: |
          docker build -t gcr.io/brainspark/core-api ./backend
          docker build -t gcr.io/brainspark/frontend ./frontend
      - name: Push to GCR
        run: |
          docker push gcr.io/brainspark/core-api
          docker push gcr.io/brainspark/frontend

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Cloud Run (Staging)
        run: |
          gcloud run deploy core-api-staging \
            --image gcr.io/brainspark/core-api:${{ github.sha }} \
            --region us-central1

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Cloud Run (Production)
        run: |
          gcloud run deploy core-api \
            --image gcr.io/brainspark/core-api:${{ github.sha }} \
            --region us-central1 \
            --no-traffic
      - name: Gradual Traffic Shift
        run: |
          # 10% -> 50% -> 100% over 30 minutes
          gcloud run services update-traffic core-api \
            --to-revisions ${{ github.sha }}=10
```

### 8.2 Environment Strategy

| Environment | Purpose | URL | Data |
|-------------|---------|-----|------|
| Local | Development | localhost:3000 | Seed data |
| Staging | Pre-production testing | staging.brainspark.app | Copy of prod |
| Production | Live users | brainspark.app | Real data |

---

## 9. Monitoring & Observability

### 9.1 Monitoring Stack

```yaml
monitoring:
  metrics:
    - tool: Cloud Monitoring
      metrics:
        - request_latency
        - error_rate
        - active_users
        - ai_response_time

  logging:
    - tool: Cloud Logging
      retention: 30 days
      structured: true

  tracing:
    - tool: Cloud Trace
      sampling: 0.1

  alerting:
    - tool: Cloud Monitoring Alerts
      channels:
        - email
        - slack
        - pagerduty
```

### 9.2 Key Metrics & Alerts

| Metric | Warning Threshold | Critical Threshold | Action |
|--------|-------------------|-------------------|--------|
| API Latency (p95) | >2s | >5s | Scale up |
| Error Rate | >1% | >5% | Page on-call |
| AI Service Errors | >5/min | >20/min | Fallback mode |
| Database Connections | >80% | >95% | Scale database |
| Memory Usage | >70% | >90% | Investigate |

### 9.3 Custom Dashboards

```
Dashboard: BrainSpark Operations

┌─────────────────────────────────────────────────────────────────────────┐
│  Active Users (Real-time)        │  Error Rate (5min window)           │
│  ┌─────────────────────────┐     │  ┌─────────────────────────┐       │
│  │     📈 1,234            │     │  │     ✅ 0.12%             │       │
│  │     +15% from yesterday │     │  │     Target: <1%          │       │
│  └─────────────────────────┘     │  └─────────────────────────┘       │
├─────────────────────────────────────────────────────────────────────────┤
│  API Latency (p50/p95/p99)       │  AI Response Time                   │
│  ┌─────────────────────────┐     │  ┌─────────────────────────┐       │
│  │  p50: 120ms             │     │  │     1.8s avg            │       │
│  │  p95: 450ms             │     │  │     2.5s p95            │       │
│  │  p99: 890ms             │     │  │     3.2s p99            │       │
│  └─────────────────────────┘     │  └─────────────────────────┘       │
├─────────────────────────────────────────────────────────────────────────┤
│  Conversations Started (24h)     │  Streaks Active                     │
│  ┌─────────────────────────┐     │  ┌─────────────────────────┐       │
│  │     5,678               │     │  │     3,456 (78%)         │       │
│  │     ████████████████    │     │  │     ████████████░░░░    │       │
│  └─────────────────────────┘     │  └─────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Disaster Recovery

### 10.1 Recovery Objectives

| Metric | Target |
|--------|--------|
| Recovery Time Objective (RTO) | 4 hours |
| Recovery Point Objective (RPO) | 1 hour |
| Maximum Tolerable Downtime | 8 hours |

### 10.2 Backup Strategy

```yaml
backups:
  database:
    type: Automated Cloud SQL backups
    frequency: Daily
    retention: 30 days
    point_in_time_recovery: enabled (7 days)
    cross_region: us-east1

  storage:
    type: Cloud Storage versioning
    retention: 90 days
    replication: Multi-regional

  configuration:
    type: Infrastructure as Code
    storage: Git repository
    secrets: Secret Manager (replicated)
```

### 10.3 Disaster Recovery Procedure

```
DR Runbook: Database Failure

1. DETECT (Automated)
   - Cloud Monitoring detects database unavailability
   - Alert triggered to on-call engineer
   - Automatic failover initiated for HA setup

2. ASSESS (5 minutes)
   - Determine failure scope (single zone vs regional)
   - Check automated failover status
   - Evaluate data consistency

3. RECOVER (If automated failover fails)
   Option A: Promote read replica
   - gcloud sql instances promote-replica brainspark-db-replica
   - Update connection strings via Secret Manager
   - Restart application services

   Option B: Restore from backup
   - gcloud sql instances restore-backup brainspark-db \
       --backup-id [BACKUP_ID]
   - Verify data integrity
   - Resume services

4. VALIDATE (30 minutes)
   - Run data integrity checks
   - Verify all services operational
   - Test critical user flows

5. POST-INCIDENT (24 hours)
   - Complete incident report
   - Update runbook if needed
   - Schedule post-mortem
```

---

## Appendix A: Technology Decision Records

### TDR-001: Why FastAPI over Django

**Context**: Choosing Python web framework for backend services.

**Decision**: FastAPI

**Rationale**:
- Native async support for AI API calls
- Automatic OpenAPI documentation
- Pydantic for validation (already used)
- Better performance for I/O-bound workloads
- Team familiarity

**Consequences**:
- Need separate admin solution (Django Admin not available)
- Smaller ecosystem than Django
- More manual setup for common features

### TDR-002: Why PostgreSQL over MongoDB

**Context**: Choosing primary database.

**Decision**: PostgreSQL

**Rationale**:
- ACID compliance for financial/progress data
- JSONB for flexible schema needs
- Mature, well-understood
- Excellent GCP integration (Cloud SQL)
- Strong typing reduces bugs

**Consequences**:
- Schema migrations required for changes
- Less flexible than document store
- Horizontal scaling more complex

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-15 | BrainSpark Team | Initial document |

---

*Previous Document: [02-REQUIREMENTS-GATHERING.md](../planning/02-REQUIREMENTS-GATHERING.md)*
*Next Document: [04-FEATURE-SPECIFICATIONS.md](./04-FEATURE-SPECIFICATIONS.md)*
