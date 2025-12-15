# BrainSpark - API Design Document

## Document Purpose

This document defines the RESTful API design for BrainSpark, including endpoints, request/response schemas, authentication, error handling, and rate limiting.

---

## Table of Contents

1. [API Overview](#1-api-overview)
2. [Authentication](#2-authentication)
3. [Core Endpoints](#3-core-endpoints)
4. [Conversation Endpoints](#4-conversation-endpoints)
5. [Progress Endpoints](#5-progress-endpoints)
6. [Gamification Endpoints](#6-gamification-endpoints)
7. [Parent Dashboard Endpoints](#7-parent-dashboard-endpoints)
8. [Error Handling](#8-error-handling)
9. [Rate Limiting](#9-rate-limiting)
10. [WebSocket Events](#10-websocket-events)

---

## 1. API Overview

### 1.1 Base Configuration

```yaml
Base URL: https://api.brainspark.app/v1
Content-Type: application/json
API Version: v1
Protocol: HTTPS only
```

### 1.2 API Design Principles

| Principle | Implementation |
|-----------|----------------|
| RESTful | Resource-based URLs, HTTP verbs |
| JSON | All request/response bodies |
| Versioned | URL versioning (v1, v2) |
| Stateless | JWT tokens, no server sessions |
| Paginated | Cursor-based for lists |
| Rate Limited | Per-user and per-endpoint limits |

### 1.3 Common Headers

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-Request-ID: <uuid>  # For tracing
X-Child-ID: <uuid>    # Active child context
Accept-Language: en-US
```

**Response Headers:**
```http
Content-Type: application/json
X-Request-ID: <uuid>
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702627200
```

---

## 2. Authentication

### 2.1 Authentication Endpoints

#### Register Parent Account

```http
POST /v1/auth/register
```

**Request:**
```json
{
  "email": "parent@example.com",
  "password": "SecureP@ss123",
  "display_name": "Alex Parent",
  "timezone": "America/New_York",
  "consents": {
    "terms": true,
    "privacy": true,
    "coppa": true
  }
}
```

**Response (201 Created):**
```json
{
  "data": {
    "parent": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "parent@example.com",
      "display_name": "Alex Parent",
      "created_at": "2024-12-15T10:30:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJSUzI1NiIs...",
      "refresh_token": "dGhpcyBpcyBhIHJlZnJl...",
      "expires_in": 86400
    }
  },
  "meta": {
    "request_id": "req_abc123"
  }
}
```

#### Login

```http
POST /v1/auth/login
```

**Request:**
```json
{
  "email": "parent@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "parent": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "parent@example.com",
      "display_name": "Alex Parent",
      "children_count": 2
    },
    "tokens": {
      "access_token": "eyJhbGciOiJSUzI1NiIs...",
      "refresh_token": "dGhpcyBpcyBhIHJlZnJl...",
      "expires_in": 86400
    }
  }
}
```

#### OAuth Login

```http
POST /v1/auth/oauth/{provider}
```

**Providers:** `google`, `apple`

**Request:**
```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "consents": {
    "terms": true,
    "privacy": true,
    "coppa": true
  }
}
```

#### Refresh Token

```http
POST /v1/auth/refresh
```

**Request:**
```json
{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJl..."
}
```

**Response (200 OK):**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIs...",
    "expires_in": 86400
  }
}
```

#### Logout

```http
POST /v1/auth/logout
Authorization: Bearer <token>
```

**Response (204 No Content)**

### 2.2 JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "email": "parent@example.com",
    "type": "parent",
    "children": [
      "660e8400-e29b-41d4-a716-446655440001",
      "660e8400-e29b-41d4-a716-446655440002"
    ],
    "iat": 1702627200,
    "exp": 1702713600,
    "iss": "brainspark.app"
  }
}
```

---

## 3. Core Endpoints

### 3.1 Parent Profile

#### Get Current Parent

```http
GET /v1/parents/me
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "parent@example.com",
    "display_name": "Alex Parent",
    "timezone": "America/New_York",
    "subscription_tier": "premium",
    "subscription_expires_at": "2025-12-15T00:00:00Z",
    "settings": {
      "notifications": {
        "email_digest": true,
        "push_enabled": true,
        "streak_reminders": true
      }
    },
    "created_at": "2024-01-15T10:30:00Z",
    "children": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Emma",
        "age_group": "wonder_cubs",
        "avatar_id": "avatar_bunny"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440002",
        "name": "Noah",
        "age_group": "curious_explorers",
        "avatar_id": "avatar_owl"
      }
    ]
  }
}
```

#### Update Parent Profile

```http
PATCH /v1/parents/me
Authorization: Bearer <token>
```

**Request:**
```json
{
  "display_name": "Alex P.",
  "timezone": "America/Los_Angeles",
  "settings": {
    "notifications": {
      "streak_reminders": false
    }
  }
}
```

### 3.2 Children Profiles

#### Create Child Profile

```http
POST /v1/children
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Emma",
  "birth_date": "2019-05-15",
  "avatar_id": "avatar_bunny",
  "interests": ["animals", "space", "stories"]
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Emma",
    "birth_date": "2019-05-15",
    "age_group": "wonder_cubs",
    "avatar_id": "avatar_bunny",
    "interests": ["animals", "space", "stories"],
    "settings": {
      "sound_enabled": true,
      "voice_over_enabled": true,
      "daily_time_limit_minutes": 60
    },
    "created_at": "2024-12-15T10:30:00Z"
  }
}
```

#### Get Child Profile

```http
GET /v1/children/{child_id}
Authorization: Bearer <token>
```

#### Update Child Profile

```http
PATCH /v1/children/{child_id}
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Emmy",
  "interests": ["animals", "space", "stories", "puzzles"],
  "settings": {
    "daily_time_limit_minutes": 45
  }
}
```

#### Delete Child Profile

```http
DELETE /v1/children/{child_id}
Authorization: Bearer <token>
```

**Response (204 No Content)**

#### Switch Active Child

```http
POST /v1/children/{child_id}/activate
Authorization: Bearer <token>
```

**Request (optional PIN):**
```json
{
  "pin": "1234"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "child": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Emma",
      "age_group": "wonder_cubs"
    },
    "session_token": "child_session_token..."
  }
}
```

### 3.3 Topics & Constellation

#### Get All Topics

```http
GET /v1/topics
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Query Parameters:**
- `category` - Filter by category
- `age_group` - Filter by age group (auto-set from child)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "name": "Space",
      "slug": "space",
      "category": "science",
      "icon": "rocket",
      "color": "#4B0082",
      "position": { "x": 0, "y": -100 },
      "connections": ["physics", "nature"],
      "age_groups": ["wonder_cubs", "curious_explorers", "mind_masters"]
    }
  ],
  "meta": {
    "total": 25
  }
}
```

#### Get Topic Details

```http
GET /v1/topics/{topic_id}
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440001",
    "name": "Space",
    "slug": "space",
    "description": "Explore the wonders of the universe!",
    "category": "science",
    "icon": "rocket",
    "color": "#4B0082",
    "position": { "x": 0, "y": -100 },
    "subtopics": [
      { "id": "...", "name": "Planets" },
      { "id": "...", "name": "Stars" },
      { "id": "...", "name": "Moon" }
    ],
    "connections": [
      { "topic_id": "...", "name": "Physics", "strength": "strong" }
    ],
    "prerequisites": [],
    "child_progress": {
      "unlocked": true,
      "depth_level": 3,
      "time_spent_minutes": 45,
      "last_interaction": "2024-12-14T15:30:00Z"
    }
  }
}
```

#### Get Constellation State

```http
GET /v1/constellation
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Response (200 OK):**
```json
{
  "data": {
    "topics": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440001",
        "name": "Space",
        "position": { "x": 0, "y": -100 },
        "status": "explored",
        "depth_level": 3
      },
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "name": "Physics",
        "position": { "x": 100, "y": 50 },
        "status": "unlocked",
        "depth_level": 1
      },
      {
        "id": "770e8400-e29b-41d4-a716-446655440003",
        "name": "Black Holes",
        "position": { "x": 50, "y": -150 },
        "status": "locked",
        "unlock_hint": "Explore Space to depth 5"
      }
    ],
    "connections": [
      {
        "from": "770e8400-e29b-41d4-a716-446655440001",
        "to": "770e8400-e29b-41d4-a716-446655440002",
        "discovered": true
      }
    ],
    "stats": {
      "total_topics": 25,
      "unlocked": 8,
      "explored": 5
    }
  }
}
```

---

## 4. Conversation Endpoints

### 4.1 Start Conversation

```http
POST /v1/conversations
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Request:**
```json
{
  "topic_id": "770e8400-e29b-41d4-a716-446655440001",
  "conversation_type": "exploration"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "conversation_id": "880e8400-e29b-41d4-a716-446655440001",
    "topic": {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "name": "Space"
    },
    "opening_message": {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "role": "assistant",
      "content": "Hi Emma! Ready to blast off into space? There's so much to discover up there!",
      "choices": [
        { "index": 0, "text": "Tell me about planets!", "icon": "planet" },
        { "index": 1, "text": "What are stars?", "icon": "star" },
        { "index": 2, "text": "I want to see the Moon!", "icon": "moon" }
      ],
      "created_at": "2024-12-15T10:35:00Z"
    },
    "depth_level": 0
  }
}
```

### 4.2 Send Message

```http
POST /v1/conversations/{conversation_id}/messages
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Request (Choice Selection):**
```json
{
  "choice_index": 0
}
```

**Request (Free-form Input):**
```json
{
  "content": "Why do stars twinkle?",
  "is_free_form": true
}
```

**Response (201 Created):**
```json
{
  "data": {
    "user_message": {
      "id": "990e8400-e29b-41d4-a716-446655440002",
      "role": "user",
      "content": "Tell me about planets!",
      "created_at": "2024-12-15T10:36:00Z"
    },
    "assistant_message": {
      "id": "990e8400-e29b-41d4-a716-446655440003",
      "role": "assistant",
      "content": "Planets are amazing! They're big round worlds that go around the Sun. Some are rocky like Earth, and some are made of gas like Jupiter!",
      "choices": [
        { "index": 0, "text": "How many planets are there?", "icon": "numbers" },
        { "index": 1, "text": "Can we live on other planets?", "icon": "house" },
        { "index": 2, "text": "Which planet is the biggest?", "icon": "expand" }
      ],
      "created_at": "2024-12-15T10:36:02Z"
    },
    "depth_level": 1,
    "depth_increased": true,
    "rewards": []
  }
}
```

### 4.3 Get Conversation History

```http
GET /v1/conversations/{conversation_id}/messages
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Query Parameters:**
- `limit` - Number of messages (default: 50)
- `before` - Cursor for pagination

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "role": "assistant",
      "content": "Hi Emma! Ready to blast off into space?",
      "choices": [...],
      "created_at": "2024-12-15T10:35:00Z"
    },
    {
      "id": "990e8400-e29b-41d4-a716-446655440002",
      "role": "user",
      "content": "Tell me about planets!",
      "selected_choice_index": 0,
      "created_at": "2024-12-15T10:36:00Z"
    }
  ],
  "meta": {
    "has_more": false,
    "cursor": null
  }
}
```

### 4.4 End Conversation

```http
POST /v1/conversations/{conversation_id}/end
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Response (200 OK):**
```json
{
  "data": {
    "conversation_id": "880e8400-e29b-41d4-a716-446655440001",
    "summary": "Emma explored planets and learned about the solar system!",
    "duration_minutes": 12,
    "depth_reached": 3,
    "questions_asked": 8,
    "rewards_earned": [
      { "type": "star", "amount": 15 },
      { "type": "badge", "id": "space_explorer_1" }
    ],
    "progress_update": {
      "topic": "Space",
      "previous_depth": 2,
      "new_depth": 3
    }
  }
}
```

### 4.5 Get Daily Brain Spark

```http
GET /v1/brain-spark
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440001",
    "date": "2024-12-15",
    "spark_type": "what_if",
    "question": "What if you could talk to animals? Which animal would you talk to first?",
    "hints": [
      "Think about your favorite animal...",
      "What would you want to ask them?"
    ],
    "already_completed": false,
    "streak_at_risk": false
  }
}
```

### 4.6 Complete Brain Spark

```http
POST /v1/brain-spark/{spark_id}/complete
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Request:**
```json
{
  "conversation_id": "880e8400-e29b-41d4-a716-446655440002"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "completed": true,
    "rewards": [
      { "type": "star", "amount": 5 }
    ],
    "streak_update": {
      "previous": 11,
      "current": 12,
      "milestone_reached": null
    }
  }
}
```

---

## 5. Progress Endpoints

### 5.1 Get Child Progress Summary

```http
GET /v1/progress
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Response (200 OK):**
```json
{
  "data": {
    "total_time_spent_minutes": 480,
    "topics_unlocked": 8,
    "topics_explored": 5,
    "total_depth_reached": 15,
    "conversations_count": 45,
    "questions_asked": 320,
    "aha_moments": 12,
    "streak": {
      "current": 12,
      "longest": 25
    },
    "stars": {
      "balance": 234,
      "lifetime_earned": 567
    },
    "badges_count": 8
  }
}
```

### 5.2 Get Topic Progress

```http
GET /v1/progress/topics
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "topic_id": "770e8400-e29b-41d4-a716-446655440001",
      "topic_name": "Space",
      "depth_level": 4,
      "max_depth": 10,
      "time_spent_minutes": 120,
      "conversations_count": 15,
      "unlocked_at": "2024-01-20T10:00:00Z",
      "last_interaction": "2024-12-14T15:30:00Z"
    }
  ]
}
```

### 5.3 Get Recent Activity

```http
GET /v1/progress/activity
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Query Parameters:**
- `days` - Number of days to fetch (default: 7, max: 30)

**Response (200 OK):**
```json
{
  "data": [
    {
      "date": "2024-12-15",
      "time_spent_minutes": 25,
      "topics_explored": ["Space", "Physics"],
      "brain_spark_completed": true,
      "stars_earned": 35,
      "streak_day": 12
    },
    {
      "date": "2024-12-14",
      "time_spent_minutes": 40,
      "topics_explored": ["Animals", "Nature"],
      "brain_spark_completed": true,
      "stars_earned": 45,
      "streak_day": 11
    }
  ]
}
```

---

## 6. Gamification Endpoints

### 6.1 Get Streak Info

```http
GET /v1/streaks
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Response (200 OK):**
```json
{
  "data": {
    "current_streak": 12,
    "longest_streak": 25,
    "last_activity_date": "2024-12-15",
    "streak_freezes_available": 2,
    "next_milestone": {
      "days": 14,
      "reward": {
        "type": "badge",
        "id": "two_week_wonder"
      }
    },
    "history": [
      { "date": "2024-12-15", "active": true, "streak": 12 },
      { "date": "2024-12-14", "active": true, "streak": 11 }
    ]
  }
}
```

### 6.2 Use Streak Freeze

```http
POST /v1/streaks/freeze
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Response (200 OK):**
```json
{
  "data": {
    "freeze_used": true,
    "streak_preserved": 12,
    "freezes_remaining": 1
  }
}
```

### 6.3 Get Rewards

```http
GET /v1/rewards
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Query Parameters:**
- `type` - Filter by type (badge, star, unlock)

**Response (200 OK):**
```json
{
  "data": {
    "stars": {
      "balance": 234,
      "lifetime_earned": 567
    },
    "badges": [
      {
        "id": "space_explorer_1",
        "name": "Space Explorer",
        "description": "Reached depth 3 in Space",
        "icon": "badge_space",
        "earned_at": "2024-12-10T14:00:00Z"
      }
    ],
    "unlocks": [
      {
        "id": "theme_galaxy",
        "name": "Galaxy Theme",
        "type": "constellation_theme",
        "unlocked_at": "2024-12-12T10:00:00Z"
      }
    ]
  }
}
```

### 6.4 Get Available Shop Items

```http
GET /v1/shop
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "avatar_astronaut",
      "name": "Astronaut Avatar",
      "category": "avatar",
      "cost": 100,
      "owned": false,
      "preview_url": "https://assets.brainspark.app/avatars/astronaut.png"
    },
    {
      "id": "theme_ocean",
      "name": "Ocean Theme",
      "category": "theme",
      "cost": 150,
      "owned": true,
      "preview_url": "https://assets.brainspark.app/themes/ocean.png"
    }
  ]
}
```

### 6.5 Purchase Shop Item

```http
POST /v1/shop/{item_id}/purchase
Authorization: Bearer <token>
X-Child-ID: <child_id>
```

**Response (200 OK):**
```json
{
  "data": {
    "purchased": true,
    "item": {
      "id": "avatar_astronaut",
      "name": "Astronaut Avatar"
    },
    "stars_spent": 100,
    "new_balance": 134
  }
}
```

---

## 7. Parent Dashboard Endpoints

### 7.1 Get Dashboard Summary

```http
GET /v1/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**
- `child_id` - Filter for specific child (optional)
- `period` - Time period: `day`, `week`, `month` (default: week)

**Response (200 OK):**
```json
{
  "data": {
    "period": "week",
    "children": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Emma",
        "summary": {
          "total_time_minutes": 180,
          "sessions_count": 12,
          "topics_explored": 5,
          "new_topics_unlocked": 2,
          "brain_sparks_completed": 7,
          "current_streak": 12,
          "stars_earned": 145
        },
        "daily_breakdown": [
          { "date": "2024-12-15", "minutes": 25, "active": true },
          { "date": "2024-12-14", "minutes": 40, "active": true }
        ]
      }
    ]
  }
}
```

### 7.2 Get Child Activity Details

```http
GET /v1/dashboard/children/{child_id}/activity
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` - Time period
- `include_conversations` - Include conversation summaries (default: false)

**Response (200 OK):**
```json
{
  "data": {
    "child": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Emma"
    },
    "topics_explored": [
      {
        "topic_id": "770e8400-e29b-41d4-a716-446655440001",
        "name": "Space",
        "time_spent_minutes": 45,
        "depth_change": { "from": 2, "to": 4 },
        "sample_questions": [
          "How do rockets escape Earth's gravity?",
          "What makes stars twinkle?"
        ]
      }
    ],
    "cognitive_growth": {
      "critical_thinking": { "score": 75, "change": 5 },
      "creative_thinking": { "score": 68, "change": 3 },
      "logical_reasoning": { "score": 62, "change": 8 },
      "knowledge_connection": { "score": 45, "change": 10 }
    },
    "conversations": [
      {
        "id": "880e8400-e29b-41d4-a716-446655440001",
        "topic": "Space",
        "date": "2024-12-15T10:35:00Z",
        "duration_minutes": 12,
        "depth_reached": 3,
        "excerpt": "Emma asked about black holes and learned about gravity..."
      }
    ]
  }
}
```

### 7.3 Get Conversation Logs

```http
GET /v1/dashboard/children/{child_id}/conversations
Authorization: Bearer <token>
```

**Query Parameters:**
- `from_date` - Start date
- `to_date` - End date
- `topic_id` - Filter by topic
- `limit` - Results per page (default: 20)
- `cursor` - Pagination cursor

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440001",
      "topic": {
        "id": "770e8400-e29b-41d4-a716-446655440001",
        "name": "Space"
      },
      "started_at": "2024-12-15T10:35:00Z",
      "ended_at": "2024-12-15T10:47:00Z",
      "messages_count": 16,
      "depth_reached": 3
    }
  ],
  "meta": {
    "has_more": true,
    "cursor": "conv_xyz123"
  }
}
```

### 7.4 Get Full Conversation (Parent Access)

```http
GET /v1/dashboard/conversations/{conversation_id}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440001",
    "child": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Emma"
    },
    "topic": {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "name": "Space"
    },
    "messages": [
      {
        "role": "assistant",
        "content": "Hi Emma! Ready to blast off into space?",
        "timestamp": "2024-12-15T10:35:00Z"
      },
      {
        "role": "user",
        "content": "Tell me about planets!",
        "timestamp": "2024-12-15T10:35:30Z"
      }
    ],
    "safety_flags": []
  }
}
```

### 7.5 Update Child Settings (Parental Controls)

```http
PATCH /v1/dashboard/children/{child_id}/settings
Authorization: Bearer <token>
```

**Request:**
```json
{
  "daily_time_limit_minutes": 45,
  "bedtime_start": "19:30",
  "bedtime_end": "07:00",
  "restricted_topics": ["770e8400-e29b-41d4-a716-446655440010"]
}
```

---

## 8. Error Handling

### 8.1 Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "request_id": "req_abc123"
  }
}
```

### 8.2 Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid request data |
| 400 | INVALID_CHOICE | Invalid conversation choice |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 401 | TOKEN_EXPIRED | JWT token has expired |
| 403 | FORBIDDEN | Insufficient permissions |
| 403 | CHILD_ACCESS_DENIED | Not authorized for this child |
| 403 | TIME_LIMIT_REACHED | Daily time limit exceeded |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 422 | UNPROCESSABLE_ENTITY | Request understood but cannot process |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

### 8.3 Child-Friendly Errors

For errors during child sessions, return both technical and friendly messages:

```json
{
  "error": {
    "code": "TIME_LIMIT_REACHED",
    "message": "Daily time limit has been reached",
    "child_message": "Great thinking today! Let's take a break and come back tomorrow!",
    "child_animation": "sleepy_mascot"
  }
}
```

---

## 9. Rate Limiting

### 9.1 Rate Limit Tiers

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Authentication | 5 req | 1 minute |
| Conversation Messages | 30 req | 1 minute |
| API General | 100 req | 1 minute |
| Dashboard | 60 req | 1 minute |

### 9.2 Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702627200
Retry-After: 30  # Only on 429 response
```

### 9.3 Rate Limit Response

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please wait before trying again.",
    "retry_after": 30
  }
}
```

---

## 10. WebSocket Events

### 10.1 Connection

```javascript
// Connect with authentication
const socket = new WebSocket('wss://api.brainspark.app/v1/ws');

socket.onopen = () => {
  socket.send(JSON.stringify({
    type: 'auth',
    token: 'Bearer eyJhbGc...',
    child_id: '660e8400-e29b-41d4-a716-446655440001'
  }));
};
```

### 10.2 Event Types

#### Typing Indicator (Streaming Response)

```json
{
  "type": "typing",
  "conversation_id": "880e8400-e29b-41d4-a716-446655440001",
  "is_typing": true
}
```

#### Message Stream

```json
{
  "type": "message_chunk",
  "conversation_id": "880e8400-e29b-41d4-a716-446655440001",
  "chunk": "Planets are ",
  "chunk_index": 0
}
```

#### Message Complete

```json
{
  "type": "message_complete",
  "conversation_id": "880e8400-e29b-41d4-a716-446655440001",
  "message": {
    "id": "990e8400-e29b-41d4-a716-446655440003",
    "role": "assistant",
    "content": "Planets are amazing! They're big round worlds...",
    "choices": [...]
  }
}
```

#### Reward Earned

```json
{
  "type": "reward_earned",
  "reward": {
    "type": "badge",
    "id": "deep_thinker_5",
    "name": "Deep Thinker",
    "animation": "badge_reveal"
  }
}
```

#### Time Warning

```json
{
  "type": "time_warning",
  "minutes_remaining": 5,
  "message": "5 more minutes of brain sparking today!"
}
```

#### Session End

```json
{
  "type": "session_end",
  "reason": "time_limit",
  "message": "Great thinking today! See you tomorrow!"
}
```

---

## Appendix A: API Versioning Strategy

### Version Lifecycle

| Stage | Duration | Support |
|-------|----------|---------|
| Current (v1) | Active | Full support |
| Deprecated | 6 months | Bug fixes only |
| Sunset | 3 months notice | Read-only |
| Removed | - | No access |

### Breaking Changes Policy

Breaking changes require new API version:
- Removing endpoints
- Removing required fields
- Changing field types
- Changing authentication

Non-breaking changes allowed in same version:
- Adding optional fields
- Adding new endpoints
- Adding new optional parameters

---

## Appendix B: OpenAPI Specification

Full OpenAPI 3.0 specification available at:
- Development: `https://api-dev.brainspark.app/v1/openapi.json`
- Production: `https://api.brainspark.app/v1/openapi.json`

Interactive documentation:
- Swagger UI: `https://api.brainspark.app/docs`
- ReDoc: `https://api.brainspark.app/redoc`

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-15 | BrainSpark Team | Initial document |

---

*Previous Document: [06-DATABASE-SCHEMA.md](./06-DATABASE-SCHEMA.md)*
*Next Document: [08-DEVELOPMENT-ROADMAP.md](../planning/08-DEVELOPMENT-ROADMAP.md)*
