# BrainSpark - Email Templates

## Document Purpose

Complete email template specifications for all transactional, marketing, and notification emails.

---

## 1. Email Design System

### 1.1 Brand Guidelines

| Element | Value |
|---------|-------|
| Primary Color | #6366F1 (Indigo) |
| Secondary Color | #F59E0B (Amber) |
| Background | #FFFFFF |
| Text Primary | #1F2937 |
| Text Secondary | #6B7280 |
| Font Family | Inter, system-ui, sans-serif |
| Logo Width | 150px |
| Max Width | 600px |

### 1.2 Base Template Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    /* Reset styles */
    body { margin: 0; padding: 0; font-family: Inter, system-ui, sans-serif; }
    table { border-collapse: collapse; }
    img { max-width: 100%; height: auto; }

    /* Main container */
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; }
    .header { background: linear-gradient(135deg, #6366F1, #8B5CF6); padding: 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .footer { background: #F3F4F6; padding: 20px 30px; text-align: center; font-size: 12px; color: #6B7280; }

    /* Typography */
    h1 { color: #1F2937; font-size: 24px; margin-bottom: 20px; }
    p { color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 16px; }

    /* Buttons */
    .btn-primary { display: inline-block; background: #6366F1; color: #FFFFFF; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .btn-secondary { display: inline-block; background: #F59E0B; color: #FFFFFF; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{logo_url}}" alt="BrainSpark" width="150">
    </div>
    <div class="content">
      {{content}}
    </div>
    <div class="footer">
      {{footer}}
    </div>
  </div>
</body>
</html>
```

---

## 2. Authentication Emails

### 2.1 Welcome Email

**Subject:** Welcome to BrainSpark! 🌟 Let's ignite curiosity together

**Trigger:** Parent account creation

**Template Variables:**
- `{{parent_name}}` - Parent's first name
- `{{child_name}}` - First child's name
- `{{age_group}}` - Child's age group
- `{{mascot_name}}` - Age-appropriate mascot

```html
<h1>Welcome to BrainSpark, {{parent_name}}! 🎉</h1>

<p>You've just taken the first step in nurturing {{child_name}}'s curiosity and love of learning. We're thrilled to have your family join the BrainSpark community!</p>

<div style="background: #FEF3C7; border-radius: 12px; padding: 20px; margin: 24px 0;">
  <p style="margin: 0; font-weight: 600; color: #92400E;">🌟 {{child_name}}'s Learning Companion</p>
  <p style="margin: 8px 0 0 0; color: #92400E;">Meet <strong>{{mascot_name}}</strong>, who will guide {{child_name}} through amazing discoveries!</p>
</div>

<h2 style="font-size: 18px; color: #1F2937;">What happens next?</h2>

<ol style="color: #4B5563; line-height: 2;">
  <li>{{child_name}} will receive their first <strong>Daily Brain Spark</strong> tomorrow</li>
  <li>They can explore the <strong>Knowledge Constellation</strong> anytime</li>
  <li>Watch their understanding grow deeper with every "why" question</li>
</ol>

<p style="text-align: center; margin-top: 30px;">
  <a href="{{app_url}}" class="btn-primary">Start Exploring</a>
</p>

<p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
  <strong>Tip for parents:</strong> Check the Parent Dashboard to see {{child_name}}'s progress and discoveries!
</p>
```

### 2.2 Email Verification

**Subject:** Verify your BrainSpark email address

**Trigger:** Account creation or email change

```html
<h1>Verify Your Email Address</h1>

<p>Hi {{parent_name}},</p>

<p>Please verify your email address to complete your BrainSpark account setup. This helps us keep your family's account secure.</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{verification_url}}" class="btn-primary">Verify Email Address</a>
</p>

<p style="font-size: 14px; color: #6B7280;">
  This link will expire in 24 hours. If you didn't create a BrainSpark account, you can safely ignore this email.
</p>

<p style="font-size: 12px; color: #9CA3AF; margin-top: 30px;">
  Button not working? Copy and paste this link into your browser:<br>
  <span style="word-break: break-all;">{{verification_url}}</span>
</p>
```

### 2.3 Password Reset

**Subject:** Reset your BrainSpark password

**Trigger:** Password reset request

```html
<h1>Password Reset Request</h1>

<p>Hi {{parent_name}},</p>

<p>We received a request to reset the password for your BrainSpark account. Click the button below to create a new password:</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{reset_url}}" class="btn-primary">Reset Password</a>
</p>

<p style="font-size: 14px; color: #6B7280;">
  This link will expire in 1 hour for security reasons.
</p>

<div style="background: #FEF2F2; border-radius: 8px; padding: 16px; margin-top: 24px;">
  <p style="margin: 0; font-size: 14px; color: #991B1B;">
    <strong>⚠️ Didn't request this?</strong><br>
    If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
  </p>
</div>
```

### 2.4 Password Changed Confirmation

**Subject:** Your BrainSpark password has been changed

**Trigger:** Successful password change

```html
<h1>Password Changed Successfully</h1>

<p>Hi {{parent_name}},</p>

<p>Your BrainSpark password was successfully changed on {{change_date}} at {{change_time}}.</p>

<div style="background: #ECFDF5; border-radius: 8px; padding: 16px; margin: 24px 0;">
  <p style="margin: 0; font-size: 14px; color: #065F46;">
    ✅ Your account is secure
  </p>
</div>

<p style="font-size: 14px; color: #6B7280;">
  If you didn't make this change, please <a href="{{reset_url}}" style="color: #6366F1;">reset your password immediately</a> and contact our support team.
</p>
```

---

## 3. Parental Consent Emails

### 3.1 Parental Consent Request

**Subject:** Action Required: Verify parental consent for {{child_name}}'s BrainSpark account

**Trigger:** Child profile created (COPPA compliance)

```html
<h1>Parental Consent Required</h1>

<p>Hi {{parent_name}},</p>

<p>To comply with children's privacy laws (COPPA), we need to verify your consent before {{child_name}} can use BrainSpark.</p>

<div style="background: #F3F4F6; border-radius: 12px; padding: 24px; margin: 24px 0;">
  <h3 style="margin-top: 0; color: #1F2937;">What we're asking permission for:</h3>
  <ul style="color: #4B5563; line-height: 1.8;">
    <li>Store {{child_name}}'s learning progress and preferences</li>
    <li>Personalize content based on age and interests</li>
    <li>Send age-appropriate educational content</li>
  </ul>

  <h3 style="color: #1F2937;">What we'll NEVER do:</h3>
  <ul style="color: #4B5563; line-height: 1.8;">
    <li>Share personal information with third parties</li>
    <li>Show advertising to children</li>
    <li>Collect unnecessary personal data</li>
  </ul>
</div>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{consent_url}}" class="btn-primary">Provide Consent</a>
</p>

<p style="font-size: 14px; color: #6B7280;">
  Read our full <a href="{{privacy_url}}" style="color: #6366F1;">Privacy Policy</a> and <a href="{{coppa_url}}" style="color: #6366F1;">Children's Privacy Notice</a>.
</p>
```

### 3.2 Consent Confirmed

**Subject:** ✅ Consent confirmed - {{child_name}} is ready to explore!

**Trigger:** Parental consent verified

```html
<h1>Consent Confirmed! 🎉</h1>

<p>Hi {{parent_name}},</p>

<p>Thank you for verifying your consent. {{child_name}} is now ready to start their learning adventure with BrainSpark!</p>

<div style="background: #ECFDF5; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
  <p style="font-size: 48px; margin: 0;">🌟</p>
  <h3 style="color: #065F46; margin: 12px 0 0 0;">{{child_name}}'s account is active!</h3>
</div>

<h2 style="font-size: 18px; color: #1F2937;">Getting started:</h2>

<ol style="color: #4B5563; line-height: 2;">
  <li>Open BrainSpark on {{child_name}}'s device</li>
  <li>Log in with your parent account</li>
  <li>Select {{child_name}}'s profile</li>
  <li>Start exploring!</li>
</ol>

<p style="text-align: center; margin-top: 30px;">
  <a href="{{app_url}}" class="btn-primary">Open BrainSpark</a>
</p>
```

---

## 4. Progress & Engagement Emails

### 4.1 Weekly Progress Report

**Subject:** {{child_name}}'s Week in Wonder 🌟 | Weekly Progress Report

**Trigger:** Every Sunday at 9 AM (parent's timezone)

```html
<h1>{{child_name}}'s Week in Wonder</h1>

<p>Hi {{parent_name}},</p>

<p>Here's what {{child_name}} discovered this week on BrainSpark!</p>

<!-- Stats Grid -->
<table style="width: 100%; margin: 24px 0;" cellpadding="0" cellspacing="0">
  <tr>
    <td style="width: 50%; padding: 8px;">
      <div style="background: #EEF2FF; border-radius: 12px; padding: 20px; text-align: center;">
        <p style="font-size: 36px; font-weight: 700; color: #4F46E5; margin: 0;">{{sessions_count}}</p>
        <p style="font-size: 14px; color: #6366F1; margin: 8px 0 0 0;">Learning Sessions</p>
      </div>
    </td>
    <td style="width: 50%; padding: 8px;">
      <div style="background: #FEF3C7; border-radius: 12px; padding: 20px; text-align: center;">
        <p style="font-size: 36px; font-weight: 700; color: #D97706; margin: 0;">{{stars_earned}}</p>
        <p style="font-size: 14px; color: #F59E0B; margin: 8px 0 0 0;">Stars Earned</p>
      </div>
    </td>
  </tr>
  <tr>
    <td style="width: 50%; padding: 8px;">
      <div style="background: #ECFDF5; border-radius: 12px; padding: 20px; text-align: center;">
        <p style="font-size: 36px; font-weight: 700; color: #059669; margin: 0;">{{streak_days}}</p>
        <p style="font-size: 14px; color: #10B981; margin: 8px 0 0 0;">Day Streak 🔥</p>
      </div>
    </td>
    <td style="width: 50%; padding: 8px;">
      <div style="background: #FDF2F8; border-radius: 12px; padding: 20px; text-align: center;">
        <p style="font-size: 36px; font-weight: 700; color: #DB2777; margin: 0;">{{questions_asked}}</p>
        <p style="font-size: 14px; color: #EC4899; margin: 8px 0 0 0;">Questions Asked</p>
      </div>
    </td>
  </tr>
</table>

<!-- Topics Explored -->
<h2 style="font-size: 18px; color: #1F2937; margin-top: 32px;">Topics Explored This Week</h2>

{{#each topics}}
<div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
  <div style="width: 40px; height: 40px; background: {{color}}; border-radius: 8px; margin-right: 16px; text-align: center; line-height: 40px; font-size: 20px;">{{icon}}</div>
  <div style="flex: 1;">
    <p style="margin: 0; font-weight: 600; color: #1F2937;">{{name}}</p>
    <p style="margin: 4px 0 0 0; font-size: 14px; color: #6B7280;">Reached depth {{depth}}</p>
  </div>
</div>
{{/each}}

<!-- Achievements -->
{{#if new_badges}}
<h2 style="font-size: 18px; color: #1F2937; margin-top: 32px;">🏆 New Achievements</h2>

{{#each new_badges}}
<div style="background: linear-gradient(135deg, #FEF3C7, #FDE68A); border-radius: 12px; padding: 16px; margin: 12px 0; display: flex; align-items: center;">
  <div style="width: 50px; height: 50px; background: #F59E0B; border-radius: 50%; margin-right: 16px; text-align: center; line-height: 50px; font-size: 24px;">{{icon}}</div>
  <div>
    <p style="margin: 0; font-weight: 600; color: #92400E;">{{name}}</p>
    <p style="margin: 4px 0 0 0; font-size: 14px; color: #A16207;">{{description}}</p>
  </div>
</div>
{{/each}}
{{/if}}

<p style="text-align: center; margin-top: 30px;">
  <a href="{{dashboard_url}}" class="btn-primary">View Full Report</a>
</p>

<p style="font-size: 14px; color: #6B7280; text-align: center; margin-top: 24px;">
  Keep the curiosity going! Tomorrow's Brain Spark is about: <strong>{{tomorrow_topic}}</strong>
</p>
```

### 4.2 Streak Milestone

**Subject:** 🔥 {{child_name}} reached a {{streak_days}}-day streak!

**Trigger:** Streak milestones (3, 7, 14, 30, 50, 100 days)

```html
<div style="text-align: center; padding: 20px 0;">
  <p style="font-size: 72px; margin: 0;">🔥</p>
  <h1 style="font-size: 28px; color: #1F2937;">{{streak_days}}-Day Streak!</h1>
</div>

<p>Hi {{parent_name}},</p>

<p>Amazing news! {{child_name}} has been learning with BrainSpark for <strong>{{streak_days}} days in a row</strong>!</p>

<div style="background: linear-gradient(135deg, #FEF3C7, #FDE68A); border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
  <p style="font-size: 14px; color: #92400E; margin: 0;">UNLOCKED</p>
  <p style="font-size: 24px; font-weight: 700; color: #78350F; margin: 8px 0;">{{badge_name}}</p>
  <p style="font-size: 14px; color: #A16207; margin: 0;">+{{stars_bonus}} bonus stars!</p>
</div>

<p style="color: #4B5563;">
  Consistent learning builds lasting knowledge. {{child_name}}'s dedication is truly inspiring!
</p>

<p style="text-align: center; margin-top: 30px;">
  <a href="{{app_url}}" class="btn-secondary">Celebrate Together</a>
</p>
```

### 4.3 Achievement Unlocked

**Subject:** 🏆 {{child_name}} earned a new badge: {{badge_name}}

**Trigger:** Badge or achievement earned

```html
<div style="text-align: center; padding: 20px 0;">
  <p style="font-size: 72px; margin: 0;">{{badge_icon}}</p>
  <h1 style="font-size: 24px; color: #1F2937;">New Badge Unlocked!</h1>
</div>

<p>Hi {{parent_name}},</p>

<p>{{child_name}} just earned a special achievement!</p>

<div style="background: linear-gradient(135deg, #EEF2FF, #E0E7FF); border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
  <p style="font-size: 20px; font-weight: 700; color: #4338CA; margin: 0;">{{badge_name}}</p>
  <p style="font-size: 14px; color: #6366F1; margin: 12px 0 0 0;">{{badge_description}}</p>
</div>

<p style="color: #4B5563;">
  {{personalized_message}}
</p>

<p style="text-align: center; margin-top: 30px;">
  <a href="{{badges_url}}" class="btn-primary">View All Badges</a>
</p>
```

### 4.4 Re-engagement (Inactive User)

**Subject:** {{mascot_name}} misses {{child_name}}! 🌟

**Trigger:** 3+ days of inactivity

```html
<div style="text-align: center; padding: 20px 0;">
  <img src="{{mascot_image}}" alt="{{mascot_name}}" style="width: 120px; height: 120px;">
</div>

<h1 style="text-align: center;">We miss {{child_name}}!</h1>

<p>Hi {{parent_name}},</p>

<p>It's been {{days_inactive}} days since {{child_name}} visited BrainSpark. {{mascot_name}} has been waiting with some exciting new discoveries!</p>

<div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin: 24px 0;">
  <p style="margin: 0; font-weight: 600; color: #1F2937;">🌟 Today's Brain Spark:</p>
  <p style="margin: 8px 0 0 0; color: #4B5563; font-style: italic;">"{{todays_spark}}"</p>
</div>

{{#if streak_at_risk}}
<div style="background: #FEF2F2; border-radius: 8px; padding: 16px; margin: 24px 0;">
  <p style="margin: 0; font-size: 14px; color: #991B1B;">
    <strong>⚠️ Streak at risk!</strong><br>
    {{child_name}}'s {{previous_streak}}-day streak will reset tomorrow if they don't visit.
  </p>
</div>
{{/if}}

<p style="text-align: center; margin-top: 30px;">
  <a href="{{app_url}}" class="btn-primary">Continue Learning</a>
</p>

<p style="font-size: 14px; color: #6B7280; text-align: center;">
  Even 5 minutes of curious exploration makes a difference!
</p>
```

---

## 5. Subscription & Billing Emails

### 5.1 Subscription Confirmation

**Subject:** Welcome to BrainSpark {{plan_name}}! ✨

**Trigger:** Subscription purchased

```html
<h1>Subscription Confirmed! 🎉</h1>

<p>Hi {{parent_name}},</p>

<p>Thank you for subscribing to BrainSpark {{plan_name}}! Your family now has access to unlimited learning adventures.</p>

<div style="background: #F3F4F6; border-radius: 12px; padding: 24px; margin: 24px 0;">
  <h3 style="margin-top: 0; color: #1F2937;">Subscription Details</h3>
  <table style="width: 100%;">
    <tr>
      <td style="padding: 8px 0; color: #6B7280;">Plan</td>
      <td style="padding: 8px 0; text-align: right; font-weight: 600;">{{plan_name}}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #6B7280;">Amount</td>
      <td style="padding: 8px 0; text-align: right; font-weight: 600;">{{amount}}/{{billing_period}}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #6B7280;">Next billing date</td>
      <td style="padding: 8px 0; text-align: right; font-weight: 600;">{{next_billing_date}}</td>
    </tr>
  </table>
</div>

<h3 style="color: #1F2937;">What's included:</h3>
<ul style="color: #4B5563; line-height: 2;">
  {{#each features}}
  <li>✅ {{this}}</li>
  {{/each}}
</ul>

<p style="font-size: 14px; color: #6B7280;">
  You can manage your subscription anytime in <a href="{{settings_url}}" style="color: #6366F1;">Account Settings</a>.
</p>
```

### 5.2 Payment Failed

**Subject:** ⚠️ Action needed: Update your payment method

**Trigger:** Payment failed

```html
<h1>Payment Update Needed</h1>

<p>Hi {{parent_name}},</p>

<p>We weren't able to process your BrainSpark subscription payment. To keep {{child_names}}'s learning uninterrupted, please update your payment method.</p>

<div style="background: #FEF2F2; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <p style="margin: 0; color: #991B1B;">
    <strong>Amount due:</strong> {{amount}}<br>
    <strong>Next retry:</strong> {{retry_date}}
  </p>
</div>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{payment_url}}" class="btn-primary">Update Payment Method</a>
</p>

<p style="font-size: 14px; color: #6B7280;">
  If your subscription lapses, don't worry—all progress and achievements are saved and will be waiting when you resubscribe.
</p>
```

### 5.3 Subscription Expiring

**Subject:** Your BrainSpark subscription ends in {{days_remaining}} days

**Trigger:** 7 days before subscription ends (for non-renewing)

```html
<h1>Your Subscription is Ending Soon</h1>

<p>Hi {{parent_name}},</p>

<p>Your BrainSpark {{plan_name}} subscription will end on {{end_date}}. After this date, {{child_names}} won't be able to access premium features.</p>

<div style="background: #F3F4F6; border-radius: 12px; padding: 24px; margin: 24px 0;">
  <h3 style="margin-top: 0; color: #1F2937;">{{child_name}}'s Progress So Far</h3>
  <ul style="color: #4B5563; line-height: 1.8; margin-bottom: 0;">
    <li>{{total_sessions}} learning sessions</li>
    <li>{{total_stars}} stars earned</li>
    <li>{{topics_explored}} topics explored</li>
    <li>{{badges_earned}} badges unlocked</li>
  </ul>
</div>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{renew_url}}" class="btn-primary">Renew Subscription</a>
</p>

<p style="font-size: 14px; color: #6B7280;">
  Questions? Our support team is happy to help at <a href="mailto:support@brainspark.app" style="color: #6366F1;">support@brainspark.app</a>
</p>
```

### 5.4 Receipt

**Subject:** Receipt for your BrainSpark payment

**Trigger:** Successful payment

```html
<h1>Payment Receipt</h1>

<p>Hi {{parent_name}},</p>

<p>Thank you for your payment. Here's your receipt for your records.</p>

<div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px; margin: 24px 0;">
  <table style="width: 100%;">
    <tr>
      <td colspan="2" style="padding-bottom: 16px; border-bottom: 1px solid #E5E7EB;">
        <strong style="color: #1F2937;">Receipt #{{receipt_number}}</strong><br>
        <span style="color: #6B7280; font-size: 14px;">{{payment_date}}</span>
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 0; color: #4B5563;">{{plan_name}}</td>
      <td style="padding: 16px 0; text-align: right; color: #1F2937;">{{amount}}</td>
    </tr>
    {{#if discount}}
    <tr>
      <td style="padding: 8px 0; color: #059669;">Discount ({{discount_code}})</td>
      <td style="padding: 8px 0; text-align: right; color: #059669;">-{{discount_amount}}</td>
    </tr>
    {{/if}}
    <tr style="border-top: 1px solid #E5E7EB;">
      <td style="padding: 16px 0; font-weight: 600; color: #1F2937;">Total</td>
      <td style="padding: 16px 0; text-align: right; font-weight: 600; color: #1F2937;">{{total}}</td>
    </tr>
  </table>
</div>

<p style="font-size: 14px; color: #6B7280;">
  Payment method: {{payment_method_last4}}<br>
  Billing period: {{billing_start}} - {{billing_end}}
</p>
```

---

## 6. Account Management Emails

### 6.1 Child Profile Added

**Subject:** {{child_name}} has joined the family! 🌟

**Trigger:** New child profile created

```html
<h1>New Explorer Added! 🎉</h1>

<p>Hi {{parent_name}},</p>

<p>{{child_name}} has been added to your BrainSpark family account!</p>

<div style="background: linear-gradient(135deg, #EEF2FF, #E0E7FF); border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
  <p style="font-size: 48px; margin: 0;">{{mascot_emoji}}</p>
  <h3 style="color: #4338CA; margin: 12px 0 0 0;">{{child_name}}</h3>
  <p style="color: #6366F1; margin: 8px 0 0 0;">{{age_group}} · Guide: {{mascot_name}}</p>
</div>

<p style="color: #4B5563;">
  {{child_name}} is ready to start their learning journey! Their first Daily Brain Spark will arrive tomorrow.
</p>

<p style="text-align: center; margin-top: 30px;">
  <a href="{{profile_url}}" class="btn-primary">Set Up Interests</a>
</p>
```

### 6.2 Account Deletion Confirmation

**Subject:** Your BrainSpark account has been deleted

**Trigger:** Account deletion completed

```html
<h1>Account Deleted</h1>

<p>Hi {{parent_name}},</p>

<p>As requested, your BrainSpark account and all associated data have been permanently deleted.</p>

<div style="background: #F3F4F6; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <p style="margin: 0; color: #4B5563; font-size: 14px;">
    <strong>What was deleted:</strong><br>
    • Parent account and profile<br>
    • All child profiles and learning history<br>
    • Progress data and achievements<br>
    • Payment information
  </p>
</div>

<p style="color: #4B5563;">
  We're sorry to see you go. If you ever want to return, you're always welcome to create a new account.
</p>

<p style="font-size: 14px; color: #6B7280;">
  We'd love to hear why you left. If you have a moment, please <a href="{{feedback_url}}" style="color: #6366F1;">share your feedback</a>.
</p>
```

---

## 7. Support Emails

### 7.1 Support Ticket Received

**Subject:** We received your message [#{{ticket_id}}]

**Trigger:** Support ticket created

```html
<h1>We Got Your Message!</h1>

<p>Hi {{parent_name}},</p>

<p>Thank you for reaching out. We've received your support request and our team will respond within 24 hours.</p>

<div style="background: #F3F4F6; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <p style="margin: 0; font-size: 14px; color: #6B7280;">
    <strong>Ticket #:</strong> {{ticket_id}}<br>
    <strong>Subject:</strong> {{ticket_subject}}<br>
    <strong>Submitted:</strong> {{submitted_date}}
  </p>
</div>

<p style="color: #4B5563;">
  In the meantime, you might find answers in our <a href="{{help_url}}" style="color: #6366F1;">Help Center</a>.
</p>

<p style="font-size: 14px; color: #6B7280;">
  To add more information to this request, simply reply to this email.
</p>
```

### 7.2 Support Ticket Resolved

**Subject:** Re: {{ticket_subject}} [#{{ticket_id}}] - Resolved

**Trigger:** Support ticket closed

```html
<h1>Your Request Has Been Resolved</h1>

<p>Hi {{parent_name}},</p>

<p>Your support request has been resolved. Here's a summary:</p>

<div style="background: #ECFDF5; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <p style="margin: 0; font-size: 14px; color: #065F46;">
    <strong>✅ Resolution:</strong><br>
    {{resolution_summary}}
  </p>
</div>

<p style="color: #4B5563;">
  If you need any further assistance, just reply to this email to reopen your ticket.
</p>

<div style="text-align: center; margin-top: 30px; padding: 20px; background: #F9FAFB; border-radius: 8px;">
  <p style="margin: 0 0 12px 0; color: #4B5563;">Was this helpful?</p>
  <a href="{{feedback_positive_url}}" style="margin: 0 8px; font-size: 24px; text-decoration: none;">👍</a>
  <a href="{{feedback_negative_url}}" style="margin: 0 8px; font-size: 24px; text-decoration: none;">👎</a>
</div>
```

---

## 8. Email Footer Templates

### 8.1 Standard Footer

```html
<div class="footer">
  <p style="margin: 0 0 12px 0;">
    <a href="{{app_url}}" style="color: #6B7280; margin: 0 8px;">App</a> |
    <a href="{{help_url}}" style="color: #6B7280; margin: 0 8px;">Help</a> |
    <a href="{{privacy_url}}" style="color: #6B7280; margin: 0 8px;">Privacy</a> |
    <a href="{{terms_url}}" style="color: #6B7280; margin: 0 8px;">Terms</a>
  </p>
  <p style="margin: 12px 0 0 0;">
    BrainSpark Education, Inc.<br>
    123 Learning Lane, San Francisco, CA 94102
  </p>
  <p style="margin: 12px 0 0 0;">
    <a href="{{unsubscribe_url}}" style="color: #9CA3AF;">Unsubscribe from marketing emails</a>
  </p>
</div>
```

### 8.2 Transactional Footer (No Unsubscribe)

```html
<div class="footer">
  <p style="margin: 0;">
    This is a transactional email regarding your BrainSpark account.
  </p>
  <p style="margin: 12px 0 0 0;">
    BrainSpark Education, Inc. | 123 Learning Lane, San Francisco, CA 94102
  </p>
</div>
```

---

## 9. Email Sending Configuration

### 9.1 Send Triggers

| Email | Trigger Event | Delay | Priority |
|-------|---------------|-------|----------|
| Welcome | account.created | Immediate | High |
| Verification | verification.requested | Immediate | High |
| Password Reset | password.reset.requested | Immediate | High |
| Consent Request | child.created | Immediate | High |
| Weekly Report | cron (Sunday 9 AM) | Scheduled | Medium |
| Streak Milestone | streak.milestone | Immediate | Medium |
| Achievement | achievement.earned | 5 min batch | Low |
| Re-engagement | user.inactive (3 days) | 1 day | Low |
| Payment Failed | payment.failed | Immediate | High |
| Receipt | payment.success | Immediate | Medium |

### 9.2 Email Categories & Unsubscribe

| Category | Can Unsubscribe | Examples |
|----------|-----------------|----------|
| Transactional | No | Password reset, receipts, consent |
| Account | No | Welcome, verification, deletion |
| Progress | Yes | Weekly reports, achievements |
| Engagement | Yes | Re-engagement, tips |
| Marketing | Yes | Feature announcements, promotions |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-15 | BrainSpark Team | Initial document |
