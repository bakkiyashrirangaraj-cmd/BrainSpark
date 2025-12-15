# BrainSpark - Support Playbook

## Document Purpose

Comprehensive guide for customer support operations including issue handling, escalation procedures, response templates, and support metrics.

---

## 1. Support Overview

### 1.1 Support Channels

| Channel | Hours | Response Target | Staffing |
|---------|-------|-----------------|----------|
| Email (support@brainspark.app) | 24/7 | < 24 hours | Tier 1 |
| In-App Chat | 6 AM - 10 PM PST | < 5 minutes | Tier 1 |
| Help Center | 24/7 (self-service) | Immediate | N/A |
| Phone (Premium) | 9 AM - 6 PM PST | < 2 minutes | Tier 2 |
| Social Media | 8 AM - 8 PM PST | < 2 hours | Community |

### 1.2 Support Tiers

| Tier | Scope | Skills Required |
|------|-------|-----------------|
| **Tier 1** | General inquiries, account issues, billing, basic troubleshooting | Product knowledge, empathy, communication |
| **Tier 2** | Technical issues, complex account problems, escalated complaints | Technical aptitude, advanced product knowledge |
| **Tier 3** | Engineering issues, data requests, security concerns | Engineering background, database access |
| **Executive** | Legal, PR crises, high-value accounts | Senior leadership, legal knowledge |

### 1.3 Priority Matrix

| Priority | Description | First Response | Resolution Target |
|----------|-------------|----------------|-------------------|
| **P1 - Critical** | Service outage, security breach, child safety | 15 minutes | 2 hours |
| **P2 - High** | Payment failure, account locked, major bug | 1 hour | 24 hours |
| **P3 - Medium** | Feature not working, sync issues, billing questions | 4 hours | 48 hours |
| **P4 - Low** | Feature requests, general questions, feedback | 24 hours | 5 business days |

---

## 2. Common Issues & Resolution

### 2.1 Account Issues

#### 2.1.1 Can't Log In

**Symptoms:** User unable to access account

**Troubleshooting Steps:**
1. Verify email address is correct (check for typos)
2. Check if account exists in admin panel
3. Verify auth provider (Google/Apple/Email)
4. Check for account lock (too many failed attempts)
5. Verify email is verified

**Solutions:**
| Cause | Solution |
|-------|----------|
| Wrong email | Help user locate correct email |
| Account locked | Unlock in admin panel (15-minute cooldown) |
| Email not verified | Resend verification email |
| Password forgotten | Send password reset link |
| OAuth issue | Clear browser cache, try different browser |

**Response Template:**
```
Hi {{name}},

I'm sorry you're having trouble logging in! Let me help you get back to learning.

[If email issue]
I've checked our records and found your account is registered with {{correct_email}}. Please try logging in with that email address.

[If locked]
Your account was temporarily locked due to multiple login attempts. I've unlocked it for you—please try again now.

[If verification needed]
I've just sent a new verification email to {{email}}. Please check your inbox (and spam folder) and click the verification link.

Let me know if you're still having trouble!

Best,
{{agent_name}}
BrainSpark Support
```

#### 2.1.2 Email Already in Use

**Symptoms:** User can't create account because email is registered

**Solutions:**
1. User may have forgotten they created account → Send password reset
2. OAuth account exists → Guide to use Google/Apple login
3. Typo during original registration → Verify, then merge/correct in admin

#### 2.1.3 Child Profile Issues

**Symptoms:** Can't add child, child profile incorrect, wrong age group

**Solutions:**
| Issue | Solution |
|-------|----------|
| Can't add child | Check subscription limits, verify consent status |
| Wrong age group | Edit profile in admin panel (maintains progress) |
| Duplicate profile | Merge profiles (requires Tier 2) |
| Profile won't save | Check for validation errors, clear app cache |

---

### 2.2 Subscription & Billing

#### 2.2.1 Payment Failed

**Symptoms:** Subscription payment declined

**Troubleshooting Steps:**
1. Check payment processor error code
2. Verify card hasn't expired
3. Check for fraud flags
4. Verify billing address

**Common Error Codes:**

| Code | Meaning | Action |
|------|---------|--------|
| `card_declined` | Generic decline | Ask user to contact bank |
| `insufficient_funds` | Not enough balance | Suggest different card |
| `expired_card` | Card expired | Update payment method |
| `incorrect_cvc` | Wrong security code | Re-enter card details |
| `processing_error` | Temporary issue | Retry in 24 hours |

**Response Template:**
```
Hi {{name}},

I see your recent payment didn't go through. Here's what I found:

[Include specific, non-sensitive reason]

To resolve this, please:
1. Go to Settings > Subscription > Payment Method
2. Update your card information or add a new payment method
3. Click "Retry Payment"

Your subscription won't be interrupted while you update—you have until {{grace_period_end}} to complete the payment.

Let me know if you need any help!

Best,
{{agent_name}}
```

#### 2.2.2 Refund Requests

**Refund Policy Summary:**
- Within 7 days of purchase: Full refund, no questions
- 8-30 days: Prorated refund, case-by-case
- After 30 days: Generally not refunded, exceptions for service issues

**Refund Authority:**

| Amount | Authority |
|--------|-----------|
| < $20 | Tier 1 |
| $20-100 | Tier 2 |
| > $100 | Tier 2 Manager |
| Disputed/Chargeback | Finance team |

**Refund Response Template:**
```
Hi {{name}},

Thank you for reaching out about a refund.

[If approved]
I've processed a refund of {{amount}} to your original payment method. You should see this within 5-10 business days, depending on your bank.

Your subscription will remain active until {{end_date}}, so {{child_name}} can continue learning until then.

[If partial/prorated]
Based on your subscription start date and our policy, I can offer a prorated refund of {{amount}}. Would you like me to proceed with this?

[If denied]
I understand this may not be the answer you were hoping for. Unfortunately, refunds aren't available for subscriptions over 30 days old. However, I'd love to help resolve whatever issue prompted this request—can you tell me more about what's not working for your family?

Best,
{{agent_name}}
```

#### 2.2.3 Subscription Cancellation

**Retention Steps (in order):**
1. Acknowledge their request respectfully
2. Ask open-ended question about reason
3. Offer relevant solution based on reason
4. If proceeding, process cancellation gracefully

**Retention Offers (Tier 1 Authority):**

| Reason | Offer |
|--------|-------|
| Too expensive | 1 month free or 30% off next 3 months |
| Not using enough | Pause for 1-3 months (free) |
| Child lost interest | Switch age group, suggest new topics |
| Missing features | Log feedback, offer preview of upcoming features |
| Privacy concerns | Explain data practices, offer data export |

**Cancellation Response Template:**
```
Hi {{name}},

I've processed your cancellation request. Here's what happens next:

- Your subscription remains active until {{end_date}}
- {{child_name}}'s progress and achievements are saved
- You won't be charged again unless you resubscribe

If circumstances change, you're always welcome back—and {{child_name}}'s constellation will be waiting!

Thank you for trying BrainSpark. If you have a moment, we'd love to hear your feedback: {{feedback_link}}

Best,
{{agent_name}}
```

---

### 2.3 Technical Issues

#### 2.3.1 App Won't Load / White Screen

**Troubleshooting Steps:**
1. Check service status page
2. Verify internet connection
3. Clear browser cache / app cache
4. Try incognito/private window
5. Try different browser/device
6. Check for JavaScript errors (if user is technical)

**Response Template:**
```
Hi {{name}},

I'm sorry the app isn't loading properly! Let's get this fixed:

**Step 1: Clear your cache**
[Browser-specific instructions]

**Step 2: Try a private/incognito window**
This helps rule out browser extensions.

**Step 3: Check your internet**
Try loading another website to make sure your connection is working.

If none of these help, please let me know:
- What device and browser you're using
- Any error messages you see
- A screenshot if possible

I'll get this sorted for you!

Best,
{{agent_name}}
```

#### 2.3.2 Content Not Loading / Slow

**Troubleshooting Steps:**
1. Check CDN status
2. Verify user's region
3. Test specific content on staging
4. Check for asset loading errors

**If Regional Issue:**
- Escalate to Tier 3 with user's approximate location
- Offer offline mode as temporary workaround

#### 2.3.3 Progress Not Saving

**Troubleshooting Steps:**
1. Check if user is logged in (session expired?)
2. Verify sync status in app
3. Check for error logs in user's session
4. Verify database connectivity (if widespread)

**If Data Lost:**
- Check backup systems for recovery
- Escalate to Tier 3 for database restoration
- Offer compensation (1 month free) for significant loss

---

### 2.4 Content & AI Issues

#### 2.4.1 Inappropriate AI Response

**CRITICAL: Escalate immediately to Tier 2**

**Immediate Actions:**
1. Thank parent for reporting
2. Document the exact conversation (conversation_id)
3. Escalate to content safety team
4. Do NOT dismiss or minimize concern

**Response Template:**
```
Hi {{name}},

Thank you for bringing this to our attention—child safety is our absolute top priority.

I've immediately flagged this conversation for review by our safety team. They will:
- Review the full conversation context
- Update our content filters if needed
- Report back within 24 hours

In the meantime, the conversation has been removed from {{child_name}}'s history.

I sincerely apologize for this experience. We take these reports very seriously and use them to continuously improve our safety measures.

If you'd like to discuss this further, please let me know or call our safety line at {{safety_phone}}.

Best,
{{agent_name}}
```

#### 2.4.2 Content Too Easy/Hard

**Solutions:**
1. Verify child's age group setting is correct
2. Check if interests are set up properly
3. Offer to reset depth level for topic
4. Explain adaptive system (improves with use)

#### 2.4.3 AI Not Responding / Slow

**Troubleshooting:**
1. Check Claude API status
2. Verify rate limits not exceeded
3. Check for network issues
4. Try simpler question to test

---

### 2.5 Privacy & Data Requests

#### 2.5.1 Data Export Request (GDPR/CCPA)

**Response Time:** 30 days (legal requirement)

**Process:**
1. Verify requestor identity
2. Create support ticket with "Data Export" tag
3. Escalate to Tier 3 for processing
4. Generate comprehensive data export
5. Deliver via secure link

**Data Included:**
- Parent account information
- Child profiles (no password hashes)
- All conversation history
- Progress and achievements
- Payment history (no full card numbers)

#### 2.5.2 Account Deletion Request

**COPPA Note:** Parents can request deletion at any time

**Process:**
1. Verify identity (send verification email)
2. Confirm understanding that deletion is permanent
3. Process within 72 hours
4. Send confirmation email

**Response Template:**
```
Hi {{name}},

I've received your request to delete your BrainSpark account.

Before I proceed, I want to confirm you understand:
- All data will be permanently deleted
- This includes all child profiles and their progress
- This cannot be undone

To confirm, please reply with "DELETE MY ACCOUNT" or click this verification link: {{verify_link}}

If you'd prefer to just take a break, I can pause your account instead—your data will be saved, and you won't be charged.

Let me know how you'd like to proceed.

Best,
{{agent_name}}
```

---

## 3. Escalation Procedures

### 3.1 Escalation Triggers

| Situation | Escalate To | Timeframe |
|-----------|-------------|-----------|
| Child safety concern | Tier 2 + Safety Team | Immediate |
| Legal threat/lawyer mention | Executive | Immediate |
| Media inquiry | PR Team | Immediate |
| Security vulnerability report | Security Team | Immediate |
| Payment > $100 | Tier 2 Manager | Same day |
| VIP/Influencer account | Tier 2 | Immediate |
| 3+ contacts for same issue | Tier 2 | On 3rd contact |
| Technical bug (reproducible) | Tier 3 | Within 4 hours |

### 3.2 Escalation Template

When escalating, include:

```
ESCALATION REQUEST

Ticket ID: {{ticket_id}}
Customer: {{name}} ({{email}})
Account Type: {{subscription_type}}
Children: {{child_names}}

ISSUE SUMMARY:
[2-3 sentences describing the issue]

STEPS TAKEN:
1. [What you've already tried]
2. [What you've already tried]

WHY ESCALATING:
[Specific trigger - e.g., "Customer mentioned lawyer"]

RECOMMENDED RESOLUTION:
[Your suggestion if you have one]

URGENCY: [P1/P2/P3/P4]
```

### 3.3 Executive Escalation Contacts

| Role | Contact | Use For |
|------|---------|---------|
| CEO | ceo@brainspark.app | PR crises only |
| CTO | cto@brainspark.app | Critical outages |
| Legal | legal@brainspark.app | Legal threats, DMCA |
| Safety Lead | safety@brainspark.app | Child safety concerns |

---

## 4. Special Handling

### 4.1 VIP Accounts

**VIP Criteria:**
- Influencers (>10K followers)
- Press/Media
- Enterprise accounts
- Known educators/researchers
- Accounts flagged by business development

**VIP Handling:**
- Tag ticket as "VIP" immediately
- Route to Tier 2 automatically
- Response time: < 2 hours
- Keep detailed notes for continuity

### 4.2 Hostile/Abusive Customers

**De-escalation Steps:**
1. Acknowledge their frustration
2. Stay calm and professional
3. Focus on the issue, not the tone
4. Set boundaries if needed

**If Abuse Continues:**
```
"I want to help resolve this for you, and I need to be able to do that in a respectful conversation. I'm going to step away for a few minutes. When I return, let's focus on solving {{specific_issue}}."
```

**If Threats:**
- Document everything
- Escalate to Executive immediately
- Do NOT engage further without guidance

### 4.3 Chargeback/Fraud

**Chargeback Process:**
1. Receive chargeback notification
2. Pull all transaction records
3. Document service provided
4. Submit evidence to payment processor
5. Update customer record

**Fraud Indicators:**
- Multiple accounts same payment method
- Rapid subscription/cancel cycles
- Unusual usage patterns
- Mismatched billing/account info

---

## 5. Support Tools

### 5.1 Admin Panel Functions

| Function | Access | Use |
|----------|--------|-----|
| View account details | All tiers | Look up user info |
| Reset password | Tier 1+ | Help locked out users |
| Unlock account | Tier 1+ | After lockout |
| Change email | Tier 2+ | Verified identity |
| Process refund | See refund limits | Billing issues |
| View conversations | Tier 2+ | Debug AI issues |
| Delete account | Tier 2+ | GDPR requests |
| Merge accounts | Tier 2+ | Duplicate handling |

### 5.2 Diagnostic Tools

```bash
# Check user's recent sessions
support-cli user sessions {{user_id}}

# View error logs for user
support-cli user errors {{user_id}} --last 24h

# Check conversation for safety flags
support-cli conversation review {{conversation_id}}

# Verify subscription status
support-cli user subscription {{user_id}}
```

### 5.3 Canned Responses

| Tag | Use For |
|-----|---------|
| `#greeting` | Opening acknowledgment |
| `#thanks` | Closing with gratitude |
| `#login-help` | Login troubleshooting |
| `#payment-update` | How to update payment |
| `#refund-policy` | Explain refund policy |
| `#data-export` | GDPR export process |
| `#cancel-confirm` | Cancellation confirmation |

---

## 6. Quality & Metrics

### 6.1 Quality Standards

| Metric | Target | Minimum |
|--------|--------|---------|
| First Response Time | < 2 hours | < 4 hours |
| Resolution Time (P3) | < 24 hours | < 48 hours |
| Customer Satisfaction (CSAT) | > 95% | > 90% |
| First Contact Resolution | > 70% | > 60% |
| Quality Score | > 90% | > 85% |

### 6.2 Quality Rubric

Each ticket scored on:

| Criteria | Points | Description |
|----------|--------|-------------|
| Accuracy | 25 | Correct information provided |
| Completeness | 25 | All parts of issue addressed |
| Tone | 20 | Warm, professional, empathetic |
| Efficiency | 15 | Resolved in minimal exchanges |
| Documentation | 15 | Proper notes and tags |

### 6.3 CSAT Survey

Sent after ticket resolution:

```
How would you rate your support experience?
⭐ ⭐ ⭐ ⭐ ⭐

What could we have done better?
[Open text]
```

---

## 7. Training & Resources

### 7.1 Required Training

| Training | Frequency | Audience |
|----------|-----------|----------|
| Product Deep Dive | Monthly | All tiers |
| COPPA Compliance | Quarterly | All tiers |
| De-escalation | Quarterly | All tiers |
| Technical Troubleshooting | Monthly | Tier 2+ |
| Safety Response | Monthly | All tiers |

### 7.2 Knowledge Resources

- **Help Center:** help.brainspark.app
- **Internal Wiki:** wiki.brainspark.app/support
- **Slack Channels:**
  - #support-general
  - #support-escalations
  - #support-engineering
  - #support-wins (celebrate!)

### 7.3 Shadowing Program

New agents shadow for 1 week:
- Day 1-2: Observe senior agent
- Day 3-4: Handle tickets with supervisor review
- Day 5: Handle independently with spot-checks

---

## 8. Appendix

### 8.1 Common Abbreviations

| Abbr | Meaning |
|------|---------|
| WC | Wonder Cubs (ages 4-6) |
| CE | Curious Explorers (ages 7-10) |
| MM | Mind Masters (ages 11-14) |
| FCR | First Contact Resolution |
| CSAT | Customer Satisfaction |
| SLA | Service Level Agreement |

### 8.2 Browser Support

| Browser | Supported Versions |
|---------|-------------------|
| Chrome | Last 3 versions |
| Safari | Last 3 versions |
| Firefox | Last 3 versions |
| Edge | Last 3 versions |
| IE | Not supported |

### 8.3 Device Requirements

| Platform | Minimum |
|----------|---------|
| iOS | iOS 14+ |
| Android | Android 8+ |
| Web | Modern browser with JavaScript |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-15 | BrainSpark Team | Initial document |
