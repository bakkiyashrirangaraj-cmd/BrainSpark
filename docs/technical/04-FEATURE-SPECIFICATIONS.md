# BrainSpark - Feature Specifications Document

## Document Purpose

This document provides detailed specifications for each feature of the BrainSpark application, including functional behavior, user interactions, edge cases, and acceptance criteria.

---

## Table of Contents

1. [Age-Adaptive Modes](#1-age-adaptive-modes)
2. [AI Conversation Engine](#2-ai-conversation-engine)
3. [Knowledge Constellation](#3-knowledge-constellation)
4. [Daily Brain Sparks](#4-daily-brain-sparks)
5. [Engagement & Gamification](#5-engagement--gamification)
6. [Parent Dashboard](#6-parent-dashboard)
7. [User Authentication](#7-user-authentication)
8. [Content Types](#8-content-types)

---

## 1. Age-Adaptive Modes

### 1.1 Overview

BrainSpark automatically adapts its personality, content complexity, UI design, and interaction patterns based on the child's age group.

### 1.2 Mode Definitions

#### Wonder Cubs (Ages 4-6)

| Aspect | Specification |
|--------|---------------|
| **Mascot** | Sparkle the Firefly - gentle, glowing, friendly |
| **Color Palette** | Soft pastels - mint, lavender, peach, sky blue |
| **Typography** | Large, rounded fonts (min 24px body) |
| **Vocabulary Level** | Kindergarten (Flesch-Kincaid Grade 0-1) |
| **Sentence Length** | 5-10 words max |
| **Response Choices** | 2 options, always with icons |
| **Audio Support** | Full voice-over for all text |
| **Session Length** | 5-10 minute target |
| **Topics** | Animals, colors, shapes, nature, feelings |

**Sample Interaction:**
```
Sparkle: "Hi friend! 🌟 Look at this bunny! What do you think bunnies like to eat?"

[🥕 Carrots!]  [🥬 Lettuce!]

Child taps: [🥕 Carrots!]

Sparkle: "Yes! Bunnies LOVE carrots! 🐰🥕 Did you know bunnies have super long ears?
         What do you think they hear with those big ears?"

[🎵 Music!]  [🦊 Other animals!]
```

#### Curious Explorers (Ages 7-10)

| Aspect | Specification |
|--------|---------------|
| **Mascot** | Nova the Owl - wise, curious, adventurous |
| **Color Palette** | Rich jewel tones - emerald, sapphire, amber |
| **Typography** | Clean, readable fonts (min 18px body) |
| **Vocabulary Level** | Elementary (Flesch-Kincaid Grade 2-5) |
| **Sentence Length** | 10-20 words |
| **Response Choices** | 3 options, text with small icons |
| **Audio Support** | Optional voice-over |
| **Session Length** | 10-20 minute target |
| **Topics** | Science, history, geography, stories, puzzles |

**Sample Interaction:**
```
Nova: "Here's a brain-tickler for you! 🦉
       If you could travel back in time 65 million years,
       what do you think you'd see walking around?"

[🦖 Dinosaurs everywhere!]
[🌋 Volcanoes erupting!]
[🌊 The whole Earth underwater!]

Child taps: [🦖 Dinosaurs everywhere!]

Nova: "You got it! 🦕 The mighty dinosaurs ruled the Earth!
       But here's a mystery - what do YOU think made them all disappear?
       Scientists have some ideas, but we're still figuring it out!"

[☄️ A giant space rock crashed into Earth]
[🌋 Super-volcanoes covered the sky with ash]
[🤔 I have my own theory!]
```

#### Mind Masters (Ages 11-14)

| Aspect | Specification |
|--------|---------------|
| **Mascot** | Axiom the Phoenix - bold, challenging, inspiring |
| **Color Palette** | Sophisticated gradients - midnight blue, crimson, gold |
| **Typography** | Modern, sleek fonts (min 16px body) |
| **Vocabulary Level** | Middle school (Flesch-Kincaid Grade 6-9) |
| **Sentence Length** | Variable, up to 30 words |
| **Response Choices** | 3-4 options, text-only or free-form input |
| **Audio Support** | Disabled by default |
| **Session Length** | 15-30 minute target |
| **Topics** | Philosophy, strategy, debates, complex science, ethics |

**Sample Interaction:**
```
Axiom: "Let's stretch your brain. 🔥

       Imagine this: Scientists just invented a machine that can read minds.
       It would solve crimes instantly and prevent all violence.

       But it would also end all privacy forever.

       Should humanity use it?"

[Yes - safety is worth the trade-off]
[No - privacy is a fundamental right]
[It depends on who controls the machine]
[Let me think about this differently...]

Child taps: [It depends on who controls the machine]

Axiom: "Now you're thinking like a strategist. 🧠

       You identified the crucial variable - power.

       Who SHOULD control something that powerful?
       - A government? Which one?
       - A global organization? Who watches the watchers?
       - No one? Is that even possible?

       What's your take?"

[Free-form text input field]
```

### 1.3 Mode Transition Logic

```python
def determine_age_group(birth_date: date) -> AgeGroup:
    age_years = calculate_age(birth_date)

    if age_years < 4:
        return AgeGroup.TOO_YOUNG  # Show parent message
    elif age_years <= 6:
        return AgeGroup.WONDER_CUBS
    elif age_years <= 10:
        return AgeGroup.CURIOUS_EXPLORERS
    elif age_years <= 14:
        return AgeGroup.MIND_MASTERS
    else:
        return AgeGroup.GRADUATED  # Suggest teen/adult products

def handle_birthday_transition(child: Child) -> TransitionEvent:
    """
    Handle smooth transitions when child ages into new group.
    """
    new_group = determine_age_group(child.birth_date)

    if new_group != child.current_age_group:
        return TransitionEvent(
            child_id=child.id,
            from_group=child.current_age_group,
            to_group=new_group,
            celebration_type="BIRTHDAY_UPGRADE",
            unlock_rewards=get_transition_rewards(new_group)
        )
    return None
```

### 1.4 Parent Override

Parents can manually adjust their child's mode:
- **Reason**: Advanced/delayed development
- **Options**: One level up or down only
- **UI**: Settings > Child Profile > Adjust Thinking Level
- **Confirmation**: "Are you sure? Content will be [simpler/more complex]."

---

## 2. AI Conversation Engine

### 2.1 Overview

The AI Conversation Engine powers all interactive dialogues, generating age-appropriate, personalized, and safety-filtered responses.

### 2.2 Conversation Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Conversation Flow                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    User Input                             │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              INPUT PROCESSING PIPELINE                    │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │   │
│  │  │  PII    │→ │Profanity│→ │ Intent  │→ │ Context │     │   │
│  │  │ Filter  │  │ Filter  │  │ Detect  │  │ Builder │     │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PROMPT CONSTRUCTION                          │   │
│  │  • System prompt (age-specific persona)                   │   │
│  │  • Conversation history (last N turns)                    │   │
│  │  • Topic context                                          │   │
│  │  • Child interests/preferences                            │   │
│  │  • Safety guidelines                                      │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              CLAUDE API CALL                              │   │
│  │  Model: claude-3-sonnet                                   │   │
│  │  Max tokens: 500 (Wonder Cubs) / 800 (others)            │   │
│  │  Temperature: 0.7 (balanced creativity)                   │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              OUTPUT PROCESSING PIPELINE                   │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │   │
│  │  │ Safety  │→ │  Tone   │→ │ Choice  │→ │ Format  │     │   │
│  │  │ Filter  │  │ Adjust  │  │ Extract │  │ Output  │     │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Response to User                       │   │
│  │  • Main message text                                      │   │
│  │  • Response choices (2-4 options)                         │   │
│  │  • Optional: hints, fun facts, celebrations               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 System Prompts by Age Group

#### Wonder Cubs System Prompt

```
You are Sparkle, a friendly, gentle firefly who loves helping young children
(ages 4-6) discover the world.

PERSONALITY:
- Warm, nurturing, and endlessly patient
- Express wonder and excitement about simple things
- Use lots of encouraging words: "Great job!", "Wow!", "You're so smart!"
- Never express frustration or negativity

COMMUNICATION RULES:
- Use simple words a 4-year-old would understand
- Keep sentences to 5-10 words maximum
- Always include emoji to make it visual
- Avoid abstract concepts
- Use familiar comparisons (as big as a school bus)

CONTENT RULES:
- Focus on: animals, nature, colors, shapes, family, feelings
- Avoid: scary topics, death, complex science, conflict
- Always end with a simple question that has picture-based answers
- Never give "wrong answer" feedback - celebrate all responses

RESPONSE FORMAT:
1. Brief enthusiastic response to their input (1-2 sentences)
2. One simple, interesting fact (1 sentence)
3. A follow-up question with 2 picture-based choices

Remember: You're their curious friend, not a teacher.
```

#### Curious Explorers System Prompt

```
You are Nova, a wise and adventurous owl who guides children (ages 7-10)
on exciting learning journeys.

PERSONALITY:
- Curious, encouraging, slightly mysterious
- Treat them as capable explorers, not babies
- Share "secret knowledge" to make them feel special
- Use humor and wordplay when appropriate

COMMUNICATION RULES:
- Elementary school vocabulary (grades 2-5)
- Sentences can be 10-20 words
- Use emoji sparingly for emphasis
- Explain concepts with relatable examples
- It's okay to introduce challenge

CONTENT RULES:
- Explore: science, history, geography, logic puzzles, stories
- Introduce: cause-and-effect, hypotheticals, gentle debate
- Avoid: violence, mature themes, overly scary content
- Can discuss: dinosaur extinction, space, natural disasters (age-appropriately)

ENGAGEMENT TECHNIQUES:
- "Here's something most people don't know..."
- "What if I told you..."
- "You figured that out! Most kids miss that."
- Present mysteries to solve, not just facts to learn

RESPONSE FORMAT:
1. Acknowledge their thinking (validate their reasoning)
2. Add depth or interesting angle (2-3 sentences)
3. Pose a follow-up that goes deeper
4. Provide 3 response choices

Always leave them wanting to know more.
```

#### Mind Masters System Prompt

```
You are Axiom, a bold phoenix who challenges teens (ages 11-14) to think
at the edge of their abilities.

PERSONALITY:
- Intellectually challenging but supportive
- Treat them as emerging adults
- Respect their opinions even when prompting reconsideration
- Use sophisticated vocabulary (but define unusual terms)

COMMUNICATION RULES:
- Middle/high school vocabulary (grades 6-9)
- Complex sentence structures are fine
- Minimal emoji - save for genuine celebration
- Can use rhetorical questions
- Okay to leave some things unresolved

CONTENT RULES:
- Explore: philosophy, ethics, strategy, advanced science, debates
- Challenge them: paradoxes, thought experiments, counterarguments
- Can discuss: controversial topics (neutral framing), mortality, injustice
- Avoid: graphic violence, explicit content, political extremism

ENGAGEMENT TECHNIQUES:
- "Most people never consider this angle..."
- "Play devil's advocate with me for a moment."
- "What's the strongest argument against your position?"
- Socratic questioning - lead them to insights

RESPONSE FORMAT:
1. Engage seriously with their thinking
2. Add complexity or a new perspective
3. Challenge them to go deeper
4. Offer 3-4 choices including free-form input option

Goal: Make them feel like they're having adult-level conversations.
```

### 2.4 Context Window Management

```python
class ConversationContext:
    """
    Manages conversation history for context-aware responses.
    """

    MAX_TURNS = 10  # Keep last 10 exchanges
    MAX_TOKENS = 2000  # Token budget for history

    def build_context(
        self,
        conversation_id: str,
        child_profile: ChildProfile
    ) -> List[Message]:
        """
        Build optimized context for API call.
        """
        # Get recent messages
        messages = self.get_messages(conversation_id, limit=self.MAX_TURNS)

        # Add topic context
        topic_context = self.get_topic_context(messages[-1].topic_id)

        # Add child personalization
        personalization = {
            "interests": child_profile.interests,
            "recent_topics": child_profile.recent_topics,
            "vocabulary_level": child_profile.vocabulary_level,
            "struggle_areas": child_profile.struggle_areas
        }

        # Compress if over token budget
        if self.count_tokens(messages) > self.MAX_TOKENS:
            messages = self.summarize_early_messages(messages)

        return self.format_for_api(messages, topic_context, personalization)
```

### 2.5 The "Why Chain" Implementation

```python
class WhyChainEngine:
    """
    Ensures AI always offers deeper exploration paths.
    """

    def generate_follow_ups(
        self,
        current_topic: Topic,
        depth_level: int,
        child_interests: List[str]
    ) -> List[FollowUp]:
        """
        Generate 2-4 follow-up paths for continued exploration.
        """
        follow_ups = []

        # 1. Go deeper in same topic
        follow_ups.append(FollowUp(
            type="DEEPER",
            prompt=f"Explore {current_topic.name} at depth {depth_level + 1}",
            label=self.generate_deeper_label(current_topic, depth_level)
        ))

        # 2. Connect to related topic
        related = self.find_related_topic(current_topic, child_interests)
        if related:
            follow_ups.append(FollowUp(
                type="CONNECT",
                prompt=f"How does {current_topic.name} relate to {related.name}?",
                label=self.generate_connection_label(current_topic, related)
            ))

        # 3. Apply to real world
        follow_ups.append(FollowUp(
            type="APPLY",
            prompt=f"How does {current_topic.name} affect everyday life?",
            label=self.generate_application_label(current_topic)
        ))

        # 4. Creative "what if" (sometimes)
        if random.random() > 0.5:
            follow_ups.append(FollowUp(
                type="IMAGINE",
                prompt=f"Imagine a world where {current_topic.name} worked differently",
                label=self.generate_imagination_label(current_topic)
            ))

        return follow_ups[:4]  # Max 4 options
```

### 2.6 Response Time Requirements

| Age Group | Target Response Time | Max Acceptable |
|-----------|---------------------|----------------|
| Wonder Cubs | 1.5 seconds | 3 seconds |
| Curious Explorers | 2 seconds | 4 seconds |
| Mind Masters | 2.5 seconds | 5 seconds |

**Optimization Strategies:**
- Streaming responses (show text as it generates)
- Pre-generate likely follow-up responses
- Cache common topic introductions
- Use faster model (Haiku) for simple acknowledgments

---

## 3. Knowledge Constellation

### 3.1 Overview

A visual, interactive map showing topics as stars in a night sky. Topics are connected by lines showing relationships. Children explore by tapping stars and watching their constellation grow.

### 3.2 Visual Design

```
         ★ Space (Unlocked, Depth 3)
        ╱│╲
       ╱ │ ╲
      ╱  │  ╲
     ★   ★   ◯
  Planets Stars  Black Holes
  (D2)   (D1)   (Locked)
     ╲   │   ╱
      ╲  │  ╱
       ╲ │ ╱
         ★ Physics (Unlocked, D1)
         │
         │
         ★ Energy (Locked - needs Physics D2)
```

**Visual States:**
| State | Appearance |
|-------|------------|
| Locked | Dim, grey, "?" icon, no label |
| Unlockable | Pulsing glow, "!" icon, partial label |
| Unlocked | Full brightness, colored icon, full label |
| Explored | Bright glow, depth badge, full label |
| Mastered | Golden glow, crown icon, achievement border |

### 3.3 Topic Hierarchy

```yaml
categories:
  science:
    topics:
      - name: Space
        subtopics: [Planets, Stars, Moon, Black Holes, Aliens]
        connections: [Physics, Time]

      - name: Physics
        subtopics: [Gravity, Light, Sound, Energy, Motion]
        connections: [Math, Space, Chemistry]

      - name: Nature
        subtopics: [Animals, Plants, Weather, Oceans, Ecosystems]
        connections: [Biology, Geography]

      - name: Biology
        subtopics: [Human Body, Cells, DNA, Evolution, Health]
        connections: [Nature, Chemistry]

  humanities:
    topics:
      - name: History
        subtopics: [Ancient, Medieval, Modern, Inventions, Famous People]
        connections: [Geography, Art]

      - name: Geography
        subtopics: [Continents, Countries, Maps, Cultures, Landmarks]
        connections: [History, Nature]

      - name: Philosophy
        subtopics: [Ethics, Logic, Mind, Reality, Happiness]
        connections: [Psychology, Math]
        age_requirement: mind_masters

  creative:
    topics:
      - name: Art
        subtopics: [Drawing, Music, Dance, Stories, Design]
        connections: [History, Math, Psychology]

      - name: Stories
        subtopics: [Heroes, Villains, Adventures, Mysteries, Myths]
        connections: [History, Psychology]

  logic:
    topics:
      - name: Math
        subtopics: [Numbers, Patterns, Shapes, Puzzles, Codes]
        connections: [Physics, Art, Philosophy]

      - name: Puzzles
        subtopics: [Riddles, Logic, Strategy, Memory, Patterns]
        connections: [Math, Psychology]
```

### 3.4 Unlock Mechanics

```python
class UnlockEngine:
    """
    Determines when topics become available.
    """

    def check_unlock_conditions(
        self,
        child: Child,
        topic: Topic
    ) -> UnlockResult:
        """
        Check if a topic should be unlocked.
        """
        # Age requirement
        if topic.min_age_group and child.age_group < topic.min_age_group:
            return UnlockResult(
                unlocked=False,
                reason="AGE_LOCKED",
                message="This topic will unlock when you're older!"
            )

        # Prerequisite topics
        for prereq_id in topic.prerequisites:
            prereq_progress = self.get_progress(child.id, prereq_id)
            if not prereq_progress or prereq_progress.depth < topic.required_depth:
                prereq_topic = self.get_topic(prereq_id)
                return UnlockResult(
                    unlocked=False,
                    reason="PREREQUISITE",
                    message=f"Explore {prereq_topic.name} more to unlock this!",
                    hint_path=[prereq_topic.name, topic.name]
                )

        # Check depth in connected topics
        connected_depth = sum(
            self.get_progress(child.id, t).depth
            for t in topic.connected_topics
            if self.get_progress(child.id, t)
        )

        if connected_depth < topic.connection_depth_required:
            return UnlockResult(
                unlocked=False,
                reason="EXPLORATION",
                message="Keep exploring nearby topics!"
            )

        return UnlockResult(unlocked=True)

    def handle_unlock(self, child: Child, topic: Topic) -> UnlockEvent:
        """
        Process a new topic unlock.
        """
        # Create progress record
        progress = Progress(
            child_id=child.id,
            topic_id=topic.id,
            depth_level=0,
            unlocked_at=datetime.utcnow()
        )
        self.save_progress(progress)

        # Award unlock reward
        reward = Reward(
            child_id=child.id,
            type="TOPIC_UNLOCK",
            reward_id=f"unlock_{topic.id}",
            stars=topic.unlock_stars
        )
        self.award_reward(reward)

        # Trigger unlock animation
        return UnlockEvent(
            topic=topic,
            reward=reward,
            animation="STAR_BURST",
            sound="unlock_chime"
        )
```

### 3.5 Constellation Interaction

**Touch Interactions:**
| Action | Result |
|--------|--------|
| Tap locked star | Show unlock hint |
| Tap unlocked star | Expand star, show "Explore" button |
| Tap "Explore" | Start conversation about topic |
| Pinch | Zoom in/out |
| Drag | Pan across constellation |
| Long press | Show topic details popup |

**Animations:**
- Stars twinkle randomly (subtle)
- Unlockable stars pulse gently
- Connection lines glow when hovering related topics
- New unlocks burst with particle effects
- Depth increases cause star to grow slightly

---

## 4. Daily Brain Sparks

### 4.1 Overview

A daily featured question that draws children back to the app. Different question each day, tailored to age group.

### 4.2 Brain Spark Types

| Type | Description | Age Groups |
|------|-------------|------------|
| Riddle | Classic lateral thinking puzzle | All |
| What If | Hypothetical scenario | All |
| Mystery | Unknown fact to discover | All |
| Challenge | Problem to solve | Explorers, Masters |
| Debate | Two-sided question | Masters only |
| Philosophy | Deep thinking prompt | Masters only |

### 4.3 Generation & Curation

```python
class BrainSparkEngine:
    """
    Manages daily brain spark content.
    """

    # Mix of AI-generated and human-curated
    GENERATION_MIX = {
        "curated": 0.3,      # 30% human-written
        "ai_generated": 0.7  # 70% AI-generated
    }

    def get_daily_spark(
        self,
        date: date,
        age_group: AgeGroup
    ) -> BrainSpark:
        """
        Get the brain spark for a specific date and age group.
        """
        # Check cache first
        cache_key = f"spark:{date}:{age_group}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached

        # Determine if curated or generated
        spark_pool = self.get_curated_sparks(date, age_group)

        if spark_pool:
            spark = random.choice(spark_pool)
        else:
            spark = self.generate_spark(date, age_group)

        # Cache for 24 hours
        self.cache.set(cache_key, spark, ttl=86400)
        return spark

    def generate_spark(
        self,
        date: date,
        age_group: AgeGroup
    ) -> BrainSpark:
        """
        Use AI to generate a unique brain spark.
        """
        # Select type based on age group
        spark_type = self.select_spark_type(age_group)

        # Generate with AI
        prompt = self.build_generation_prompt(spark_type, age_group)
        raw_spark = self.ai_client.generate(prompt)

        # Validate and format
        validated = self.validate_spark(raw_spark, age_group)

        return BrainSpark(
            type=spark_type,
            question=validated.question,
            hints=validated.hints,
            follow_ups=validated.follow_ups,
            age_group=age_group,
            date=date
        )
```

### 4.4 Delivery & Timing

**Push Notification Schedule:**
| Age Group | Default Time | Rationale |
|-----------|--------------|-----------|
| Wonder Cubs | 4:00 PM | After nap, before dinner |
| Curious Explorers | 4:30 PM | After school |
| Mind Masters | 5:00 PM | Homework break |

**Notification Content:**
```
🌟 Your Daily Brain Spark is ready!

"If you could shrink to the size of an ant,
 what would be the scariest thing in your house?"

Tap to explore →
```

### 4.5 Brain Spark UI Flow

```
1. App Open / Notification Tap
   └── Animated reveal (envelope opening / star burst)

2. Brain Spark Display
   ├── Large, centered question text
   ├── Age-appropriate mascot reaction
   └── "Let's Think!" button

3. Interaction
   ├── Child responds (choice or text)
   └── AI engages with follow-ups

4. Completion
   ├── Streak counter increments
   ├── Stars awarded
   └── Option to explore related topic

5. Already Completed Today
   ├── "Great job today! 🌟"
   ├── Countdown to next spark
   └── Suggest constellation exploration
```

---

## 5. Engagement & Gamification

### 5.1 Streak System

**Definition:** Consecutive days with meaningful engagement (complete Brain Spark OR 5+ minutes of conversation).

**Streak Mechanics:**
```python
class StreakManager:
    GRACE_PERIOD_HOURS = 36  # Allow some forgiveness

    def update_streak(self, child_id: str) -> StreakUpdate:
        streak = self.get_streak(child_id)
        today = date.today()

        if streak.last_activity_date == today:
            # Already counted today
            return StreakUpdate(changed=False, current=streak.current)

        days_since_last = (today - streak.last_activity_date).days

        if days_since_last == 1:
            # Perfect continuation
            streak.current += 1
            streak.longest = max(streak.longest, streak.current)
        elif days_since_last == 2 and self.has_streak_freeze(child_id):
            # Used streak freeze
            streak.current += 1
            self.consume_streak_freeze(child_id)
        else:
            # Streak broken
            streak.current = 1

        streak.last_activity_date = today
        self.save_streak(streak)

        return StreakUpdate(
            changed=True,
            current=streak.current,
            longest=streak.longest,
            milestone=self.check_milestone(streak.current)
        )
```

**Streak Milestones & Rewards:**
| Streak | Reward |
|--------|--------|
| 3 days | "Spark Starter" badge |
| 7 days | 10 bonus stars + streak freeze |
| 14 days | "Two-Week Wonder" badge |
| 30 days | Special constellation theme + 50 stars |
| 100 days | "Century Thinker" badge + unique avatar |
| 365 days | "Year of Wonder" trophy + lifetime badge |

### 5.2 Star Currency

**Earning Stars:**
| Activity | Stars |
|----------|-------|
| Complete Brain Spark | 5 |
| Reach new depth level | 10 |
| Unlock new topic | 15 |
| Complete streak milestone | Varies |
| Cross-topic connection | 20 |
| First-time badge | 25 |

**Spending Stars:**
| Item | Cost |
|------|------|
| New avatar accessory | 50 |
| Constellation theme | 100 |
| Mascot costume | 200 |
| Special sound effects | 75 |
| Profile border | 150 |

### 5.3 Badge System

**Badge Categories:**

**Exploration Badges:**
- Topic Pioneer (first to explore 10 topics)
- Deep Diver (reach depth 10 in any topic)
- Connector (find 5 cross-topic connections)
- Galaxy Brain (unlock all topics in a category)

**Thinking Badges:**
- Question Master (ask 100 follow-up questions)
- Original Thinker (use free-form input 20 times)
- Perspective Shifter (explore both sides of 5 debates)
- Philosophy Friend (complete 10 philosophy sessions)

**Consistency Badges:**
- Rising Star (first streak)
- Steady Thinker (30-day streak)
- Unbreakable (100-day streak)
- Legendary (365-day streak)

### 5.4 "Aha!" Moment Detection

```python
class AhaMomentDetector:
    """
    Detect when a child has a breakthrough understanding.
    """

    INDICATORS = [
        "oh!",
        "i get it",
        "so that's why",
        "wait, so",
        "that makes sense",
        "i never thought of it that way",
        "mind = blown"
    ]

    def detect_aha(self, message: str, context: ConversationContext) -> bool:
        # Check for explicit indicators
        message_lower = message.lower()
        for indicator in self.INDICATORS:
            if indicator in message_lower:
                return True

        # Check for depth jump (answered advanced question correctly)
        if context.depth_increased and context.correct_reasoning:
            return True

        # Check for novel connection
        if self.made_unexpected_connection(message, context):
            return True

        return False

    def trigger_aha_celebration(self, child_id: str) -> AhaEvent:
        """
        Trigger celebration when aha moment detected.
        """
        return AhaEvent(
            child_id=child_id,
            animation="LIGHTBULB_BURST",
            sound="aha_chime",
            message="💡 AHA! You just had a Brain Spark!",
            bonus_stars=5
        )
```

---

## 6. Parent Dashboard

### 6.1 Overview

A dedicated interface for parents to monitor their children's activity, progress, and cognitive development.

### 6.2 Dashboard Sections

#### 6.2.1 Activity Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  This Week's Activity - Emma                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Time Spent           Topics Explored       Current Streak      │
│  ┌───────────┐       ┌───────────┐         ┌───────────┐       │
│  │  2h 34m   │       │     5     │         │  12 days  │       │
│  │  ↑ 15%    │       │  ↑ 2 new  │         │    🔥     │       │
│  └───────────┘       └───────────┘         └───────────┘       │
│                                                                  │
│  Daily Activity                                                  │
│  Mon  Tue  Wed  Thu  Fri  Sat  Sun                              │
│   █    █    █    ░    █    █    ░                               │
│  20m  35m  45m   -   30m  24m   -                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 6.2.2 Topic Exploration

```
┌─────────────────────────────────────────────────────────────────┐
│  Topics This Week                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🌟 Space (Depth 4)                              45 min         │
│     ████████████████████████░░░░░░░░                            │
│     "How do rockets escape Earth's gravity?"                     │
│                                                                  │
│  🦕 Dinosaurs (Depth 2)                          20 min         │
│     ████████████░░░░░░░░░░░░░░░░░░░░                            │
│     "What if dinosaurs were still alive?"                        │
│                                                                  │
│  🧩 Puzzles (NEW!)                               15 min         │
│     ██████░░░░░░░░░░░░░░░░░░░░░░░░░░                            │
│     Started exploring logic riddles                              │
│                                                                  │
│  [View All Topics →]                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 6.2.3 Thinking Skills Progress

```
┌─────────────────────────────────────────────────────────────────┐
│  Cognitive Growth Areas                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Critical Thinking     ████████████████░░░░  80%                │
│  Asks "why" and "how" questions frequently                       │
│                                                                  │
│  Creative Thinking     ██████████████░░░░░░  70%                │
│  Imagines alternative scenarios                                  │
│                                                                  │
│  Logical Reasoning     ████████████░░░░░░░░  60%                │
│  Following cause and effect chains                               │
│                                                                  │
│  Knowledge Connection  ████████░░░░░░░░░░░░  40%                │
│  Starting to link different topics                               │
│                                                                  │
│  ℹ️ Based on conversation analysis. Not a formal assessment.     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 6.2.4 Conversation History

```
┌─────────────────────────────────────────────────────────────────┐
│  Recent Conversations                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📅 Today, 4:32 PM - Space                                      │
│  ├─ Child: "Why do astronauts float in space?"                  │
│  ├─ Sparkle: "Great question! It's not because..."              │
│  └─ [View Full Conversation]                                     │
│                                                                  │
│  📅 Yesterday, 5:15 PM - Dinosaurs                              │
│  ├─ Child: "Were T-Rex really scary?"                           │
│  ├─ Sparkle: "T-Rex was definitely powerful..."                 │
│  └─ [View Full Conversation]                                     │
│                                                                  │
│  [View All Conversations]                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Parental Controls

| Setting | Options | Default |
|---------|---------|---------|
| Daily time limit | 15min - Unlimited | 1 hour |
| Session reminders | 15, 30, 45 min | 30 min |
| Bedtime mode | Set quiet hours | 8 PM - 7 AM |
| Topic restrictions | Block specific topics | None |
| Conversation logs | View/Download/Delete | Enabled |
| Data sharing | Analytics opt-in | Opted out |

### 6.4 Safety Alerts

Parents receive alerts for:
- Potential PII shared (name, address, etc.)
- Unusual conversation patterns
- Multiple failed safety filter triggers
- Requests to talk about restricted topics

---

## 7. User Authentication

### 7.1 Account Types

| Account Type | Capabilities |
|--------------|-------------|
| Parent | Full access, manage children, billing, settings |
| Child | Conversation, constellation, rewards (no settings) |
| Guest | Limited trial (3 conversations, no progress save) |

### 7.2 Registration Flow

```
1. Landing Page
   └── [Start Free Trial] or [Sign In]

2. Account Creation (Parent)
   ├── Email + Password
   │   └── Email verification required
   └── OAuth (Google/Apple)
       └── Immediate access

3. COPPA Consent
   ├── Explain data collection
   ├── Require checkbox acknowledgment
   └── Store consent record with timestamp

4. Add Child Profile
   ├── Child's first name
   ├── Birth date (for age group)
   ├── Choose avatar
   └── Optional: select interests

5. Child PIN Setup (Optional)
   ├── 4-digit PIN for profile switching
   └── Prevents siblings from accessing each other

6. Onboarding Complete
   └── First Brain Spark presented
```

### 7.3 Session Management

```python
class SessionManager:
    SESSION_DURATION = timedelta(days=7)
    CHILD_SESSION_DURATION = timedelta(hours=24)

    def create_session(self, user: User) -> Session:
        """
        Create new authenticated session.
        """
        session = Session(
            id=generate_session_id(),
            user_id=user.id,
            user_type=user.type,
            created_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + self.get_duration(user),
            active_child_id=None
        )

        # Store in Redis
        self.cache.set(
            f"session:{session.id}",
            session.dict(),
            ttl=self.get_duration(user).total_seconds()
        )

        return session

    def switch_child(self, session_id: str, child_id: str, pin: str = None) -> bool:
        """
        Switch active child profile within session.
        """
        session = self.get_session(session_id)
        child = self.get_child(child_id)

        # Verify parent owns child
        if child.parent_id != session.user_id:
            raise UnauthorizedError("Not your child profile")

        # Verify PIN if set
        if child.pin_hash and not verify_pin(pin, child.pin_hash):
            raise UnauthorizedError("Incorrect PIN")

        session.active_child_id = child_id
        self.update_session(session)

        return True
```

---

## 8. Content Types

### 8.1 Lateral Thinking Riddles

**Structure:**
```yaml
riddle:
  setup: "A man walks into a restaurant and orders a steak."
  mystery: "After one bite, he leaves and never comes back. Why?"
  hints:
    - level_1: "Think about where else you might eat steak."
    - level_2: "The man had eaten this exact dish before."
    - level_3: "Something happened to someone he knew."
  answer: "He was a castaway who had been told he was eating 'albatross' - realizing it wasn't, he understood his friend had been killed for food."
  age_appropriate: mind_masters
  follow_ups:
    - "What would you do in that situation?"
    - "How do our past experiences change how we see things?"
```

### 8.2 "What If" Scenarios

**Examples by Age:**

**Wonder Cubs:**
- "What if dogs could talk? What would your dog say?"
- "What if you woke up with wings?"
- "What if ice cream was healthy and vegetables were treats?"

**Curious Explorers:**
- "What if gravity worked sideways?"
- "What if you could see sounds as colors?"
- "What if dinosaurs never went extinct?"

**Mind Masters:**
- "What if everyone could read minds? Would lying be possible?"
- "What if we could live forever? Would you want to?"
- "What if you discovered your whole life was a simulation?"

### 8.3 Philosophy Questions (Mind Masters)

**Categories:**
- **Ethics:** "Is it ever okay to lie to protect someone?"
- **Identity:** "If you replaced every cell in your body, would you still be you?"
- **Knowledge:** "How do you know anything is real?"
- **Happiness:** "Can you choose to be happy?"
- **Justice:** "Is revenge ever justified?"

### 8.4 Story Adventures

**Structure:**
```yaml
adventure:
  title: "The Mysterious Cave"
  genre: mystery
  age_group: curious_explorers

  opening: |
    You're exploring a forest when you discover a cave entrance
    hidden behind a waterfall. A faint blue glow comes from inside.

  branches:
    enter_carefully:
      text: "Sneak in quietly to investigate"
      leads_to: cave_interior_stealth

    call_for_help:
      text: "Go back and get an adult"
      leads_to: return_with_adult

    throw_rock:
      text: "Throw a rock inside first"
      leads_to: cave_reaction

  nodes:
    cave_interior_stealth:
      text: |
        You tiptoe inside. The blue glow comes from strange
        mushrooms growing on the walls. You hear a soft humming.
      branches:
        - touch_mushroom: "Touch one of the glowing mushrooms"
        - follow_sound: "Follow the humming sound deeper"
        - collect_sample: "Carefully pick a mushroom to study later"
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-15 | BrainSpark Team | Initial document |

---

*Previous Document: [03-TECHNICAL-ARCHITECTURE.md](./03-TECHNICAL-ARCHITECTURE.md)*
*Next Document: [05-UI-UX-DESIGN.md](../design/05-UI-UX-DESIGN.md)*
