# BrainSpark - Analytics Events Specification

## Document Purpose

Complete specification of all analytics events tracked in BrainSpark for product insights, user behavior analysis, and business metrics.

---

## 1. Analytics Overview

### 1.1 Analytics Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Event Collection | Segment | Unified data collection |
| Product Analytics | Mixpanel | User behavior, funnels |
| Business Intelligence | Metabase | Custom reports, dashboards |
| Data Warehouse | BigQuery | Long-term storage, analysis |
| Session Recording | FullStory | UX debugging (parents only) |

### 1.2 Privacy Considerations

**COPPA Compliance:**
- NO analytics for child sessions beyond aggregated, anonymized data
- Child events use anonymized `session_id`, not `child_id`
- NO personal data in child event properties
- NO session recording for child users
- Parent dashboard tracks child progress internally, not via external analytics

**Data Retention:**
- Raw events: 90 days
- Aggregated data: 2 years
- Anonymized metrics: Indefinite

### 1.3 Event Naming Convention

```
{entity}_{action}_{detail}
```

**Examples:**
- `session_started`
- `conversation_message_sent`
- `subscription_upgraded`
- `badge_earned`

---

## 2. User Identity & Properties

### 2.1 Parent Identity

```javascript
analytics.identify(parent_id, {
  // Profile properties
  email: "parent@example.com",
  created_at: "2024-01-15T10:30:00Z",

  // Subscription
  subscription_plan: "family",           // free, individual, family
  subscription_status: "active",         // active, past_due, canceled
  subscription_started_at: "2024-01-15T10:30:00Z",

  // Children (counts only, no PII)
  child_count: 2,
  child_age_groups: ["wonder_cubs", "curious_explorers"],

  // Engagement
  total_sessions: 45,
  last_active_at: "2024-03-15T18:30:00Z",

  // Acquisition
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "spring_launch",
  referral_code: "FRIEND123"
});
```

### 2.2 Anonymous Child Session

```javascript
// Child sessions use anonymous tracking only
analytics.track("child_session_started", {
  session_id: "anon_abc123",           // Random, non-linkable
  age_group: "curious_explorers",       // Aggregation only
  // NO child_id, name, or identifiable info
});
```

---

## 3. Core Events

### 3.1 Authentication Events

#### `account_created`
**Trigger:** Parent completes registration

```javascript
{
  event: "account_created",
  properties: {
    auth_method: "email",              // email, google, apple
    referral_code: "FRIEND123",        // null if none
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "spring_launch",
    platform: "web"                    // web, ios, android
  }
}
```

#### `login_completed`
**Trigger:** Successful login

```javascript
{
  event: "login_completed",
  properties: {
    auth_method: "google",
    platform: "ios",
    days_since_last_login: 3
  }
}
```

#### `login_failed`
**Trigger:** Failed login attempt

```javascript
{
  event: "login_failed",
  properties: {
    auth_method: "email",
    error_type: "invalid_password",    // invalid_password, account_locked, not_found
    platform: "web"
  }
}
```

#### `password_reset_requested`
**Trigger:** Password reset email sent

```javascript
{
  event: "password_reset_requested",
  properties: {
    platform: "web"
  }
}
```

#### `logout_completed`
**Trigger:** User logged out

```javascript
{
  event: "logout_completed",
  properties: {
    session_duration_seconds: 1847,
    platform: "ios"
  }
}
```

---

### 3.2 Onboarding Events

#### `onboarding_started`
**Trigger:** User enters onboarding flow

```javascript
{
  event: "onboarding_started",
  properties: {
    is_returning: false,
    platform: "web"
  }
}
```

#### `onboarding_step_completed`
**Trigger:** Each onboarding step completion

```javascript
{
  event: "onboarding_step_completed",
  properties: {
    step_number: 2,
    step_name: "add_child",
    time_on_step_seconds: 45
  }
}
```

#### `child_profile_created`
**Trigger:** Child profile added

```javascript
{
  event: "child_profile_created",
  properties: {
    age_group: "curious_explorers",
    is_first_child: true,
    interests_selected: ["space", "animals", "dinosaurs"],
    interests_count: 3
  }
}
```

#### `onboarding_completed`
**Trigger:** Onboarding flow finished

```javascript
{
  event: "onboarding_completed",
  properties: {
    total_duration_seconds: 180,
    steps_completed: 4,
    child_profiles_created: 1
  }
}
```

#### `onboarding_skipped`
**Trigger:** User skips onboarding

```javascript
{
  event: "onboarding_skipped",
  properties: {
    skipped_at_step: 3,
    step_name: "select_interests"
  }
}
```

---

### 3.3 Session Events

#### `session_started`
**Trigger:** App/web session begins

```javascript
{
  event: "session_started",
  properties: {
    platform: "ios",
    app_version: "1.2.3",
    device_type: "phone",              // phone, tablet, desktop
    is_pwa_installed: true,
    days_since_last_session: 1
  }
}
```

#### `session_ended`
**Trigger:** Session terminates

```javascript
{
  event: "session_ended",
  properties: {
    session_duration_seconds: 847,
    screens_viewed: 12,
    conversations_started: 2,
    platform: "ios"
  }
}
```

#### `child_session_started`
**Trigger:** Child profile selected (ANONYMIZED)

```javascript
{
  event: "child_session_started",
  properties: {
    session_id: "anon_xyz789",         // Anonymous session ID
    age_group: "wonder_cubs",
    platform: "tablet"
  }
}
```

#### `child_session_ended`
**Trigger:** Child returns to profile select (ANONYMIZED)

```javascript
{
  event: "child_session_ended",
  properties: {
    session_id: "anon_xyz789",
    session_duration_seconds: 542,
    topics_explored: 3,
    messages_sent: 15,
    depth_increases: 2
  }
}
```

---

### 3.4 Conversation Events

#### `conversation_started`
**Trigger:** New conversation begins (ANONYMIZED for children)

```javascript
{
  event: "conversation_started",
  properties: {
    session_id: "anon_xyz789",
    topic: "space",
    entry_point: "daily_spark",        // daily_spark, constellation, continuation
    initial_depth: 1,
    age_group: "curious_explorers"
  }
}
```

#### `conversation_message_sent`
**Trigger:** User sends message (ANONYMIZED)

```javascript
{
  event: "conversation_message_sent",
  properties: {
    session_id: "anon_xyz789",
    message_type: "question",          // question, choice_selected, voice
    topic: "space",
    current_depth: 3,
    conversation_turn: 7,
    input_method: "text"               // text, voice, choice_tap
  }
}
```

#### `conversation_choice_presented`
**Trigger:** AI presents choices to child (ANONYMIZED)

```javascript
{
  event: "conversation_choice_presented",
  properties: {
    session_id: "anon_xyz789",
    choice_count: 3,
    choice_type: "follow_up",          // follow_up, topic_change, activity
    topic: "space",
    current_depth: 3
  }
}
```

#### `conversation_ended`
**Trigger:** Conversation concludes (ANONYMIZED)

```javascript
{
  event: "conversation_ended",
  properties: {
    session_id: "anon_xyz789",
    topic: "space",
    final_depth: 5,
    total_messages: 24,
    duration_seconds: 423,
    end_reason: "user_exit",           // user_exit, topic_complete, session_limit, inactivity
    cross_topic_links: 2
  }
}
```

---

### 3.5 Progress & Achievement Events

#### `depth_increased`
**Trigger:** Child reaches new depth in topic (ANONYMIZED)

```javascript
{
  event: "depth_increased",
  properties: {
    session_id: "anon_xyz789",
    topic: "space",
    new_depth: 4,
    previous_depth: 3,
    time_at_previous_depth_seconds: 180,
    age_group: "curious_explorers"
  }
}
```

#### `topic_discovered`
**Trigger:** New topic unlocked (ANONYMIZED)

```javascript
{
  event: "topic_discovered",
  properties: {
    session_id: "anon_xyz789",
    topic: "black_holes",
    parent_topic: "space",
    discovery_method: "conversation"    // conversation, constellation, daily_spark
  }
}
```

#### `badge_earned`
**Trigger:** Achievement badge unlocked (ANONYMIZED)

```javascript
{
  event: "badge_earned",
  properties: {
    session_id: "anon_xyz789",
    badge_id: "deep_diver_5",
    badge_category: "depth",           // depth, streak, exploration, connection
    topic: "space",                    // if applicable
    age_group: "curious_explorers"
  }
}
```

#### `streak_milestone`
**Trigger:** Streak milestone reached (ANONYMIZED)

```javascript
{
  event: "streak_milestone",
  properties: {
    session_id: "anon_xyz789",
    streak_days: 7,
    previous_milestone: 3,
    age_group: "wonder_cubs"
  }
}
```

#### `streak_broken`
**Trigger:** User loses streak

```javascript
{
  event: "streak_broken",
  properties: {
    streak_lost: 5,
    days_missed: 1,
    last_active_day: "2024-03-14"
  }
}
```

---

### 3.6 Daily Brain Spark Events

#### `daily_spark_viewed`
**Trigger:** Daily spark displayed (ANONYMIZED)

```javascript
{
  event: "daily_spark_viewed",
  properties: {
    session_id: "anon_xyz789",
    spark_type: "question",            // question, fact, challenge
    spark_topic: "animals",
    age_group: "wonder_cubs"
  }
}
```

#### `daily_spark_engaged`
**Trigger:** User engages with spark (ANONYMIZED)

```javascript
{
  event: "daily_spark_engaged",
  properties: {
    session_id: "anon_xyz789",
    spark_type: "question",
    engagement_action: "start_conversation",  // start_conversation, share, skip
    time_to_engage_seconds: 12
  }
}
```

---

### 3.7 Constellation Events

#### `constellation_viewed`
**Trigger:** Knowledge constellation opened

```javascript
{
  event: "constellation_viewed",
  properties: {
    session_id: "anon_xyz789",
    topics_visible: 15,
    topics_unlocked: 8,
    connections_visible: 12
  }
}
```

#### `constellation_topic_selected`
**Trigger:** Topic selected in constellation (ANONYMIZED)

```javascript
{
  event: "constellation_topic_selected",
  properties: {
    session_id: "anon_xyz789",
    topic: "dinosaurs",
    topic_depth: 3,
    is_unlocked: true,
    selection_method: "tap"            // tap, drag, zoom
  }
}
```

#### `constellation_connection_discovered`
**Trigger:** New connection between topics found (ANONYMIZED)

```javascript
{
  event: "constellation_connection_discovered",
  properties: {
    session_id: "anon_xyz789",
    topic_a: "dinosaurs",
    topic_b: "birds",
    connection_type: "evolution"
  }
}
```

---

### 3.8 Subscription Events

#### `subscription_page_viewed`
**Trigger:** User views pricing/subscription page

```javascript
{
  event: "subscription_page_viewed",
  properties: {
    current_plan: "free",
    source: "feature_gate",            // feature_gate, settings, upgrade_prompt
    platform: "web"
  }
}
```

#### `subscription_plan_selected`
**Trigger:** User selects a plan

```javascript
{
  event: "subscription_plan_selected",
  properties: {
    selected_plan: "family",
    billing_period: "annual",
    displayed_price: 79.99,
    current_plan: "free"
  }
}
```

#### `subscription_started`
**Trigger:** Successful subscription purchase

```javascript
{
  event: "subscription_started",
  properties: {
    plan: "family",
    billing_period: "annual",
    price: 79.99,
    currency: "USD",
    payment_method: "card",
    trial_days: 7,
    discount_code: "WELCOME20",
    discount_percent: 20
  }
}
```

#### `subscription_trial_started`
**Trigger:** Free trial begins

```javascript
{
  event: "subscription_trial_started",
  properties: {
    plan: "family",
    trial_duration_days: 7,
    source: "onboarding"
  }
}
```

#### `subscription_trial_ended`
**Trigger:** Trial period ends

```javascript
{
  event: "subscription_trial_ended",
  properties: {
    plan: "family",
    converted: true,
    trial_engagement: "high"           // low, medium, high (based on usage)
  }
}
```

#### `subscription_upgraded`
**Trigger:** Plan upgrade

```javascript
{
  event: "subscription_upgraded",
  properties: {
    previous_plan: "individual",
    new_plan: "family",
    price_difference: 30.00
  }
}
```

#### `subscription_downgraded`
**Trigger:** Plan downgrade

```javascript
{
  event: "subscription_downgraded",
  properties: {
    previous_plan: "family",
    new_plan: "individual",
    reason: "only_one_child"           // if provided
  }
}
```

#### `subscription_canceled`
**Trigger:** Subscription cancellation

```javascript
{
  event: "subscription_canceled",
  properties: {
    plan: "family",
    subscription_age_days: 45,
    cancel_reason: "too_expensive",    // too_expensive, not_using, child_outgrew, missing_features, other
    cancel_feedback: "Wish there was more math content",
    will_expire_at: "2024-04-15"
  }
}
```

#### `subscription_reactivated`
**Trigger:** Canceled subscription restarted

```javascript
{
  event: "subscription_reactivated",
  properties: {
    plan: "family",
    days_since_cancel: 14
  }
}
```

---

### 3.9 Payment Events

#### `payment_method_added`
**Trigger:** Payment method saved

```javascript
{
  event: "payment_method_added",
  properties: {
    payment_type: "card",              // card, apple_pay, google_pay
    card_brand: "visa"                 // if applicable
  }
}
```

#### `payment_succeeded`
**Trigger:** Successful payment

```javascript
{
  event: "payment_succeeded",
  properties: {
    amount: 79.99,
    currency: "USD",
    payment_type: "subscription",      // subscription, upgrade
    plan: "family"
  }
}
```

#### `payment_failed`
**Trigger:** Payment failure

```javascript
{
  event: "payment_failed",
  properties: {
    amount: 79.99,
    failure_reason: "card_declined",
    retry_count: 1,
    plan: "family"
  }
}
```

---

### 3.10 Parent Dashboard Events

#### `dashboard_viewed`
**Trigger:** Parent opens dashboard

```javascript
{
  event: "dashboard_viewed",
  properties: {
    children_count: 2,
    platform: "web"
  }
}
```

#### `child_report_viewed`
**Trigger:** Parent views child's progress

```javascript
{
  event: "child_report_viewed",
  properties: {
    report_type: "weekly",             // daily, weekly, monthly, all_time
    child_age_group: "curious_explorers"
  }
}
```

#### `interest_added`
**Trigger:** Parent adds interest for child

```javascript
{
  event: "interest_added",
  properties: {
    interest: "music",
    child_age_group: "wonder_cubs",
    source: "dashboard"
  }
}
```

#### `time_limit_set`
**Trigger:** Parent sets usage limit

```javascript
{
  event: "time_limit_set",
  properties: {
    daily_limit_minutes: 30,
    child_age_group: "wonder_cubs"
  }
}
```

---

### 3.11 Feature Usage Events

#### `feature_gate_shown`
**Trigger:** Premium feature gate displayed

```javascript
{
  event: "feature_gate_shown",
  properties: {
    feature: "unlimited_conversations",
    current_plan: "free",
    location: "conversation_limit"     // where in app
  }
}
```

#### `feature_gate_converted`
**Trigger:** User upgrades from feature gate

```javascript
{
  event: "feature_gate_converted",
  properties: {
    feature: "unlimited_conversations",
    converted_to_plan: "family"
  }
}
```

#### `voice_input_used`
**Trigger:** Voice input feature used

```javascript
{
  event: "voice_input_used",
  properties: {
    session_id: "anon_xyz789",
    age_group: "wonder_cubs",
    duration_seconds: 5,
    success: true
  }
}
```

#### `share_initiated`
**Trigger:** Share action started

```javascript
{
  event: "share_initiated",
  properties: {
    content_type: "achievement",       // achievement, progress, referral
    share_method: "link"               // link, social, email
  }
}
```

---

## 4. Error & Performance Events

### 4.1 Error Events

#### `error_occurred`
**Trigger:** Application error

```javascript
{
  event: "error_occurred",
  properties: {
    error_type: "api_error",           // api_error, network_error, validation_error
    error_code: "500",
    error_message: "Internal server error",  // Generic, no PII
    screen: "conversation",
    platform: "ios",
    app_version: "1.2.3"
  }
}
```

#### `ai_response_failed`
**Trigger:** AI response error (ANONYMIZED)

```javascript
{
  event: "ai_response_failed",
  properties: {
    session_id: "anon_xyz789",
    error_type: "timeout",             // timeout, rate_limit, content_filter
    retry_count: 2
  }
}
```

### 4.2 Performance Events

#### `screen_load_time`
**Trigger:** Screen fully loaded

```javascript
{
  event: "screen_load_time",
  properties: {
    screen: "constellation",
    load_time_ms: 1234,
    platform: "web",
    connection_type: "4g"
  }
}
```

#### `ai_response_time`
**Trigger:** AI response received (ANONYMIZED)

```javascript
{
  event: "ai_response_time",
  properties: {
    session_id: "anon_xyz789",
    response_time_ms: 2500,
    message_length: 150
  }
}
```

---

## 5. Funnel Definitions

### 5.1 Onboarding Funnel

```
account_created
  → onboarding_started
    → onboarding_step_completed (step: add_child)
      → child_profile_created
        → onboarding_completed
```

**Key Metrics:**
- Completion rate: Target > 70%
- Drop-off by step
- Time to complete

### 5.2 First Session Funnel

```
session_started
  → child_session_started
    → daily_spark_viewed
      → conversation_started
        → depth_increased
          → badge_earned
```

### 5.3 Subscription Conversion Funnel

```
subscription_page_viewed
  → subscription_plan_selected
    → subscription_started
```

**Variants:**
- From feature gate
- From upgrade prompt
- Direct from settings

### 5.4 Retention Funnel

```
Day 0: account_created
Day 1: session_started
Day 7: session_started
Day 30: session_started
```

---

## 6. Dashboards & Reports

### 6.1 Real-Time Dashboard

| Metric | Visualization |
|--------|---------------|
| Active Sessions | Counter |
| Messages/minute | Line chart |
| Active Topics | Bar chart |
| Errors | Alert list |

### 6.2 Daily Report

| Metric | Description |
|--------|-------------|
| DAU | Daily active users (parents) |
| Child Sessions | Anonymized session count |
| New Signups | Account created |
| Trial Starts | Free trials began |
| Conversions | Trial → Paid |
| Churn | Cancellations |
| Revenue | MRR change |

### 6.3 Weekly Product Report

| Section | Metrics |
|---------|---------|
| Growth | WAU, Signups, Activations |
| Engagement | Sessions/user, Avg depth, Topics explored |
| Retention | D1, D7, D30 cohorts |
| Revenue | MRR, ARPU, LTV |
| Health | Error rate, Latency p99 |

### 6.4 Monthly Business Review

- MRR & ARR
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Churn rate by cohort
- Feature adoption rates
- Top cancellation reasons

---

## 7. Implementation

### 7.1 Client SDK Setup

```typescript
// analytics.ts
import Analytics from "@segment/analytics-next";

const analytics = new Analytics({
  writeKey: process.env.SEGMENT_WRITE_KEY,
});

// Identify parent user
export function identifyParent(parentId: string, traits: ParentTraits) {
  analytics.identify(parentId, {
    email: traits.email,
    subscription_plan: traits.subscriptionPlan,
    child_count: traits.childCount,
    created_at: traits.createdAt,
  });
}

// Track events with privacy compliance
export function track(eventName: string, properties: EventProperties) {
  // Strip any PII from child-related events
  if (properties.isChildContext) {
    delete properties.childId;
    delete properties.childName;
    properties.session_id = generateAnonymousId();
  }

  analytics.track(eventName, {
    ...properties,
    platform: getPlatform(),
    app_version: APP_VERSION,
    timestamp: new Date().toISOString(),
  });
}

// Anonymous child session tracking
export function trackChildSession(eventName: string, properties: object) {
  analytics.track(eventName, {
    ...properties,
    session_id: getAnonymousSessionId(),
    // NO child_id or identifiable info
  });
}
```

### 7.2 Server-Side Tracking

```python
# analytics.py
import segment.analytics as analytics

analytics.write_key = os.environ["SEGMENT_WRITE_KEY"]

def track_server_event(user_id: str, event: str, properties: dict):
    """Track server-side event"""
    analytics.track(
        user_id=user_id,
        event=event,
        properties={
            **properties,
            "source": "server",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

def track_anonymous_event(event: str, properties: dict):
    """Track anonymous event (child sessions)"""
    analytics.track(
        anonymous_id=generate_anonymous_id(),
        event=event,
        properties=properties
    )
```

### 7.3 Event Validation

```typescript
// eventSchemas.ts
import { z } from "zod";

export const conversationStartedSchema = z.object({
  session_id: z.string(),
  topic: z.string(),
  entry_point: z.enum(["daily_spark", "constellation", "continuation"]),
  initial_depth: z.number().int().positive(),
  age_group: z.enum(["wonder_cubs", "curious_explorers", "mind_masters"]),
});

export function validateEvent(eventName: string, properties: unknown) {
  const schema = eventSchemas[eventName];
  if (!schema) {
    console.warn(`No schema for event: ${eventName}`);
    return true;
  }

  try {
    schema.parse(properties);
    return true;
  } catch (error) {
    console.error(`Invalid event properties for ${eventName}:`, error);
    return false;
  }
}
```

---

## 8. Data Governance

### 8.1 PII Handling

| Field | Treatment |
|-------|-----------|
| Email | Hashed in warehouse |
| Name | Never stored in analytics |
| Child info | Never linked to analytics |
| IP Address | Truncated to /24 |
| Device ID | Hashed |

### 8.2 Data Access Levels

| Role | Access |
|------|--------|
| Engineering | Full (encrypted) |
| Product | Aggregated + anonymized |
| Marketing | Aggregated only |
| Support | User lookup (limited) |

### 8.3 Audit Trail

All data access logged:
- Who accessed
- What data
- When
- Purpose

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-15 | BrainSpark Team | Initial document |
