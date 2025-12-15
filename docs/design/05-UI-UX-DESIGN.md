# BrainSpark - UI/UX Design Requirements

## Document Purpose

This document defines the user interface and experience design requirements for BrainSpark, including visual design system, interaction patterns, accessibility requirements, and wireframes.

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Visual Design System](#2-visual-design-system)
3. [Typography](#3-typography)
4. [Iconography & Illustrations](#4-iconography--illustrations)
5. [Animation & Motion](#5-animation--motion)
6. [Screen Layouts](#6-screen-layouts)
7. [Interaction Patterns](#7-interaction-patterns)
8. [Responsive Design](#8-responsive-design)
9. [Accessibility](#9-accessibility)
10. [Sound Design](#10-sound-design)

---

## 1. Design Principles

### 1.1 Core Design Philosophy

| Principle | Description |
|-----------|-------------|
| **Child-First** | Every design decision prioritizes child usability and delight |
| **Encouraging** | Never punish wrong answers; celebrate exploration |
| **Progressive Complexity** | Simple surfaces hiding rich depth |
| **Delightful Discovery** | Surprises and Easter eggs reward exploration |
| **Calm Confidence** | Parents feel safe; children feel excited |

### 1.2 Age-Specific Design Goals

| Age Group | Design Goal | Key Approach |
|-----------|-------------|--------------|
| Wonder Cubs (4-6) | **Safety & Joy** | Large targets, soft colors, audio support |
| Curious Explorers (7-10) | **Adventure & Discovery** | Rich visuals, story elements, surprise reveals |
| Mind Masters (11-14) | **Respect & Challenge** | Sophisticated UI, adult-like interactions |

### 1.3 Emotional Journey Map

```
First Open → Delight & Wonder → Curiosity → Engagement → Accomplishment → Return

┌─────────────────────────────────────────────────────────────────────────────┐
│                           Emotional Journey                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   😮 Delight    😊 Curious    🤔 Thinking    💡 Aha!      🌟 Proud           │
│      │             │             │             │             │               │
│      │             │             │             │             │               │
│   ───┼─────────────┼─────────────┼─────────────┼─────────────┼───────────   │
│      │             │             │             │             │               │
│   Launch        First Q      Deep Dive    Breakthrough   Complete           │
│                                                                              │
│   ENTRY         ENGAGE        CHALLENGE      REWARD       CELEBRATE          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Visual Design System

### 2.1 Color Palettes by Age Group

#### Wonder Cubs Palette

```
Primary Colors:
┌─────────────────────────────────────────────────────────────┐
│  Sparkle Yellow    │  Cloud Blue     │  Grass Green        │
│  #FFE566           │  #87CEEB        │  #90EE90            │
│  Primary actions   │  Backgrounds    │  Success states     │
└─────────────────────────────────────────────────────────────┘

Secondary Colors:
┌─────────────────────────────────────────────────────────────┐
│  Lavender Dream    │  Peach Glow     │  Rose Petal         │
│  #E6E6FA           │  #FFDAB9        │  #FFB6C1            │
│  Cards/surfaces    │  Highlights     │  Rewards            │
└─────────────────────────────────────────────────────────────┘

Semantic Colors:
┌─────────────────────────────────────────────────────────────┐
│  Soft Success      │  Gentle Warning │  Background         │
│  #98FB98           │  #FFE4B5        │  #FFF8F0            │
│  Celebrations      │  Reminders      │  Main canvas        │
└─────────────────────────────────────────────────────────────┘
```

#### Curious Explorers Palette

```
Primary Colors:
┌─────────────────────────────────────────────────────────────┐
│  Explorer Teal     │  Discovery Gold │  Night Purple       │
│  #20B2AA           │  #FFD700        │  #6B5B95            │
│  Primary CTAs      │  Rewards/Stars  │  Deep thinking      │
└─────────────────────────────────────────────────────────────┘

Secondary Colors:
┌─────────────────────────────────────────────────────────────┐
│  Sapphire          │  Emerald        │  Amber              │
│  #0F52BA           │  #50C878        │  #FFBF00            │
│  Information       │  Success        │  Highlights         │
└─────────────────────────────────────────────────────────────┘

Semantic Colors:
┌─────────────────────────────────────────────────────────────┐
│  Achievement Gold  │  Progress Blue  │  Background         │
│  #FFD700           │  #4169E1        │  #F0F8FF            │
│  Badges/unlocks    │  Depth levels   │  Main canvas        │
└─────────────────────────────────────────────────────────────┘
```

#### Mind Masters Palette

```
Primary Colors:
┌─────────────────────────────────────────────────────────────┐
│  Phoenix Crimson   │  Cosmic Navy    │  Wisdom Gold        │
│  #DC143C           │  #191970        │  #DAA520            │
│  Bold actions      │  Main surfaces  │  Achievements       │
└─────────────────────────────────────────────────────────────┘

Secondary Colors:
┌─────────────────────────────────────────────────────────────┐
│  Electric Violet   │  Storm Gray     │  Ice Blue           │
│  #8B008B           │  #708090        │  #B0E0E6            │
│  Debates/contrast  │  Neutral UI     │  Information        │
└─────────────────────────────────────────────────────────────┘

Gradients:
┌─────────────────────────────────────────────────────────────┐
│  Night Sky         │  Phoenix Rise   │  Deep Space         │
│  #191970 → #000080 │  #DC143C → #FFD700 │ #000000 → #191970 │
│  Backgrounds       │  CTA buttons    │  Constellation      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Spacing System

```css
/* Base unit: 4px */
--space-1: 4px;   /* Tight spacing */
--space-2: 8px;   /* Default gap */
--space-3: 12px;  /* Component padding */
--space-4: 16px;  /* Section spacing */
--space-5: 24px;  /* Card padding */
--space-6: 32px;  /* Screen margins */
--space-7: 48px;  /* Large gaps */
--space-8: 64px;  /* Hero spacing */
```

### 2.3 Border Radius

```css
/* Wonder Cubs: Very rounded */
--radius-wc-sm: 12px;
--radius-wc-md: 20px;
--radius-wc-lg: 32px;
--radius-wc-full: 9999px;

/* Curious Explorers: Moderately rounded */
--radius-ce-sm: 8px;
--radius-ce-md: 12px;
--radius-ce-lg: 20px;
--radius-ce-full: 9999px;

/* Mind Masters: Subtle rounding */
--radius-mm-sm: 4px;
--radius-mm-md: 8px;
--radius-mm-lg: 12px;
--radius-mm-full: 9999px;
```

### 2.4 Shadows & Elevation

```css
/* Layering system */
--shadow-1: 0 1px 3px rgba(0,0,0,0.08);    /* Cards */
--shadow-2: 0 4px 6px rgba(0,0,0,0.1);     /* Raised elements */
--shadow-3: 0 10px 20px rgba(0,0,0,0.15);  /* Modals */
--shadow-4: 0 20px 40px rgba(0,0,0,0.2);   /* Popovers */

/* Wonder Cubs special glow */
--glow-wc: 0 0 20px rgba(255,229,102,0.5);

/* Curious Explorers adventure shadow */
--glow-ce: 0 0 15px rgba(32,178,170,0.4);

/* Mind Masters subtle shadow */
--glow-mm: 0 0 10px rgba(220,20,60,0.3);
```

---

## 3. Typography

### 3.1 Font Families

```css
/* Wonder Cubs: Friendly, rounded */
--font-wc-heading: 'Nunito', 'Comic Sans MS', sans-serif;
--font-wc-body: 'Nunito', 'Comic Sans MS', sans-serif;

/* Curious Explorers: Adventurous, clear */
--font-ce-heading: 'Poppins', 'Helvetica Neue', sans-serif;
--font-ce-body: 'Open Sans', 'Helvetica', sans-serif;

/* Mind Masters: Sophisticated, modern */
--font-mm-heading: 'Space Grotesk', 'Helvetica Neue', sans-serif;
--font-mm-body: 'Inter', 'Roboto', sans-serif;
```

### 3.2 Type Scale

#### Wonder Cubs (4-6)

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 32px | 700 | 1.2 |
| H2 | 28px | 700 | 1.3 |
| Body Large | 24px | 400 | 1.5 |
| Body | 20px | 400 | 1.5 |
| Button | 22px | 600 | 1.2 |
| Caption | 18px | 400 | 1.4 |

#### Curious Explorers (7-10)

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 28px | 700 | 1.2 |
| H2 | 24px | 600 | 1.3 |
| Body Large | 20px | 400 | 1.6 |
| Body | 18px | 400 | 1.6 |
| Button | 18px | 600 | 1.2 |
| Caption | 14px | 400 | 1.4 |

#### Mind Masters (11-14)

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 24px | 700 | 1.2 |
| H2 | 20px | 600 | 1.3 |
| Body Large | 18px | 400 | 1.6 |
| Body | 16px | 400 | 1.6 |
| Button | 16px | 500 | 1.2 |
| Caption | 14px | 400 | 1.4 |
| Small | 12px | 400 | 1.4 |

---

## 4. Iconography & Illustrations

### 4.1 Icon Style Guidelines

| Age Group | Style | Stroke | Fill |
|-----------|-------|--------|------|
| Wonder Cubs | Chunky, filled | 4px minimum | Solid colors |
| Curious Explorers | Outlined, detailed | 2px | Gradient fills |
| Mind Masters | Minimalist, sharp | 1.5px | Monochrome |

### 4.2 Mascot Specifications

#### Sparkle (Wonder Cubs)

```
Character: Friendly firefly
Key Features:
- Large, expressive eyes (50% of face)
- Soft, glowing body (animated pulse)
- Small wings (gentle flutter)
- Always smiling

Expressions:
- Neutral: Gentle smile, eyes centered
- Excited: Wide eyes, open mouth smile
- Thinking: Eyes looking up, slight tilt
- Celebrating: Sparkles around, jumping pose
- Encouraging: Leaning forward, warm smile

Size: 120px minimum, scales to 200px on tablet
Animation: Subtle float, wing flutter, glow pulse
```

#### Nova (Curious Explorers)

```
Character: Wise owl with explorer gear
Key Features:
- Large eyes with glint of curiosity
- Small explorer hat or goggles
- Book or magnifying glass accessory
- Earth-tone feathers

Expressions:
- Neutral: Attentive, slightly tilted head
- Curious: Wide eyes, leaning in
- Mysterious: Half-closed eyes, knowing smile
- Excited: Wings slightly spread, eyes bright
- Thoughtful: Stroking chin (wing), eyes up

Size: 100px minimum, scales to 180px on tablet
Animation: Head tilts, occasional blink, subtle ruffle
```

#### Axiom (Mind Masters)

```
Character: Phoenix with celestial motifs
Key Features:
- Sleek, angular design
- Flame-like feathers with gradient
- Subtle geometric patterns
- Minimal but expressive eyes

Expressions:
- Neutral: Cool, confident gaze
- Challenging: Slight smirk, raised "eyebrow"
- Impressed: Subtle nod, warm glow
- Thinking: Flames flicker upward
- Celebration: Full flame display

Size: 80px minimum, scales to 150px on tablet
Animation: Subtle flame movement, occasional wing spread
```

### 4.3 Illustration Guidelines

**Wonder Cubs:**
- Round shapes, no sharp edges
- Bright, saturated colors
- Simple scenes (max 3-4 elements)
- Friendly faces on all objects

**Curious Explorers:**
- Detailed but clean illustrations
- Rich color palettes
- Story-like scenes
- Sense of adventure and discovery

**Mind Masters:**
- Abstract or minimalist
- Sophisticated color use
- Symbolic imagery
- Thoughtful negative space

---

## 5. Animation & Motion

### 5.1 Animation Principles

| Principle | Implementation |
|-----------|----------------|
| **Purposeful** | Every animation serves a function |
| **Delightful** | Rewarding moments get special treatment |
| **Non-disruptive** | Animations don't block user actions |
| **Age-appropriate** | Speed and complexity match age group |

### 5.2 Timing Guidelines

| Age Group | Base Duration | Easing |
|-----------|---------------|--------|
| Wonder Cubs | 400-600ms | ease-out (gentle) |
| Curious Explorers | 300-400ms | ease-in-out |
| Mind Masters | 200-300ms | ease-out (snappy) |

### 5.3 Key Animations

#### Screen Transitions

```css
/* Wonder Cubs: Playful slide and fade */
.wc-transition-enter {
  animation: wcSlideIn 500ms ease-out;
}

@keyframes wcSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Curious Explorers: Adventure reveal */
.ce-transition-enter {
  animation: ceReveal 400ms ease-in-out;
}

@keyframes ceReveal {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Mind Masters: Sharp fade */
.mm-transition-enter {
  animation: mmFade 250ms ease-out;
}

@keyframes mmFade {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### Celebration Animations

```javascript
// Star burst for achievements
const starBurst = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: [0, 1.2, 1],
    rotate: [−180, 10, 0],
  },
  transition: {
    duration: 0.6,
    times: [0, 0.7, 1],
    ease: "easeOut"
  }
};

// Particle explosion for unlocks
const particleExplosion = {
  particles: 20,
  spread: 360,
  startVelocity: 30,
  decay: 0.95,
  colors: ['#FFD700', '#FFE566', '#FFA500']
};

// Aha moment lightbulb
const ahaMoment = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.3, 1],
    opacity: [0, 1, 1],
    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
  },
  transition: { duration: 0.8 }
};
```

#### Micro-interactions

```javascript
// Button press (all ages)
const buttonPress = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400 }
};

// Choice hover (Explorers & Masters)
const choiceHover = {
  whileHover: {
    scale: 1.02,
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
  }
};

// Star collection
const starCollect = {
  animate: {
    scale: [1, 1.5, 0],
    y: [0, -50, -100],
    opacity: [1, 1, 0]
  },
  transition: { duration: 0.6 }
};
```

---

## 6. Screen Layouts

### 6.1 Wonder Cubs Screens

#### Home Screen

```
┌─────────────────────────────────────────┐
│              🌟 BrainSpark              │  ← Header (minimal)
├─────────────────────────────────────────┤
│                                         │
│        ┌─────────────────────┐          │
│        │   👋 Hi Emma!       │          │  ← Greeting
│        │                     │          │
│        │   ✨ Sparkle ✨     │          │  ← Mascot (large)
│        │   (animated)        │          │
│        └─────────────────────┘          │
│                                         │
│   ┌───────────────────────────────┐     │
│   │  🌟 Today's Brain Spark!     │     │  ← Daily Spark Card
│   │                               │     │
│   │  "What animal would you      │     │
│   │   like to be friends with?"   │     │
│   │                               │     │
│   │  [ 🎉 Let's Think! ]         │     │
│   └───────────────────────────────┘     │
│                                         │
│   🔥 Streak: 5 days! ⭐ Stars: 45      │  ← Progress bar
│                                         │
├─────────────────────────────────────────┤
│   🏠        ⭐        👤               │  ← Nav (3 items max)
│  Home    Explore   Me                   │
└─────────────────────────────────────────┘
```

#### Conversation Screen

```
┌─────────────────────────────────────────┐
│  ←  Talking about Animals  🐾           │  ← Back + Topic
├─────────────────────────────────────────┤
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ ✨                               │   │
│   │ Sparkle: Bunnies are so fluffy! │   │  ← AI message
│   │ Did you know they hop really    │   │
│   │ fast? 🐰                        │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ Emma: I like bunnies!           │   │  ← Child message
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ ✨                               │   │
│   │ Sparkle: Me too! What do you    │   │
│   │ think bunnies dream about?      │   │
│   └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   ┌─────────────┐   ┌─────────────┐    │  ← Response choices
│   │ 🥕 Carrots! │   │ 🌈 Running  │    │
│   │             │   │   in fields │    │
│   └─────────────┘   └─────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### 6.2 Curious Explorers Screens

#### Knowledge Constellation

```
┌─────────────────────────────────────────────────────────────┐
│  ←  Knowledge Constellation            🔥 12  ⭐ 234        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│             ★ Space (D3)                                    │
│            ╱│╲                                              │
│           ╱ │ ╲                                             │
│          ╱  │  ╲                                            │
│    ★ Planets ★ Stars  ◯ Black Holes                        │
│    (D2)      (D1)     (Locked)                              │
│         ╲   │   ╱                                           │
│          ╲  │  ╱                                            │
│           ★ Physics ───────────────── ★ Math               │
│           (D1)                         (D2)                 │
│           │                            │                    │
│           ◯ Energy                     ★ Patterns           │
│           (needs Physics D2)           (D1)                 │
│                                                             │
│                    ★ Nature                                 │
│                   ╱│╲                                       │
│        ★ Animals ★ Plants ★ Weather                        │
│        (D3)      (D1)    (D2)                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Tap a star to explore!                              │   │
│  │ ★ = Unlocked   ◯ = Locked                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│   🏠        🌟        🗺️        👤                         │
│  Home    Spark   Constellation   Me                         │
└─────────────────────────────────────────────────────────────┘
```

#### Topic Expansion Modal

```
┌─────────────────────────────────────────┐
│                    ╳                    │
│                                         │
│          ★ SPACE ★                      │
│                                         │
│    Depth: ███████░░░  Level 3           │
│                                         │
│    🚀 Time explored: 45 minutes         │
│    💡 Questions asked: 23               │
│    🔗 Connected to: Physics, Math       │
│                                         │
│    Recent discoveries:                  │
│    • Learned about gravity              │
│    • Explored the Moon                  │
│    • Found out about asteroids          │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │     🔭  Continue Exploring      │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │     📚  See What I've Learned   │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### 6.3 Mind Masters Screens

#### Debate Mode

```
┌─────────────────────────────────────────────────────────────┐
│  ←  Philosophy: Ethics                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                     │   │
│   │  "Is it ever right to break a promise               │   │
│   │   to help someone else?"                            │   │
│   │                                                     │   │
│   │  ─────────────────────────────────────              │   │
│   │                                                     │   │
│   │  Consider: Your friend asks you to keep a          │   │
│   │  secret, but keeping it might hurt another         │   │
│   │  friend.                                            │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   🔥 Axiom: "A classic dilemma. Let's break it down."      │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  [ Yes - preventing harm is more important ]        │   │
│   └─────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  [ No - trust is the foundation of friendship ]     │   │
│   └─────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  [ It depends on the situation ]                    │   │
│   └─────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  [ Share my own perspective... ]                    │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Depth: ████░░░░░░  Level 4   │   ⌚ 8 min                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Interaction Patterns

### 7.1 Touch Target Sizes

| Age Group | Minimum Touch Target | Recommended |
|-----------|---------------------|-------------|
| Wonder Cubs | 56px | 72px |
| Curious Explorers | 48px | 56px |
| Mind Masters | 44px | 48px |

### 7.2 Navigation Patterns

**Wonder Cubs:**
- Maximum 3 bottom nav items
- Large, icon-focused tabs
- No hamburger menus
- Single-level navigation only

**Curious Explorers:**
- 4-5 bottom nav items allowed
- Icon + text labels
- Simple tab navigation within screens
- Two-level navigation maximum

**Mind Masters:**
- Standard navigation patterns acceptable
- Can use text-only buttons
- Nested navigation allowed
- Can include settings gear icon

### 7.3 Input Patterns

| Age Group | Primary Input | Secondary Input |
|-----------|---------------|-----------------|
| Wonder Cubs | Large buttons | Voice (future) |
| Curious Explorers | Buttons + Simple text | Swipe gestures |
| Mind Masters | Text input | All standard inputs |

### 7.4 Feedback Patterns

```javascript
// Immediate feedback on all interactions

// Wonder Cubs: Enthusiastic
const wcFeedback = {
  success: { message: "Yay! Great job! 🌟", animation: "bounce" },
  progress: { message: "You did it! Keep going!", animation: "sparkle" },
  encouragement: { message: "Nice try! Let's explore more!", animation: "gentle-pulse" }
};

// Curious Explorers: Encouraging
const ceFeedback = {
  success: { message: "Excellent thinking! 🔭", animation: "star-burst" },
  progress: { message: "You're getting deeper!", animation: "glow-pulse" },
  discovery: { message: "New connection found!", animation: "connection-line" }
};

// Mind Masters: Respectful
const mmFeedback = {
  success: { message: "Strong insight.", animation: "subtle-glow" },
  progress: { message: "Level up.", animation: "badge-reveal" },
  challenge: { message: "Consider the counterargument.", animation: "none" }
};
```

---

## 8. Responsive Design

### 8.1 Breakpoints

```css
/* Mobile First */
--bp-mobile: 320px;    /* Small phones */
--bp-mobile-lg: 375px; /* Standard phones */
--bp-tablet: 768px;    /* Tablets */
--bp-desktop: 1024px;  /* Laptops (parent dashboard) */
--bp-desktop-lg: 1440px; /* Large screens */
```

### 8.2 Device-Specific Considerations

| Device | Primary Use | Special Considerations |
|--------|-------------|----------------------|
| Phone (portrait) | Wonder Cubs | Vertical scrolling, large buttons |
| Phone (landscape) | Curious Explorers | Conversation + choices side-by-side |
| Tablet | All ages | Constellation view optimized |
| Desktop | Parent Dashboard | Multi-column layouts |

### 8.3 Orientation Handling

```javascript
// Lock to portrait for Wonder Cubs
const wonderCubsOrientation = {
  preferred: "portrait",
  allowLandscape: false,
  message: "Please turn your device upright! 📱"
};

// Allow both for others
const defaultOrientation = {
  preferred: "portrait",
  allowLandscape: true,
  optimizedLayouts: {
    portrait: "conversation-focused",
    landscape: "constellation-focused"
  }
};
```

---

## 9. Accessibility

### 9.1 WCAG 2.1 AA Compliance

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.1.1 | Non-text content | Alt text for all images |
| 1.4.3 | Contrast | 4.5:1 for text, 3:1 for large text |
| 1.4.4 | Resize text | Up to 200% without loss |
| 2.1.1 | Keyboard | All functions keyboard accessible |
| 2.4.7 | Focus visible | Clear focus indicators |
| 3.1.1 | Language | HTML lang attribute set |

### 9.2 Color Contrast Requirements

```
Wonder Cubs (Large text primarily):
- Text on background: 3:1 minimum (large text)
- Interactive elements: 3:1

Curious Explorers & Mind Masters:
- Body text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1
```

### 9.3 Screen Reader Support

```html
<!-- Announce dynamic content changes -->
<div role="status" aria-live="polite">
  <!-- AI response will be announced -->
</div>

<!-- Clear labels for interactive elements -->
<button
  aria-label="Explore the topic of Space"
  role="button"
>
  ★ Space
</button>

<!-- Group related choices -->
<div role="group" aria-label="Response choices">
  <button>Choice 1</button>
  <button>Choice 2</button>
</div>
```

### 9.4 Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Keep essential state changes visible */
  .celebration {
    opacity: 1;
    transform: none;
  }
}
```

---

## 10. Sound Design

### 10.1 Audio Guidelines

| Principle | Description |
|-----------|-------------|
| Optional | All sounds can be disabled |
| Non-essential | No critical info conveyed by sound alone |
| Age-appropriate | Calmer for younger, more subtle for older |
| Non-intrusive | Background parents shouldn't find annoying |

### 10.2 Sound Categories

**UI Sounds:**
- Button tap (soft click)
- Navigation (subtle swoosh)
- Error (gentle boop)
- Success (pleasant chime)

**Celebration Sounds:**
- Achievement unlock (triumphant ding)
- Level up (ascending tones)
- Streak milestone (fanfare, brief)
- Star collection (sparkle sound)

**Ambient (Optional):**
- Constellation background (gentle space ambiance)
- Thinking mode (soft, contemplative)

### 10.3 Voice-Over (Wonder Cubs)

```yaml
voice_settings:
  voice: Child-friendly, warm, gender-neutral
  speed: 0.9x normal (slightly slower)
  pitch: Slightly higher than adult
  pauses: Natural pauses between sentences

auto_play:
  enabled: true (can be disabled)
  elements:
    - Question text
    - Response choices
    - Mascot dialogue
  excludes:
    - Navigation elements
    - Status indicators
```

---

## Appendix A: Component Library Reference

### A.1 Button Components

```jsx
// Wonder Cubs Button
<WCButton
  size="large"      // large | medium
  variant="primary" // primary | secondary
  icon="🌟"         // Optional emoji
  sound="tap"       // Sound on press
  onPress={() => {}}
>
  Let's Go!
</WCButton>

// Curious Explorers Button
<CEButton
  size="medium"
  variant="adventure" // adventure | explore | neutral
  leftIcon={<CompassIcon />}
  onPress={() => {}}
>
  Start Exploring
</CEButton>

// Mind Masters Button
<MMButton
  size="default"
  variant="challenge" // challenge | neutral | subtle
  onPress={() => {}}
>
  Submit Response
</MMButton>
```

### A.2 Card Components

```jsx
// Topic Card
<TopicCard
  topic={topic}
  depth={3}
  isUnlocked={true}
  onExplore={() => {}}
/>

// Brain Spark Card
<BrainSparkCard
  spark={dailySpark}
  onStart={() => {}}
  completed={false}
/>

// Achievement Card
<AchievementCard
  badge={badge}
  earnedAt={date}
  celebration={true}
/>
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-15 | BrainSpark Team | Initial document |

---

*Previous Document: [04-FEATURE-SPECIFICATIONS.md](../technical/04-FEATURE-SPECIFICATIONS.md)*
*Next Document: [06-DATABASE-SCHEMA.md](../technical/06-DATABASE-SCHEMA.md)*
