# BrainSpark - Runbooks

## Document Purpose

Operational runbooks for responding to common incidents and performing routine maintenance.

---

## 1. Incident Response Runbooks

### 1.1 Service Outage

```markdown
## Runbook: Complete Service Outage

**Severity**: SEV1
**On-Call Response**: Immediate

### Detection
- Uptime check alerts
- User reports
- Error rate spike to 100%

### Initial Response (0-5 min)
1. Acknowledge alert in PagerDuty
2. Join incident Slack channel #incident-response
3. Check status page: status.brainspark.app

### Diagnosis (5-15 min)
1. Check Cloud Run service status:
   ```bash
   gcloud run services describe brainspark-api --region us-central1
   ```

2. Check recent deployments:
   ```bash
   gcloud run revisions list --service brainspark-api
   ```

3. Check Cloud SQL status:
   ```bash
   gcloud sql instances describe brainspark-db
   ```

4. Check logs:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision" --limit 50
   ```

### Resolution Actions

**If deployment issue:**
```bash
# Rollback to previous revision
gcloud run services update-traffic brainspark-api \
  --to-revisions PREVIOUS_REVISION=100
```

**If database issue:**
```bash
# Check connections
gcloud sql operations list --instance brainspark-db
# Restart if needed (last resort)
gcloud sql instances restart brainspark-db
```

**If infrastructure issue:**
- Contact GCP support
- Enable maintenance page

### Post-Incident
1. Update status page
2. Document timeline
3. Schedule post-mortem
```

### 1.2 High Error Rate

```markdown
## Runbook: High Error Rate (>1%)

**Severity**: SEV2
**Response Time**: 30 minutes

### Detection
- Alert: error_rate > 1% for 5 min

### Diagnosis
1. Check error logs:
   ```bash
   gcloud logging read "severity>=ERROR" --limit 100
   ```

2. Check Sentry for error grouping

3. Identify affected endpoints:
   ```bash
   gcloud logging read 'httpRequest.status>=500' --limit 50
   ```

### Common Causes & Fixes

**Database connection exhaustion:**
```bash
# Check connections
SELECT count(*) FROM pg_stat_activity;
# Kill idle connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE state = 'idle' AND query_start < now() - interval '10 minutes';
```

**AI service timeout:**
- Check Anthropic status page
- Enable fallback responses
- Increase timeout if needed

**Memory exhaustion:**
```bash
# Scale up instances
gcloud run services update brainspark-api --memory 2Gi
```
```

### 1.3 Database Performance Issues

```markdown
## Runbook: Database Slow Queries

**Severity**: SEV3
**Response Time**: 4 hours

### Detection
- Slow query alerts
- High database CPU

### Diagnosis
1. Enable query insights in Cloud SQL console
2. Find slow queries:
   ```sql
   SELECT query, calls, mean_time, total_time
   FROM pg_stat_statements
   ORDER BY total_time DESC
   LIMIT 10;
   ```

### Resolution
1. Add missing indexes
2. Optimize queries
3. Scale database tier if needed

```

---

## 2. Maintenance Runbooks

### 2.1 Database Migration

```markdown
## Runbook: Database Migration

### Pre-Migration
1. Notify team in Slack
2. Create backup:
   ```bash
   gcloud sql export sql brainspark-db \
     gs://brainspark-backups/pre-migration-$(date +%Y%m%d).sql
   ```
3. Test migration on staging

### Migration
1. Enable maintenance mode (optional)
2. Run migration:
   ```bash
   alembic upgrade head
   ```
3. Verify migration:
   ```bash
   alembic current
   ```

### Post-Migration
1. Run smoke tests
2. Monitor error rates
3. Disable maintenance mode
```

### 2.2 SSL Certificate Renewal

```markdown
## Runbook: SSL Certificate Renewal

### Check Expiration
```bash
gcloud certificate-manager certificates describe brainspark-cert
```

### Renewal (Managed certificates auto-renew)
If manual intervention needed:
1. Create new certificate
2. Update load balancer
3. Delete old certificate
```

---

## 3. Routine Operations

### 3.1 Scale Services

```bash
# Scale up for expected traffic
gcloud run services update brainspark-api \
  --min-instances 5 \
  --max-instances 100

# Scale down after event
gcloud run services update brainspark-api \
  --min-instances 2 \
  --max-instances 50
```

### 3.2 Clear Cache

```bash
# Connect to Redis
redis-cli -h REDIS_HOST

# Clear specific cache
DEL "cache:constellation:*"

# Clear all (use with caution)
FLUSHDB
```

### 3.3 Rotate Secrets

```bash
# Generate new secret
NEW_SECRET=$(openssl rand -base64 32)

# Update in Secret Manager
echo -n "$NEW_SECRET" | gcloud secrets versions add jwt-secret --data-file=-

# Restart services to pick up new secret
gcloud run services update brainspark-api --no-traffic
gcloud run services update-traffic brainspark-api --to-latest
```

---

## 4. Emergency Contacts

| Role | Contact | Backup |
|------|---------|--------|
| On-Call Engineer | PagerDuty | |
| Engineering Manager | [Phone] | [Email] |
| GCP Support | support.google.com | |
| Anthropic Support | support@anthropic.com | |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-15 | BrainSpark Team | Initial document |
