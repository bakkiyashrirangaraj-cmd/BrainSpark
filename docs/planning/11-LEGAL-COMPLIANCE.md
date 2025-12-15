# BrainSpark - Legal & Compliance Document

## Document Purpose

This document outlines all legal requirements, compliance frameworks, and policy templates for BrainSpark, with special emphasis on children's privacy regulations (COPPA, GDPR-K).

---

## Table of Contents

1. [Regulatory Framework](#1-regulatory-framework)
2. [COPPA Compliance](#2-coppa-compliance)
3. [GDPR Compliance](#3-gdpr-compliance)
4. [Privacy Policy](#4-privacy-policy)
5. [Terms of Service](#5-terms-of-service)
6. [Data Processing Agreement](#6-data-processing-agreement)
7. [Cookie Policy](#7-cookie-policy)
8. [Parental Consent Framework](#8-parental-consent-framework)
9. [Data Retention & Deletion](#9-data-retention--deletion)
10. [Compliance Checklist](#10-compliance-checklist)

---

## 1. Regulatory Framework

### 1.1 Applicable Regulations

| Regulation | Jurisdiction | Applicability | Key Requirements |
|------------|--------------|---------------|------------------|
| **COPPA** | United States | Children under 13 | Verifiable parental consent |
| **GDPR** | European Union | All EU users | Data protection, consent, rights |
| **GDPR-K** | EU (Children) | Children under 16 | Parental consent for under-16 |
| **CCPA/CPRA** | California | CA residents | Data rights, opt-out |
| **LGPD** | Brazil | Brazilian users | Similar to GDPR |
| **PIPEDA** | Canada | Canadian users | Consent, access rights |

### 1.2 Compliance Priority

```
┌─────────────────────────────────────────────────────────────┐
│                    Compliance Priority                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TIER 1 (MVP Launch - Required)                             │
│  ├── COPPA (US children under 13)                           │
│  ├── GDPR (EU users)                                        │
│  └── Basic Terms of Service & Privacy Policy                │
│                                                              │
│  TIER 2 (Post-Launch - 3 months)                            │
│  ├── CCPA/CPRA (California)                                 │
│  ├── UK-GDPR (Post-Brexit UK)                               │
│  └── Enhanced cookie consent                                 │
│                                                              │
│  TIER 3 (International Expansion)                           │
│  ├── LGPD (Brazil)                                          │
│  ├── PIPEDA (Canada)                                        │
│  └── Local regulations as needed                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. COPPA Compliance

### 2.1 COPPA Requirements Overview

The Children's Online Privacy Protection Act (COPPA) applies to:
- Websites/apps directed at children under 13
- Websites/apps with actual knowledge of child users under 13

**BrainSpark is DIRECTLY targeted at children, making COPPA compliance mandatory.**

### 2.2 Key COPPA Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Verifiable Parental Consent** | Required before collecting any child data |
| **Privacy Policy** | Must be clear, prominent, and child-focused |
| **Data Minimization** | Collect only what's necessary |
| **Data Security** | Reasonable security measures required |
| **Parental Access** | Parents can review/delete child data |
| **Data Retention Limits** | Only keep data as long as necessary |
| **Third-Party Restrictions** | Cannot share child data without consent |

### 2.3 Verifiable Parental Consent Methods

| Method | Description | Reliability | Implementation |
|--------|-------------|-------------|----------------|
| **Credit Card Transaction** | Small charge ($0.50-$1.00) | High | Stripe integration |
| **Government ID Verification** | Upload/verify ID | High | Third-party service |
| **Knowledge-Based Verification** | Questions only parent would know | Medium | Custom implementation |
| **Video Conference** | Live video call | High | Resource-intensive |
| **Signed Consent Form** | Physical/electronic signature | High | DocuSign integration |
| **Email Plus** | Email confirmation + additional step | Medium | Email + phone verification |

**BrainSpark Implementation: Email Plus with Credit Card fallback**

### 2.4 COPPA Consent Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    COPPA Consent Flow                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. PARENT REGISTRATION                                          │
│     ├── Parent creates account (email/password)                  │
│     ├── Parent provides own information                          │
│     └── System flags account as "pending consent"                │
│                                                                  │
│  2. CHILD PROFILE CREATION ATTEMPT                               │
│     ├── Parent enters child's name and birth date                │
│     ├── System detects child under 13                            │
│     └── COPPA consent flow triggered                             │
│                                                                  │
│  3. CONSENT DISCLOSURE                                           │
│     ├── Display what data will be collected                      │
│     ├── Display how data will be used                            │
│     ├── Display third-party sharing (if any)                     │
│     └── Display parental rights                                  │
│                                                                  │
│  4. VERIFICATION (Email Plus)                                    │
│     ├── Send verification email to parent                        │
│     ├── Parent clicks link in email                              │
│     ├── Parent enters verification code sent via SMS             │
│     └── Parent confirms consent on web page                      │
│                                                                  │
│  5. CONSENT RECORDED                                             │
│     ├── Store consent timestamp                                  │
│     ├── Store consent version                                    │
│     ├── Store verification method                                │
│     ├── Store IP address (for audit)                             │
│     └── Enable child profile                                     │
│                                                                  │
│  6. ONGOING COMPLIANCE                                           │
│     ├── Re-consent if policy changes                             │
│     ├── Annual consent renewal reminder                          │
│     └── Parent can revoke consent anytime                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Data Collection Disclosure

**Data We Collect From Children:**

| Data Type | Purpose | Retention | Shared? |
|-----------|---------|-----------|---------|
| First Name | Personalization | Until deletion | No |
| Birth Date | Age-appropriate content | Until deletion | No |
| Conversation History | Learning progress | 2 years | No |
| Progress Data | Track achievements | Until deletion | No |
| Usage Time | Parental controls | 1 year | No |

**Data We Do NOT Collect From Children:**
- Last name
- Physical address
- Phone number
- Email address
- School name
- Photos
- Location data
- Social media accounts
- Friends lists

### 2.6 Parental Rights Implementation

```python
# API Endpoints for Parental Rights

# View child's data
GET /v1/parents/children/{child_id}/data
Authorization: Bearer <parent_token>
Response: {
    "profile": { ... },
    "conversations": [ ... ],
    "progress": { ... },
    "rewards": [ ... ]
}

# Delete child's data
DELETE /v1/parents/children/{child_id}/data
Authorization: Bearer <parent_token>
Response: {
    "deleted": true,
    "deletion_date": "2024-12-15T10:00:00Z"
}

# Export child's data (machine-readable)
GET /v1/parents/children/{child_id}/export
Authorization: Bearer <parent_token>
Response: {
    "download_url": "https://...",
    "expires_at": "2024-12-15T11:00:00Z",
    "format": "json"
}

# Revoke consent
POST /v1/parents/children/{child_id}/revoke-consent
Authorization: Bearer <parent_token>
Response: {
    "consent_revoked": true,
    "child_deactivated": true,
    "data_deletion_scheduled": "2024-12-22T10:00:00Z"
}
```

---

## 3. GDPR Compliance

### 3.1 GDPR Principles

| Principle | Implementation |
|-----------|----------------|
| **Lawfulness** | Consent-based processing |
| **Purpose Limitation** | Data used only for stated purposes |
| **Data Minimization** | Collect only necessary data |
| **Accuracy** | Allow users to correct data |
| **Storage Limitation** | Defined retention periods |
| **Integrity & Confidentiality** | Encryption, access controls |
| **Accountability** | Documentation, DPO, audits |

### 3.2 Legal Basis for Processing

| Data Processing Activity | Legal Basis | Notes |
|-------------------------|-------------|-------|
| Parent account | Contract | Necessary for service |
| Child profile | Consent | Parental consent required |
| Conversation history | Consent | Essential for service |
| Progress tracking | Legitimate Interest | Core service functionality |
| Analytics (anonymized) | Legitimate Interest | Service improvement |
| Marketing emails | Consent | Opt-in only |

### 3.3 GDPR Rights Implementation

| Right | Implementation | Response Time |
|-------|----------------|---------------|
| **Access** | Dashboard + API export | 30 days |
| **Rectification** | Profile editing | Immediate |
| **Erasure** | Delete account option | 30 days |
| **Data Portability** | JSON/CSV export | 30 days |
| **Restriction** | Pause processing option | Immediate |
| **Objection** | Opt-out mechanisms | Immediate |
| **Automated Decisions** | Human review option | 72 hours |

### 3.4 Data Processing Records

```yaml
# GDPR Article 30 - Records of Processing Activities

record:
  controller:
    name: BrainSpark Inc.
    address: [Company Address]
    contact: privacy@brainspark.app
    dpo: dpo@brainspark.app

  processing_activities:
    - name: User Authentication
      purpose: Account access and security
      data_subjects: Parents, Children
      data_categories: Email, password hash, tokens
      recipients: None
      transfers: None
      retention: Account lifetime + 30 days
      security: Encryption, access controls

    - name: Learning Progress
      purpose: Track educational progress
      data_subjects: Children
      data_categories: Conversations, topic progress, achievements
      recipients: None
      transfers: None
      retention: 2 years
      security: Encryption, pseudonymization

    - name: AI Conversation Processing
      purpose: Generate educational responses
      data_subjects: Children
      data_categories: Conversation content
      recipients: Anthropic (AI provider)
      transfers: US (Standard Contractual Clauses)
      retention: Session only (not stored by processor)
      security: Encryption in transit, no persistent storage
```

---

## 4. Privacy Policy

### 4.1 Privacy Policy Template

```markdown
# BrainSpark Privacy Policy

**Last Updated: [Date]**
**Effective Date: [Date]**

## Introduction

BrainSpark ("we," "our," or "us") is committed to protecting the privacy of
children who use our application. This Privacy Policy explains how we collect,
use, and protect information, with special attention to children under 13.

**This application is designed for children. We comply with the Children's
Online Privacy Protection Act (COPPA) and the General Data Protection
Regulation (GDPR).**

---

## Information We Collect

### Information Collected from Parents

| Information | Purpose | Required |
|-------------|---------|----------|
| Email address | Account access, notifications | Yes |
| Password | Account security | Yes |
| Payment information | Subscription (processed by Stripe) | For premium |
| Timezone | Scheduling features | No |

### Information Collected from Children

| Information | Purpose | Required |
|-------------|---------|----------|
| First name | Personalization | Yes |
| Birth date | Age-appropriate content | Yes |
| Avatar selection | Profile customization | No |
| Interests | Content personalization | No |
| Conversation history | Learning progress | Automatic |
| Progress data | Track achievements | Automatic |
| Usage time | Parental controls | Automatic |

### Information We Do NOT Collect from Children

- Last name
- Home address
- Phone number
- Email address
- School name
- Photos or videos
- Location data
- Social media information
- Information about friends or family members

---

## How We Use Information

### For Parents
- Create and manage accounts
- Process payments
- Send service notifications
- Provide customer support
- Send marketing (with consent only)

### For Children
- Personalize the learning experience
- Provide age-appropriate content
- Track progress and achievements
- Enable parental monitoring
- Improve our service (anonymized data only)

---

## How We Share Information

### We Do NOT:
- Sell personal information
- Share children's data for advertising
- Allow third-party advertising in our app
- Share data with social networks

### We DO Share With:
- **Anthropic (Claude AI)**: Processes conversation content to generate responses.
  Data is not stored by Anthropic and is transmitted securely.
- **Stripe**: Processes parent payment information. We never see full card numbers.
- **Service Providers**: Hosting (Google Cloud), email (SendGrid) - under strict
  data processing agreements.

---

## Parental Consent

Before we collect any information from a child under 13, we require verifiable
parental consent. Our consent process:

1. Parent creates an account with their own information
2. When adding a child, parent is shown what data we collect
3. Parent verifies identity through email + phone verification
4. Consent is recorded with timestamp and verification method

### Parental Rights

As a parent, you have the right to:
- **Review** your child's information
- **Delete** your child's information
- **Refuse** further collection
- **Withdraw** consent at any time

To exercise these rights:
- Use the Parent Dashboard in the app
- Email us at privacy@brainspark.app
- Write to us at [Physical Address]

We will respond to requests within 30 days.

---

## Data Security

We protect children's information using:
- Encryption in transit (TLS 1.3)
- Encryption at rest (AES-256)
- Access controls and authentication
- Regular security audits
- Employee training on children's privacy

---

## Data Retention

| Data Type | Retention Period |
|-----------|-----------------|
| Parent account | Until deletion requested |
| Child profile | Until parent deletes or consent revoked |
| Conversation history | 2 years, then anonymized |
| Progress data | Until child profile deleted |
| Payment records | As required by law (typically 7 years) |

When data is deleted:
- Active data is removed within 30 days
- Backup data is removed within 90 days
- Anonymized data may be retained for analytics

---

## Your Choices

### Parents Can:
- Access and download child's data
- Correct inaccurate information
- Delete child's account and data
- Opt out of marketing communications
- Set usage limits and restrictions

### How to Contact Us

**Privacy Questions:**
Email: privacy@brainspark.app

**Data Protection Officer:**
Email: dpo@brainspark.app

**Mail:**
BrainSpark Inc.
Attn: Privacy Team
[Physical Address]

---

## Changes to This Policy

We may update this policy from time to time. For material changes affecting
children's data, we will:
- Notify parents by email
- Request new consent if required
- Post notice in the app

---

## Additional Rights by Region

### California Residents (CCPA/CPRA)
You have additional rights including the right to know, delete, and opt out of
sale (though we never sell data). Contact us to exercise these rights.

### European Union Residents (GDPR)
You have rights including access, rectification, erasure, restriction,
portability, and objection. You may also lodge a complaint with your local
data protection authority.

---

**Contact Us**

If you have questions about this Privacy Policy or our privacy practices,
please contact us at privacy@brainspark.app.

```

---

## 5. Terms of Service

### 5.1 Terms of Service Template

```markdown
# BrainSpark Terms of Service

**Last Updated: [Date]**
**Effective Date: [Date]**

## 1. Acceptance of Terms

By creating an account or using BrainSpark ("Service"), you agree to these
Terms of Service ("Terms"). If you are a parent or guardian creating an
account for a child, you agree on behalf of yourself and your child.

## 2. Eligibility

- Parents/guardians must be at least 18 years old
- Children must be between 4 and 14 years old
- Children under 13 require verified parental consent
- The Service is available in [list of countries]

## 3. Account Registration

### Parent Accounts
- You must provide accurate information
- You are responsible for maintaining account security
- You must not share your account credentials
- You must notify us of unauthorized access

### Child Profiles
- Only parents/guardians may create child profiles
- You must provide accurate age information
- You are responsible for your child's use of the Service
- You consent to our collection and use of child data as described in our
  Privacy Policy

## 4. Subscription and Payments

### Free Tier
- Limited features available at no cost
- May include usage limits
- May be discontinued with notice

### Premium Subscription
- Monthly or annual billing
- Automatic renewal unless canceled
- Cancel anytime through account settings
- No refunds for partial periods
- Price changes with 30 days notice

## 5. Acceptable Use

### You Agree NOT To:
- Use the Service for any illegal purpose
- Attempt to access other users' accounts
- Interfere with the Service's operation
- Reverse engineer the Service
- Use automated systems to access the Service
- Upload malicious content
- Impersonate others
- Collect user information

### Children Must NOT:
- Share personal information in conversations
- Use inappropriate language
- Attempt to circumvent safety features

## 6. Content and Intellectual Property

### Our Content
- The Service, including AI-generated content, is our property
- You may not copy, modify, or distribute our content
- All trademarks are our property

### User Content
- You retain rights to content you create
- You grant us license to use content to provide the Service
- We may remove content that violates these Terms
- Conversation data is used to improve the Service (anonymized)

### AI-Generated Content
- AI responses are generated automatically
- We do not guarantee accuracy of AI responses
- AI content is for educational purposes only
- Not a substitute for professional advice

## 7. Privacy

Our collection and use of information is governed by our Privacy Policy,
which is incorporated into these Terms.

## 8. Safety

We implement safety measures including:
- Content filtering
- PII detection
- Human review of flagged content
- Parental controls

However, no system is perfect. Parents should:
- Monitor children's usage
- Review conversation history
- Discuss internet safety with children

## 9. Disclaimers

THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.

We do not warrant that:
- The Service will be uninterrupted
- The Service will be error-free
- AI responses will be accurate
- The Service will meet your requirements

## 10. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW:

- We are not liable for indirect, incidental, or consequential damages
- Our total liability is limited to the amount you paid us in the past 12 months
- These limitations apply regardless of the theory of liability

## 11. Indemnification

You agree to indemnify us against claims arising from:
- Your violation of these Terms
- Your use of the Service
- Content you submit
- Your violation of others' rights

## 12. Termination

### By You
- Cancel subscription anytime
- Delete account through settings
- Request data deletion per Privacy Policy

### By Us
- We may terminate for Terms violations
- We may terminate with 30 days notice for any reason
- We may immediately terminate for serious violations

### Effect of Termination
- Access to Service ends
- Data deleted per retention policy
- Applicable Terms survive termination

## 13. Dispute Resolution

### Informal Resolution
Contact support@brainspark.app first. We'll try to resolve disputes informally.

### Arbitration
Disputes not resolved informally will be settled by binding arbitration under
[Arbitration Association] rules. Class actions are waived.

### Exceptions
You may bring claims in small claims court. Either party may seek injunctive
relief for intellectual property violations.

## 14. General Terms

- **Entire Agreement**: These Terms are the complete agreement
- **Severability**: Invalid provisions won't affect other provisions
- **No Waiver**: Failure to enforce isn't a waiver
- **Assignment**: We may assign these Terms; you may not
- **Governing Law**: [State/Country] law applies
- **Changes**: We may modify Terms with notice

## 15. Contact

BrainSpark Inc.
[Physical Address]
Email: legal@brainspark.app

```

---

## 6. Data Processing Agreement

### 6.1 DPA Template (for B2B/Schools)

```markdown
# Data Processing Agreement

This Data Processing Agreement ("DPA") is entered into between:

**Data Controller**: [Customer Name] ("Controller")
**Data Processor**: BrainSpark Inc. ("Processor")

## 1. Definitions

- "Personal Data" means any information relating to an identified or
  identifiable natural person
- "Processing" means any operation performed on Personal Data
- "Sub-processor" means any processor engaged by the Processor

## 2. Scope and Purpose

Processor will process Personal Data only:
- On documented instructions from Controller
- To provide the BrainSpark educational service
- As required by applicable law

## 3. Data Processing Details

| Element | Description |
|---------|-------------|
| Subject Matter | Educational AI companion service |
| Duration | Term of service agreement |
| Nature | Collection, storage, AI processing |
| Purpose | Provide personalized learning experience |
| Data Types | Child name, age, conversations, progress |
| Data Subjects | Children (students), parents |

## 4. Processor Obligations

Processor shall:
- Process data only on Controller's instructions
- Ensure personnel are bound by confidentiality
- Implement appropriate security measures
- Assist Controller with data subject requests
- Delete or return data at end of services
- Make available information for audits
- Notify Controller of data breaches within 72 hours

## 5. Sub-processors

Current sub-processors:
- Google Cloud Platform (hosting)
- Anthropic (AI processing)
- SendGrid (email)
- Stripe (payments)

Processor will notify Controller of sub-processor changes.

## 6. International Transfers

For transfers outside EEA:
- Standard Contractual Clauses apply
- Processor ensures adequate protections

## 7. Security Measures

Processor implements:
- Encryption (transit and rest)
- Access controls
- Regular security testing
- Incident response procedures
- Employee training

## 8. Audit Rights

Controller may audit Processor's compliance:
- With reasonable notice
- During business hours
- At Controller's expense
- Subject to confidentiality

## 9. Liability

[Standard liability provisions]

## 10. Term and Termination

This DPA terminates when:
- Service agreement terminates
- Processing is no longer required

Upon termination, Processor will delete Personal Data within 90 days.

---

**Signatures**

Controller: ___________________ Date: ___________

Processor: ___________________ Date: ___________
```

---

## 7. Cookie Policy

### 7.1 Cookie Policy Template

```markdown
# BrainSpark Cookie Policy

**Last Updated: [Date]**

## What Are Cookies?

Cookies are small text files stored on your device when you use our Service.

## Cookies We Use

### Essential Cookies (Always Active)

| Cookie | Purpose | Duration |
|--------|---------|----------|
| session_id | Maintain login session | Session |
| csrf_token | Security protection | Session |
| child_profile | Remember active child | Session |

### Functional Cookies (With Consent)

| Cookie | Purpose | Duration |
|--------|---------|----------|
| preferences | Remember settings | 1 year |
| theme | Remember UI theme | 1 year |
| language | Remember language | 1 year |

### Analytics Cookies (With Consent)

| Cookie | Purpose | Duration |
|--------|---------|----------|
| _ga | Google Analytics | 2 years |
| _gid | Google Analytics | 24 hours |

**Note: We do NOT use advertising cookies or tracking cookies for children.**

## Managing Cookies

### In Our App
Use Settings > Privacy > Cookie Preferences

### In Your Browser
- Chrome: Settings > Privacy > Cookies
- Safari: Preferences > Privacy
- Firefox: Options > Privacy

## Changes

We may update this policy. Check this page for the latest version.

## Contact

privacy@brainspark.app
```

---

## 8. Parental Consent Framework

### 8.1 Consent Collection UI

```yaml
consent_screen:
  title: "Parental Consent Required"

  introduction: |
    Before your child can use BrainSpark, we need your consent to collect
    certain information. Please read carefully.

  sections:
    - title: "What We Collect"
      items:
        - "Your child's first name (for personalization)"
        - "Your child's birth date (for age-appropriate content)"
        - "Conversation history (for learning progress)"
        - "Achievement and progress data"
        - "Time spent in app"

    - title: "How We Use It"
      items:
        - "Personalize the learning experience"
        - "Show age-appropriate content"
        - "Track educational progress"
        - "Enable your parental controls"

    - title: "What We DON'T Do"
      items:
        - "We never sell your child's data"
        - "We don't show ads to children"
        - "We don't share data for marketing"
        - "We don't collect more than necessary"

    - title: "Your Rights"
      items:
        - "Review your child's data anytime"
        - "Delete your child's data anytime"
        - "Withdraw consent anytime"
        - "Contact us with questions"

  verification:
    method: "email_plus_sms"
    steps:
      - "Check your email for a verification link"
      - "Click the link and enter the code sent to your phone"
      - "Confirm your consent"

  checkboxes:
    - id: "understand_collection"
      required: true
      text: "I understand what information will be collected from my child"

    - id: "consent_collection"
      required: true
      text: "I consent to BrainSpark collecting this information"

    - id: "understand_rights"
      required: true
      text: "I understand I can review and delete my child's data at any time"

    - id: "am_parent"
      required: true
      text: "I confirm I am the parent or legal guardian of this child"

  buttons:
    primary: "Verify & Consent"
    secondary: "Cancel"
    link: "Read Full Privacy Policy"
```

### 8.2 Consent Database Schema

```sql
CREATE TABLE parental_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    parent_id UUID NOT NULL REFERENCES parents(id),
    child_id UUID NOT NULL REFERENCES children(id),

    -- Consent Details
    consent_version VARCHAR(20) NOT NULL,  -- e.g., "1.0", "1.1"
    policy_version VARCHAR(20) NOT NULL,   -- Privacy policy version

    -- Verification
    verification_method VARCHAR(50) NOT NULL,
    verification_completed_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,

    -- Audit Trail
    ip_address INET,
    user_agent TEXT,
    consent_text_hash VARCHAR(64),  -- SHA-256 of consent text shown

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT consent_status_check CHECK (
        status IN ('pending', 'granted', 'revoked', 'expired')
    )
);

CREATE INDEX idx_consents_parent ON parental_consents(parent_id);
CREATE INDEX idx_consents_child ON parental_consents(child_id);
CREATE INDEX idx_consents_status ON parental_consents(status);
```

---

## 9. Data Retention & Deletion

### 9.1 Retention Schedule

| Data Category | Retention Period | After Retention |
|---------------|-----------------|-----------------|
| Parent account | Until deletion | Anonymize |
| Child profile | Until deletion | Delete |
| Conversation history | 2 years | Anonymize |
| Progress data | Until profile deletion | Delete |
| Consent records | 7 years (legal req.) | Archive |
| Payment records | 7 years (legal req.) | Archive |
| Support tickets | 3 years | Anonymize |
| Server logs | 90 days | Delete |
| Analytics (anon.) | Indefinite | N/A |

### 9.2 Deletion Process

```python
# Data Deletion Workflow

class DataDeletionService:
    """
    Handles GDPR/COPPA data deletion requests.
    """

    async def delete_child_data(
        self,
        child_id: str,
        requested_by: str,  # parent_id
        reason: str
    ) -> DeletionResult:
        """
        Delete all data associated with a child.
        """
        # 1. Verify requester is parent
        await self.verify_parent_authorization(requested_by, child_id)

        # 2. Create deletion record
        deletion = await self.create_deletion_record(
            child_id=child_id,
            requested_by=requested_by,
            reason=reason
        )

        # 3. Immediate actions
        await self.deactivate_child_profile(child_id)
        await self.revoke_active_sessions(child_id)

        # 4. Queue data deletion jobs
        await self.queue_deletion_jobs([
            DeleteConversationsJob(child_id),
            DeleteProgressJob(child_id),
            DeleteRewardsJob(child_id),
            DeleteFromCacheJob(child_id),
            DeleteFromBackupsJob(child_id, delay_days=90),
        ])

        # 5. Notify AI provider (if applicable)
        await self.notify_processors(child_id)

        # 6. Send confirmation
        await self.send_deletion_confirmation(requested_by, child_id)

        return DeletionResult(
            status="scheduled",
            active_deletion_date=datetime.utcnow() + timedelta(days=30),
            backup_deletion_date=datetime.utcnow() + timedelta(days=90),
            confirmation_sent=True
        )

    async def execute_deletion(self, deletion_id: str):
        """
        Actually delete the data (called by scheduled job).
        """
        deletion = await self.get_deletion_record(deletion_id)

        # Delete from primary database
        await self.db.execute(
            "DELETE FROM messages WHERE conversation_id IN "
            "(SELECT id FROM conversations WHERE child_id = $1)",
            deletion.child_id
        )
        await self.db.execute(
            "DELETE FROM conversations WHERE child_id = $1",
            deletion.child_id
        )
        await self.db.execute(
            "DELETE FROM progress WHERE child_id = $1",
            deletion.child_id
        )
        await self.db.execute(
            "DELETE FROM rewards WHERE child_id = $1",
            deletion.child_id
        )
        await self.db.execute(
            "DELETE FROM streaks WHERE child_id = $1",
            deletion.child_id
        )
        await self.db.execute(
            "DELETE FROM children WHERE id = $1",
            deletion.child_id
        )

        # Update deletion record
        await self.mark_deletion_complete(deletion_id)
```

---

## 10. Compliance Checklist

### 10.1 Pre-Launch Compliance Checklist

```markdown
## COPPA Compliance Checklist

### Privacy Policy
- [ ] Privacy policy is clear and comprehensive
- [ ] Policy specifically addresses children's data
- [ ] Policy is prominently linked from all data collection points
- [ ] Policy describes data collected, used, and shared
- [ ] Policy describes parental rights
- [ ] Policy includes contact information

### Parental Consent
- [ ] Consent obtained BEFORE collecting child data
- [ ] Consent method is verifiable (Email Plus or better)
- [ ] Consent includes clear description of data practices
- [ ] Parents can refuse consent
- [ ] Consent records are maintained

### Parental Rights
- [ ] Parents can review child's data
- [ ] Parents can delete child's data
- [ ] Parents can revoke consent
- [ ] Response time is within 30 days
- [ ] Process is documented

### Data Practices
- [ ] Only necessary data is collected
- [ ] Data is not used for behavioral advertising
- [ ] Data is not sold to third parties
- [ ] Data is securely stored
- [ ] Data retention is limited

### Third Parties
- [ ] No third-party advertising
- [ ] Third-party processors have DPAs
- [ ] Third parties comply with COPPA
- [ ] Third-party list is disclosed

---

## GDPR Compliance Checklist

### Legal Basis
- [ ] Legal basis identified for each processing activity
- [ ] Consent is freely given, specific, informed, unambiguous
- [ ] Consent can be withdrawn easily
- [ ] Records of consent maintained

### Privacy Information
- [ ] Privacy notice provided at data collection
- [ ] Notice is clear and accessible
- [ ] All required information included
- [ ] Layered approach for complex information

### Data Subject Rights
- [ ] Process for access requests
- [ ] Process for rectification
- [ ] Process for erasure
- [ ] Process for restriction
- [ ] Process for portability
- [ ] Process for objection
- [ ] Response within 30 days

### Security
- [ ] Appropriate technical measures
- [ ] Appropriate organizational measures
- [ ] Breach detection procedures
- [ ] Breach notification procedures (72 hours)

### Accountability
- [ ] Data Protection Officer (if required)
- [ ] Records of processing activities
- [ ] Data Protection Impact Assessment (if required)
- [ ] Processor agreements in place

### International Transfers
- [ ] Legal mechanism for transfers (SCCs)
- [ ] Transfer impact assessment
- [ ] Supplementary measures if needed
```

### 10.2 Ongoing Compliance Tasks

| Task | Frequency | Owner |
|------|-----------|-------|
| Review privacy policy | Quarterly | Legal |
| Review consent flow | Quarterly | Product |
| Security audit | Annually | Security |
| Penetration test | Annually | Security |
| Staff training | Annually | HR |
| Processor audit | Annually | Legal |
| Retention cleanup | Monthly | Engineering |
| Access request report | Monthly | Support |
| Consent analytics | Monthly | Product |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-15 | BrainSpark Team | Initial document |

---

*Previous Document: [10-CONTENT-LIBRARY.md](./10-CONTENT-LIBRARY.md)*
*Next Document: [12-LAUNCH-CHECKLIST.md](./12-LAUNCH-CHECKLIST.md)*
