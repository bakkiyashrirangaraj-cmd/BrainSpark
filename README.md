# BrainSpark - Adaptive Kids Thinking Companion

**Production URL:** https://brainspark.siggmatreders.com

An AI-powered conversational app that feels like chatting with a brilliant, playful friend. It adapts its personality, challenges, and conversation style based on the child's age group - making thinking feel like play.

---

## Project Status

| Phase | Status |
|-------|--------|
| Planning & Documentation | ✅ Complete (20 docs) |
| Backend Code (Python/FastAPI) | ✅ Complete |
| Frontend Code (React/TypeScript) | ✅ Complete |
| Database Schema (PostgreSQL) | ✅ Complete |
| Infrastructure (Terraform/GCP) | ✅ Complete |
| Docker Configuration | ✅ Complete |
| Deployment Scripts | ✅ Complete |
| **File Reorganization** | ⏳ Pending |
| **GCP Deployment** | ⏳ Ready to Deploy |

---

## Quick Start

### Prerequisites
- GCP Account with billing ✅
- Anthropic API Key ✅
- Firebase Project ✅
- Domain (brainspark.siggmatreders.com) ✅

### Deploy to GCP
```bash
# Set environment
export GCP_PROJECT_ID=your-project-id
export ANTHROPIC_API_KEY=your-api-key

# Run deployment
./brainspark-deploy-script.sh
```

---

## Code Files (Ready for Deployment)

| File | Type | Description |
|------|------|-------------|
| `brainspark-backend.py` | Python | FastAPI backend with auth, Claude API, all endpoints |
| `brainspark-gamification.py` | Python | Achievements, badges, streaks, rewards |
| `brainspark-multiplayer.py` | Python | Collaborative features, leaderboards |
| `brainspark-app.tsx` | React | Main app with constellation, chat UI |
| `brainspark-production.tsx` | React | Production-ready components |
| `brainspark-voice.tsx` | React | Voice input/output features |
| `brainspark-landing-page.tsx` | React | Public landing page |
| `brainspark-schema.sql` | SQL | PostgreSQL database schema |
| `brainspark-gcp.txt` | Terraform | GCP infrastructure config |
| `brainspark-docker.txt` | Docker | Docker Compose + Dockerfiles |
| `brainspark-deploy-script.sh` | Shell | One-click GCP deployment |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  brainspark.siggmatreders.com               │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌──────────┐    ┌──────────┐    ┌──────────┐
       │ Frontend │    │   API    │    │   CDN    │
       │Cloud Run │    │Cloud Run │    │ Storage  │
       │ React    │    │ FastAPI  │    │ Assets   │
       └──────────┘    └────┬─────┘    └──────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │Cloud SQL │  │  Redis   │  │  Claude  │
       │PostgreSQL│  │Memorystore│  │   API    │
       └──────────┘  └──────────┘  └──────────┘
```

---

## Features

### Age Groups
| Mode | Ages | Style |
|------|------|-------|
| Wonder Cubs | 4-6 | Colorful, voice-friendly, gentle puzzles |
| Curious Explorers | 7-10 | Story adventures, "what if" scenarios |
| Mind Masters | 11-14 | Philosophy, debates, strategy |

### Core Features
- **Daily Brain Sparks** - New question every day with streak rewards
- **Knowledge Constellation** - Visual universe that grows with learning
- **Infinite Depth** - AI generates unlimited personalized content
- **Voice Chat** - Speak your questions, hear answers
- **Parent Dashboard** - Track cognitive growth

---

## Documentation

### Architecture (Start Here)
| Document | Description |
|----------|-------------|
| [00-GCP-DEPLOYMENT-ARCHITECTURE.md](docs/architecture/00-GCP-DEPLOYMENT-ARCHITECTURE.md) | GCP deployment guide |
| [01-CODE-INVENTORY.md](docs/architecture/01-CODE-INVENTORY.md) | **Code validation & reorganization guide** |

### Planning (7 docs)
- Project Overview, Requirements, Roadmap, Testing Strategy
- Content Library, Legal Compliance, Launch Checklist

### Technical (8 docs)
- Architecture, Feature Specs, Database Schema, API Design
- Infrastructure Code, DevOps Guide, Monitoring, Analytics

### Design (2 docs)
- UI/UX Design System, Asset Specifications

### Operations (4 docs)
- Runbooks, Email Templates, Support Playbook

---

## URLs & Domains

| Service | URL |
|---------|-----|
| Main App | https://brainspark.siggmatreders.com |
| API | https://api.brainspark.siggmatreders.com |
| CDN | https://cdn.brainspark.siggmatreders.com |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Tailwind CSS, Framer Motion |
| Backend | FastAPI, Python 3.11, SQLAlchemy |
| Database | PostgreSQL 15, Redis 7 |
| AI | Anthropic Claude API |
| Auth | Firebase Authentication |
| Hosting | GCP Cloud Run |
| Infrastructure | Terraform |

---

## Monthly Costs (Estimated)

| Service | Cost |
|---------|------|
| GCP (Cloud Run, SQL, Redis) | $150-270 |
| Claude API | $50-200 |
| Total | **$200-500** |

---

## Next Steps

1. **Reorganize files** into proper folder structure
2. **Create missing config files** (package.json, requirements.txt, etc.)
3. **Configure GCP project** and enable APIs
4. **Set up DNS** for brainspark.siggmatreders.com
5. **Deploy** using the deployment script
6. **Test** with beta families

---

## License

Proprietary - All rights reserved.

## Contact

- **Support:** support@brainspark.siggmatreders.com
- **Safety:** safety@brainspark.siggmatreders.com
