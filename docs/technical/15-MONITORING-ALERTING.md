# BrainSpark - Monitoring & Alerting

## Document Purpose

This document defines the monitoring strategy, dashboards, and alerting rules for BrainSpark.

---

## 1. Monitoring Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Metrics | Cloud Monitoring | Infrastructure & app metrics |
| Logs | Cloud Logging | Centralized logging |
| Traces | Cloud Trace | Distributed tracing |
| Errors | Sentry | Error tracking & alerting |
| Uptime | Cloud Monitoring | Health checks |
| APM | Cloud Profiler | Performance analysis |

---

## 2. Key Metrics

### 2.1 Application Metrics

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| API Response Time (p95) | <1s | >2s | >5s |
| AI Response Time (p95) | <3s | >4s | >6s |
| Error Rate | <0.1% | >0.5% | >1% |
| Request Rate | Baseline | +50% | +100% |

### 2.2 Infrastructure Metrics

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| CPU Usage | <70% | >80% | >90% |
| Memory Usage | <70% | >80% | >90% |
| Database Connections | <80% | >85% | >95% |
| Disk Usage | <70% | >80% | >90% |

### 2.3 Business Metrics

| Metric | Description |
|--------|-------------|
| Daily Active Users | Unique users per day |
| Session Duration | Average time in app |
| Conversation Count | Conversations started |
| Brain Spark Completion | Daily completion rate |
| Streak Retention | Users maintaining streaks |

---

## 3. Alert Configuration

### 3.1 Alert Policies

```yaml
# High Priority Alerts (PagerDuty)
alerts:
  - name: Service Down
    condition: uptime_check_failed
    for: 2m
    severity: critical
    notify: pagerduty

  - name: High Error Rate
    condition: error_rate > 1%
    for: 5m
    severity: critical
    notify: pagerduty

  - name: Database Connection Exhausted
    condition: db_connections > 95%
    for: 2m
    severity: critical
    notify: pagerduty

# Medium Priority Alerts (Slack)
  - name: Elevated Latency
    condition: p95_latency > 3s
    for: 10m
    severity: warning
    notify: slack

  - name: High Memory Usage
    condition: memory > 85%
    for: 10m
    severity: warning
    notify: slack

# Low Priority Alerts (Email)
  - name: Elevated Error Rate
    condition: error_rate > 0.5%
    for: 15m
    severity: info
    notify: email
```

### 3.2 Notification Channels

| Channel | Use Case | Response Time |
|---------|----------|---------------|
| PagerDuty | Critical issues | Immediate |
| Slack #alerts | Warnings | <30 min |
| Email | Info/daily digest | Next business day |

---

## 4. Dashboards

### 4.1 Overview Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     BrainSpark Operations Dashboard                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  Active Users    │  │   Error Rate     │  │   API Latency    │      │
│  │     1,234        │  │     0.05%        │  │     245ms        │      │
│  │   ▲ +12%        │  │    ✓ Normal      │  │    ✓ Normal      │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                          │
│  Request Volume (24h)          Error Distribution                        │
│  ┌────────────────────────┐   ┌────────────────────────┐               │
│  │    ▂▃▅▇█▇▅▃▂          │   │  4xx: 12  5xx: 3       │               │
│  │                        │   │  Timeout: 1            │               │
│  └────────────────────────┘   └────────────────────────┘               │
│                                                                          │
│  Cloud Run Instances           Database Connections                      │
│  ┌────────────────────────┐   ┌────────────────────────┐               │
│  │  API: 5   AI: 3        │   │  45/100 (45%)          │               │
│  │  Web: 4                │   │  ████████░░░░          │               │
│  └────────────────────────┘   └────────────────────────┘               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Log Management

### 5.1 Log Levels

| Level | Usage | Retention |
|-------|-------|-----------|
| ERROR | Exceptions, failures | 90 days |
| WARN | Degraded performance | 30 days |
| INFO | Request/response | 14 days |
| DEBUG | Detailed debugging | 7 days |

### 5.2 Structured Logging Format

```json
{
  "timestamp": "2024-12-15T10:30:00Z",
  "level": "INFO",
  "service": "brainspark-api",
  "trace_id": "abc123",
  "user_id": "user_456",
  "child_id": "child_789",
  "message": "Conversation started",
  "metadata": {
    "topic": "space",
    "age_group": "curious_explorers"
  }
}
```

---

## 6. Incident Response

### 6.1 Severity Levels

| Severity | Description | Response Time | Example |
|----------|-------------|---------------|---------|
| SEV1 | Service down | 15 min | Full outage |
| SEV2 | Major degradation | 30 min | High error rate |
| SEV3 | Minor issues | 4 hours | Slow performance |
| SEV4 | Low impact | 24 hours | UI glitch |

### 6.2 On-Call Rotation

- Primary: First responder (PagerDuty)
- Secondary: Backup if primary unavailable
- Escalation: Manager after 30 min unacknowledged

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-15 | BrainSpark Team | Initial document |
