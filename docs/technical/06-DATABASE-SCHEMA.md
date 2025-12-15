# BrainSpark - Database Schema Design

## Document Purpose

This document defines the complete database schema for BrainSpark, including table definitions, relationships, indexes, and data management strategies.

---

## Table of Contents

1. [Database Overview](#1-database-overview)
2. [Entity Relationship Diagram](#2-entity-relationship-diagram)
3. [Core Tables](#3-core-tables)
4. [Content Tables](#4-content-tables)
5. [Engagement Tables](#5-engagement-tables)
6. [Analytics Tables](#6-analytics-tables)
7. [Indexes & Performance](#7-indexes--performance)
8. [Data Migration Strategy](#8-data-migration-strategy)
9. [Backup & Recovery](#9-backup--recovery)

---

## 1. Database Overview

### 1.1 Technology Choice

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| Database | PostgreSQL 15 | ACID compliance, JSONB support, GCP Cloud SQL |
| ORM | SQLAlchemy 2.0 | Async support, mature ecosystem |
| Migrations | Alembic | Standard for SQLAlchemy projects |
| Cache | Redis 7 | Sessions, rate limiting, leaderboards |

### 1.2 Schema Design Principles

1. **Normalization**: 3NF for transactional data
2. **Denormalization**: Strategic JSONB for flexible attributes
3. **Soft Deletes**: Preserve data for analytics
4. **Audit Trail**: Track changes on critical tables
5. **UUID Primary Keys**: Distributed-friendly, no sequence collisions

### 1.3 Naming Conventions

```
Tables:         snake_case, plural (e.g., children, conversations)
Columns:        snake_case (e.g., created_at, parent_id)
Primary Keys:   id (UUID)
Foreign Keys:   {table_singular}_id (e.g., parent_id, topic_id)
Indexes:        idx_{table}_{column(s)}
Constraints:    {table}_{type}_{column} (e.g., children_fk_parent)
```

---

## 2. Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BrainSpark Database Schema                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   USERS & AUTH                           CONTENT                             │
│   ┌──────────────┐                      ┌──────────────┐                    │
│   │   parents    │                      │    topics    │                    │
│   │──────────────│                      │──────────────│                    │
│   │ id (PK)      │                      │ id (PK)      │                    │
│   │ email        │                      │ name         │                    │
│   │ auth_provider│                      │ category     │                    │
│   │ created_at   │                      │ parent_topic │←─────────┐        │
│   └──────┬───────┘                      │ prerequisites│          │        │
│          │                              │ age_groups   │          │        │
│          │ 1:N                          └──────┬───────┘          │        │
│          │                                     │                   │        │
│   ┌──────▼───────┐                             │                   │        │
│   │   children   │                             │                   │        │
│   │──────────────│                             │                   │        │
│   │ id (PK)      │                             │                   │        │
│   │ parent_id(FK)│                             │                   │        │
│   │ name         │                             │                   │        │
│   │ birth_date   │                             │                   │        │
│   │ age_group    │                             │                   │        │
│   │ interests    │                             │                   │        │
│   └──────┬───────┘                             │                   │        │
│          │                                     │                   │        │
│          │ 1:N                                 │                   │        │
│          │                                     │                   │        │
│   ┌──────▼───────┐   N:1    ┌─────────────────▼─────┐             │        │
│   │conversations │─────────→│       progress        │             │        │
│   │──────────────│          │─────────────────────────│             │        │
│   │ id (PK)      │          │ id (PK)               │             │        │
│   │ child_id(FK) │          │ child_id (FK)         │             │        │
│   │ topic_id(FK) │          │ topic_id (FK)         │             │        │
│   │ started_at   │          │ depth_level           │             │        │
│   │ depth_reached│          │ time_spent            │             │        │
│   └──────┬───────┘          │ unlocked_at           │             │        │
│          │                  └───────────────────────┘             │        │
│          │ 1:N                                                     │        │
│          │                                                         │        │
│   ┌──────▼───────┐                                                │        │
│   │   messages   │                                                │        │
│   │──────────────│                                                │        │
│   │ id (PK)      │   ENGAGEMENT                                   │        │
│   │ conv_id (FK) │   ┌──────────────┐   ┌──────────────┐         │        │
│   │ role         │   │   streaks    │   │   rewards    │         │        │
│   │ content      │   │──────────────│   │──────────────│         │        │
│   │ created_at   │   │ child_id(FK) │   │ child_id(FK) │         │        │
│   └──────────────┘   │ current      │   │ reward_type  │         │        │
│                      │ longest      │   │ reward_id    │         │        │
│                      │ last_date    │   │ earned_at    │         │        │
│                      └──────────────┘   └──────────────┘         │        │
│                                                                   │        │
│   COMPLIANCE                                                      │        │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │        │
│   │   consents   │   │ topic_conns  │   │ brain_sparks │         │        │
│   │──────────────│   │──────────────│   │──────────────│         │        │
│   │ parent_id(FK)│   │ from_topic   │───┘ id (PK)      │         │        │
│   │ consent_type │   │ to_topic     │────┘ date        │         │        │
│   │ granted_at   │   │ strength     │     │ age_group  │         │        │
│   │ ip_address   │   └──────────────┘     │ content    │         │        │
│   └──────────────┘                        └──────────────┘         │        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Tables

### 3.1 Parents Table

```sql
-- Parent/Guardian accounts
CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Authentication
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'email',
    auth_provider_id VARCHAR(255),

    -- Profile
    display_name VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en-US',

    -- Subscription
    subscription_tier VARCHAR(20) DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,

    -- Settings (JSONB for flexibility)
    settings JSONB DEFAULT '{
        "notifications": {
            "email_digest": true,
            "push_enabled": true,
            "streak_reminders": true
        },
        "privacy": {
            "analytics_opt_in": false,
            "share_anonymous_data": false
        }
    }',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT parents_email_unique UNIQUE (email),
    CONSTRAINT parents_auth_provider_check CHECK (
        auth_provider IN ('email', 'google', 'apple')
    ),
    CONSTRAINT parents_subscription_check CHECK (
        subscription_tier IN ('free', 'premium', 'family')
    )
);

-- Indexes
CREATE INDEX idx_parents_email ON parents(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_parents_auth_provider ON parents(auth_provider, auth_provider_id)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_parents_subscription ON parents(subscription_tier, subscription_expires_at);

-- Trigger for updated_at
CREATE TRIGGER parents_updated_at
    BEFORE UPDATE ON parents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 3.2 Children Table

```sql
-- Child profiles (linked to parent)
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent relationship
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,

    -- Profile
    name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    age_group VARCHAR(20) NOT NULL,
    avatar_id VARCHAR(50) DEFAULT 'default_1',

    -- Personalization
    interests TEXT[] DEFAULT '{}',
    vocabulary_level INTEGER DEFAULT 1,

    -- Security
    pin_hash VARCHAR(255),  -- Optional profile lock

    -- Settings (JSONB for flexibility)
    settings JSONB DEFAULT '{
        "sound_enabled": true,
        "voice_over_enabled": true,
        "animation_level": "full",
        "daily_time_limit_minutes": 60,
        "bedtime_start": "20:00",
        "bedtime_end": "07:00"
    }',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT children_age_group_check CHECK (
        age_group IN ('wonder_cubs', 'curious_explorers', 'mind_masters')
    ),
    CONSTRAINT children_per_parent_limit CHECK (
        (SELECT COUNT(*) FROM children c
         WHERE c.parent_id = parent_id AND c.deleted_at IS NULL) <= 4
    )
);

-- Indexes
CREATE INDEX idx_children_parent ON children(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_children_age_group ON children(age_group) WHERE deleted_at IS NULL;
CREATE INDEX idx_children_last_active ON children(last_active_at DESC);

-- Trigger for updated_at
CREATE TRIGGER children_updated_at
    BEFORE UPDATE ON children
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 3.3 Consents Table

```sql
-- COPPA and other consent tracking
CREATE TABLE consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent relationship
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,

    -- Consent details
    consent_type VARCHAR(50) NOT NULL,
    version VARCHAR(20) NOT NULL,  -- Track consent version

    -- Status
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,

    -- Audit trail
    ip_address INET,
    user_agent TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT consents_type_check CHECK (
        consent_type IN ('coppa', 'terms', 'privacy', 'marketing', 'data_sharing')
    ),
    CONSTRAINT consents_unique_type UNIQUE (parent_id, consent_type, version)
);

-- Index for compliance checks
CREATE INDEX idx_consents_parent_type ON consents(parent_id, consent_type);
CREATE INDEX idx_consents_granted ON consents(granted_at) WHERE revoked_at IS NULL;
```

---

## 4. Content Tables

### 4.1 Topics Table

```sql
-- Knowledge constellation topics
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Topic identity
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,

    -- Categorization
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),

    -- Hierarchy
    parent_topic_id UUID REFERENCES topics(id),
    depth_in_tree INTEGER DEFAULT 0,

    -- Constellation positioning
    position_x FLOAT NOT NULL DEFAULT 0,
    position_y FLOAT NOT NULL DEFAULT 0,

    -- Unlock requirements
    prerequisites UUID[] DEFAULT '{}',  -- Topic IDs required
    prerequisite_depth INTEGER DEFAULT 1,  -- Depth needed in prerequisites
    min_age_group VARCHAR(20),

    -- Age group availability
    age_groups VARCHAR(20)[] DEFAULT '{wonder_cubs, curious_explorers, mind_masters}',

    -- Visual
    icon VARCHAR(50) NOT NULL DEFAULT 'star',
    color VARCHAR(7) DEFAULT '#FFD700',

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT topics_category_check CHECK (
        category IN ('science', 'humanities', 'creative', 'logic', 'philosophy')
    ),
    CONSTRAINT topics_age_group_check CHECK (
        min_age_group IS NULL OR min_age_group IN ('wonder_cubs', 'curious_explorers', 'mind_masters')
    )
);

-- Indexes
CREATE INDEX idx_topics_category ON topics(category);
CREATE INDEX idx_topics_parent ON topics(parent_topic_id);
CREATE INDEX idx_topics_slug ON topics(slug);
CREATE INDEX idx_topics_age_groups ON topics USING GIN(age_groups);
```

### 4.2 Topic Connections Table

```sql
-- Connections between topics in constellation
CREATE TABLE topic_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Connection endpoints
    from_topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    to_topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,

    -- Connection strength (affects unlock requirements)
    strength VARCHAR(20) DEFAULT 'normal',

    -- Metadata
    connection_type VARCHAR(50) DEFAULT 'related',
    description TEXT,

    -- Constraints
    CONSTRAINT topic_connections_unique UNIQUE (from_topic_id, to_topic_id),
    CONSTRAINT topic_connections_no_self CHECK (from_topic_id != to_topic_id),
    CONSTRAINT topic_connections_strength_check CHECK (
        strength IN ('weak', 'normal', 'strong')
    )
);

-- Indexes
CREATE INDEX idx_topic_connections_from ON topic_connections(from_topic_id);
CREATE INDEX idx_topic_connections_to ON topic_connections(to_topic_id);
```

### 4.3 Brain Sparks Table

```sql
-- Daily brain spark content
CREATE TABLE brain_sparks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Scheduling
    spark_date DATE NOT NULL,
    age_group VARCHAR(20) NOT NULL,

    -- Content
    spark_type VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    hints JSONB DEFAULT '[]',
    follow_ups JSONB DEFAULT '[]',

    -- Metadata
    topic_id UUID REFERENCES topics(id),
    difficulty INTEGER DEFAULT 1,  -- 1-5 scale

    -- Source tracking
    source VARCHAR(50) DEFAULT 'ai_generated',
    curator_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT brain_sparks_unique_date_age UNIQUE (spark_date, age_group),
    CONSTRAINT brain_sparks_age_group_check CHECK (
        age_group IN ('wonder_cubs', 'curious_explorers', 'mind_masters')
    ),
    CONSTRAINT brain_sparks_type_check CHECK (
        spark_type IN ('riddle', 'what_if', 'mystery', 'challenge', 'debate', 'philosophy')
    )
);

-- Indexes
CREATE INDEX idx_brain_sparks_date ON brain_sparks(spark_date);
CREATE INDEX idx_brain_sparks_age_group ON brain_sparks(age_group);
CREATE INDEX idx_brain_sparks_date_age ON brain_sparks(spark_date, age_group);
```

---

## 5. Engagement Tables

### 5.1 Conversations Table

```sql
-- Conversation sessions
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id),
    brain_spark_id UUID REFERENCES brain_sparks(id),

    -- Session info
    conversation_type VARCHAR(50) DEFAULT 'exploration',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,

    -- Progress
    depth_reached INTEGER DEFAULT 0,
    questions_asked INTEGER DEFAULT 0,
    aha_moments INTEGER DEFAULT 0,

    -- Summary (generated at end)
    summary TEXT,
    key_insights JSONB DEFAULT '[]',

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Constraints
    CONSTRAINT conversations_type_check CHECK (
        conversation_type IN ('exploration', 'brain_spark', 'story', 'debate')
    )
);

-- Indexes
CREATE INDEX idx_conversations_child ON conversations(child_id);
CREATE INDEX idx_conversations_topic ON conversations(topic_id);
CREATE INDEX idx_conversations_started ON conversations(started_at DESC);
CREATE INDEX idx_conversations_child_date ON conversations(child_id, DATE(started_at));
```

### 5.2 Messages Table

```sql
-- Individual messages in conversations
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationship
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    -- Message content
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,

    -- Choices (for AI messages)
    choices JSONB,  -- Array of choice objects

    -- Selected choice (for user messages)
    selected_choice_index INTEGER,
    is_free_form BOOLEAN DEFAULT FALSE,

    -- Processing metadata
    tokens_used INTEGER,
    processing_time_ms INTEGER,

    -- Safety
    was_filtered BOOLEAN DEFAULT FALSE,
    filter_reason TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT messages_role_check CHECK (
        role IN ('user', 'assistant', 'system')
    )
);

-- Indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_filtered ON messages(was_filtered) WHERE was_filtered = TRUE;

-- Partition by month for large-scale
-- CREATE TABLE messages_2024_01 PARTITION OF messages
--     FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 5.3 Progress Table

```sql
-- Child's progress per topic
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,

    -- Progress metrics
    depth_level INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    questions_asked INTEGER DEFAULT 0,
    conversations_count INTEGER DEFAULT 0,

    -- Milestones
    unlocked_at TIMESTAMPTZ,
    first_depth_5_at TIMESTAMPTZ,
    mastered_at TIMESTAMPTZ,

    -- Timestamps
    last_interaction TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT progress_unique_child_topic UNIQUE (child_id, topic_id),
    CONSTRAINT progress_depth_positive CHECK (depth_level >= 0)
);

-- Indexes
CREATE INDEX idx_progress_child ON progress(child_id);
CREATE INDEX idx_progress_topic ON progress(topic_id);
CREATE INDEX idx_progress_child_depth ON progress(child_id, depth_level DESC);
CREATE INDEX idx_progress_unlocked ON progress(child_id) WHERE unlocked_at IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER progress_updated_at
    BEFORE UPDATE ON progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 5.4 Streaks Table

```sql
-- Engagement streak tracking
CREATE TABLE streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationship
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,

    -- Current streak
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,

    -- Streak freezes (earned rewards)
    streak_freezes_available INTEGER DEFAULT 0,

    -- History (for graphs)
    streak_history JSONB DEFAULT '[]',
    -- Format: [{"date": "2024-01-15", "streak": 5, "activity": true}, ...]

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT streaks_unique_child UNIQUE (child_id),
    CONSTRAINT streaks_positive CHECK (
        current_streak >= 0 AND longest_streak >= 0
    )
);

-- Index
CREATE INDEX idx_streaks_child ON streaks(child_id);
CREATE INDEX idx_streaks_current ON streaks(current_streak DESC);

-- Trigger for updated_at
CREATE TRIGGER streaks_updated_at
    BEFORE UPDATE ON streaks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 5.5 Rewards Table

```sql
-- Earned rewards (badges, stars, unlocks)
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationship
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,

    -- Reward details
    reward_type VARCHAR(50) NOT NULL,
    reward_id VARCHAR(100) NOT NULL,

    -- Value (for star currency)
    star_value INTEGER DEFAULT 0,

    -- Trigger context
    trigger_type VARCHAR(50),  -- What earned this reward
    trigger_id UUID,  -- Reference to triggering entity

    -- Timestamps
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Constraints
    CONSTRAINT rewards_type_check CHECK (
        reward_type IN ('badge', 'star', 'unlock', 'freeze', 'cosmetic')
    ),
    CONSTRAINT rewards_unique_badge UNIQUE (child_id, reward_type, reward_id)
        WHERE reward_type = 'badge'  -- Only badges are unique
);

-- Indexes
CREATE INDEX idx_rewards_child ON rewards(child_id);
CREATE INDEX idx_rewards_child_type ON rewards(child_id, reward_type);
CREATE INDEX idx_rewards_earned ON rewards(earned_at DESC);

-- View for star balance
CREATE VIEW child_star_balance AS
SELECT
    child_id,
    COALESCE(SUM(star_value), 0) as total_stars
FROM rewards
GROUP BY child_id;
```

---

## 6. Analytics Tables

### 6.1 Daily Activity Summary

```sql
-- Aggregated daily activity per child
CREATE TABLE daily_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identifiers
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,

    -- Time metrics
    total_time_seconds INTEGER DEFAULT 0,
    session_count INTEGER DEFAULT 0,

    -- Engagement metrics
    conversations_started INTEGER DEFAULT 0,
    questions_asked INTEGER DEFAULT 0,
    depth_increases INTEGER DEFAULT 0,
    aha_moments INTEGER DEFAULT 0,

    -- Content metrics
    topics_explored UUID[] DEFAULT '{}',
    new_topics_unlocked UUID[] DEFAULT '{}',
    brain_spark_completed BOOLEAN DEFAULT FALSE,

    -- Rewards
    stars_earned INTEGER DEFAULT 0,
    badges_earned TEXT[] DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT daily_activity_unique UNIQUE (child_id, activity_date)
);

-- Indexes
CREATE INDEX idx_daily_activity_child ON daily_activity(child_id);
CREATE INDEX idx_daily_activity_date ON daily_activity(activity_date);
CREATE INDEX idx_daily_activity_child_date ON daily_activity(child_id, activity_date DESC);

-- Partition by month
-- CREATE TABLE daily_activity_2024_01 PARTITION OF daily_activity
--     FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 6.2 Cognitive Growth Tracking

```sql
-- Tracking cognitive skill development
CREATE TABLE cognitive_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identifiers
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL,

    -- Skill scores (0-100)
    critical_thinking INTEGER,
    creative_thinking INTEGER,
    logical_reasoning INTEGER,
    knowledge_connection INTEGER,
    curiosity_index INTEGER,

    -- Calculation basis
    conversations_analyzed INTEGER,
    confidence_level FLOAT,  -- How confident in these scores

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT cognitive_metrics_unique UNIQUE (child_id, assessment_date),
    CONSTRAINT cognitive_metrics_scores CHECK (
        (critical_thinking IS NULL OR critical_thinking BETWEEN 0 AND 100) AND
        (creative_thinking IS NULL OR creative_thinking BETWEEN 0 AND 100) AND
        (logical_reasoning IS NULL OR logical_reasoning BETWEEN 0 AND 100) AND
        (knowledge_connection IS NULL OR knowledge_connection BETWEEN 0 AND 100) AND
        (curiosity_index IS NULL OR curiosity_index BETWEEN 0 AND 100)
    )
);

-- Indexes
CREATE INDEX idx_cognitive_metrics_child ON cognitive_metrics(child_id);
CREATE INDEX idx_cognitive_metrics_date ON cognitive_metrics(child_id, assessment_date DESC);
```

---

## 7. Indexes & Performance

### 7.1 Index Strategy

| Table | Index Type | Columns | Purpose |
|-------|------------|---------|---------|
| parents | B-tree | email | Login lookup |
| children | B-tree | parent_id | Parent's children |
| conversations | B-tree | child_id, started_at | Activity history |
| messages | B-tree | conversation_id, created_at | Message retrieval |
| progress | B-tree | child_id, topic_id | Progress lookup |
| topics | GIN | age_groups | Age filtering |

### 7.2 Query Optimization

```sql
-- Common query: Get child's constellation state
-- Optimized with covering index
CREATE INDEX idx_progress_constellation ON progress(child_id)
    INCLUDE (topic_id, depth_level, unlocked_at);

-- Common query: Recent conversations
-- Partial index for active conversations
CREATE INDEX idx_conversations_recent_active ON conversations(child_id, started_at DESC)
    WHERE ended_at IS NULL OR ended_at > NOW() - INTERVAL '7 days';

-- Common query: Leaderboard by streak
CREATE INDEX idx_streaks_leaderboard ON streaks(current_streak DESC)
    WHERE current_streak > 0;
```

### 7.3 Partitioning Strategy

```sql
-- Messages table partitioned by month
CREATE TABLE messages (
    -- ... columns ...
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create partitions
CREATE TABLE messages_2024_01 PARTITION OF messages
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE messages_2024_02 PARTITION OF messages
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... continue for each month

-- Automated partition creation (via cron job)
-- SELECT create_monthly_partition('messages', '2024-03-01');
```

---

## 8. Data Migration Strategy

### 8.1 Migration Tools

```python
# alembic/env.py configuration
from alembic import context
from sqlalchemy import engine_from_config
from app.models import Base

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix='sqlalchemy.',
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=Base.metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()
```

### 8.2 Migration Workflow

```bash
# Create new migration
alembic revision --autogenerate -m "Add new column to children"

# Review generated migration file
# Edit if necessary

# Apply migration (staging)
alembic upgrade head --sql > migration.sql
# Review SQL

# Apply to production
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

### 8.3 Zero-Downtime Migrations

For schema changes that could lock tables:

```sql
-- Step 1: Add nullable column
ALTER TABLE children ADD COLUMN new_field VARCHAR(100);

-- Step 2: Backfill data (in batches)
UPDATE children SET new_field = 'default' WHERE new_field IS NULL LIMIT 1000;

-- Step 3: Add NOT NULL constraint (after backfill complete)
ALTER TABLE children ALTER COLUMN new_field SET NOT NULL;

-- Step 4: Add index concurrently (doesn't lock)
CREATE INDEX CONCURRENTLY idx_children_new_field ON children(new_field);
```

---

## 9. Backup & Recovery

### 9.1 Backup Strategy

| Type | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| Full backup | Daily | 30 days | Cloud SQL automated |
| Point-in-time | Continuous | 7 days | WAL archiving |
| Cross-region | Daily | 14 days | Cloud SQL replica |

### 9.2 Cloud SQL Configuration

```yaml
# terraform/database.tf
resource "google_sql_database_instance" "brainspark" {
  name             = "brainspark-db"
  database_version = "POSTGRES_15"
  region           = "us-central1"

  settings {
    tier = "db-custom-2-4096"

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = 30
      }
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }

    maintenance_window {
      day  = 7  # Sunday
      hour = 4  # 4 AM UTC
    }
  }

  deletion_protection = true
}
```

### 9.3 Recovery Procedures

```sql
-- Point-in-time recovery to specific timestamp
-- (Done via Cloud Console or gcloud)

-- Manual table recovery from backup
-- 1. Create recovery instance from backup
-- 2. Export table:
pg_dump -h recovery-instance -t children > children_backup.sql

-- 3. Import to production:
psql -h production-instance < children_backup.sql

-- Data validation after recovery
SELECT COUNT(*) FROM children;
SELECT MAX(created_at) FROM children;
```

---

## Appendix A: Utility Functions

```sql
-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Calculate child age from birth_date
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN DATE_PART('year', AGE(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Determine age group from birth_date
CREATE OR REPLACE FUNCTION determine_age_group(birth_date DATE)
RETURNS VARCHAR(20) AS $$
DECLARE
    age INTEGER;
BEGIN
    age := calculate_age(birth_date);
    IF age < 4 THEN
        RETURN NULL;  -- Too young
    ELSIF age <= 6 THEN
        RETURN 'wonder_cubs';
    ELSIF age <= 10 THEN
        RETURN 'curious_explorers';
    ELSIF age <= 14 THEN
        RETURN 'mind_masters';
    ELSE
        RETURN NULL;  -- Too old
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create monthly partition
CREATE OR REPLACE FUNCTION create_monthly_partition(
    table_name TEXT,
    partition_date DATE
)
RETURNS VOID AS $$
DECLARE
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    partition_name := table_name || '_' || TO_CHAR(partition_date, 'YYYY_MM');
    start_date := DATE_TRUNC('month', partition_date);
    end_date := start_date + INTERVAL '1 month';

    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
        partition_name,
        table_name,
        start_date,
        end_date
    );
END;
$$ LANGUAGE plpgsql;
```

---

## Appendix B: Seed Data

```sql
-- Initial topics for constellation
INSERT INTO topics (id, name, slug, category, icon, color, position_x, position_y, age_groups) VALUES
    (gen_random_uuid(), 'Space', 'space', 'science', 'rocket', '#4B0082', 0, -100, '{wonder_cubs, curious_explorers, mind_masters}'),
    (gen_random_uuid(), 'Animals', 'animals', 'science', 'paw', '#228B22', -150, 50, '{wonder_cubs, curious_explorers, mind_masters}'),
    (gen_random_uuid(), 'Math', 'math', 'logic', 'calculator', '#FF6347', 150, 50, '{wonder_cubs, curious_explorers, mind_masters}'),
    (gen_random_uuid(), 'Stories', 'stories', 'creative', 'book', '#9370DB', -100, 150, '{wonder_cubs, curious_explorers, mind_masters}'),
    (gen_random_uuid(), 'Nature', 'nature', 'science', 'leaf', '#32CD32', 100, 150, '{wonder_cubs, curious_explorers, mind_masters}'),
    (gen_random_uuid(), 'Philosophy', 'philosophy', 'philosophy', 'brain', '#8B0000', 0, 200, '{mind_masters}');

-- Topic connections
-- (Add after topics are seeded)
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-15 | BrainSpark Team | Initial document |

---

*Previous Document: [05-UI-UX-DESIGN.md](../design/05-UI-UX-DESIGN.md)*
*Next Document: [07-API-DESIGN.md](./07-API-DESIGN.md)*
