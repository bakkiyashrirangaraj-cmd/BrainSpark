# ============================================================
# BrainSpark Gamification Engine
# app/services/gamification.py
# ============================================================

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Callable
from enum import Enum
from datetime import datetime, timedelta
import random
import math

# ============================================================
# ENUMS & TYPES
# ============================================================

class Rarity(Enum):
    COMMON = "common"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"

class RewardType(Enum):
    STARS = "stars"
    XP = "xp"
    BADGE = "badge"
    POWER_UP = "power_up"
    COSMETIC = "cosmetic"
    TOPIC_UNLOCK = "topic_unlock"

# ============================================================
# DATA CLASSES
# ============================================================

@dataclass
class Achievement:
    id: str
    name: str
    description: str
    emoji: str
    rarity: Rarity
    stars_reward: int
    xp_reward: int
    condition: Dict  # JSON condition for evaluation
    secret: bool = False  # Hidden until unlocked
    
@dataclass
class Badge:
    id: str
    name: str
    emoji: str
    rarity: Rarity
    description: str
    obtained_at: Optional[datetime] = None

@dataclass
class PowerUp:
    id: str
    name: str
    emoji: str
    description: str
    duration_minutes: int
    effect: Dict  # {"type": "star_multiplier", "value": 2}
    cost_stars: int

@dataclass
class DailyChallenge:
    id: str
    topic: str
    question: str
    emoji: str
    stars_reward: int
    xp_reward: int
    expires_at: datetime
    completed: bool = False

@dataclass
class Level:
    number: int
    name: str
    xp_required: int
    rewards: List[Dict]
    badge: Optional[Badge] = None

@dataclass
class LeaderboardEntry:
    child_id: str
    name: str
    avatar: str
    stars: int
    streak: int
    rank: int

# ============================================================
# ACHIEVEMENT DEFINITIONS
# ============================================================

ACHIEVEMENTS = [
    # Beginner Achievements
    Achievement("first_spark", "First Spark", "Ask your very first question", "✨", Rarity.COMMON, 10, 50, {"questions_asked": 1}),
    Achievement("curious_5", "Curious Mind", "Ask 5 questions", "🤔", Rarity.COMMON, 25, 100, {"questions_asked": 5}),
    Achievement("curious_25", "Question Machine", "Ask 25 questions", "❓", Rarity.RARE, 75, 300, {"questions_asked": 25}),
    Achievement("curious_100", "Curiosity Champion", "Ask 100 questions", "🏆", Rarity.EPIC, 200, 1000, {"questions_asked": 100}),
    Achievement("curious_500", "Knowledge Seeker", "Ask 500 questions", "📚", Rarity.LEGENDARY, 500, 5000, {"questions_asked": 500}),
    
    # Depth Achievements
    Achievement("deep_3", "Diving In", "Go 3 questions deep", "🏊", Rarity.COMMON, 15, 75, {"max_depth": 3}),
    Achievement("deep_5", "Deep Thinker", "Go 5 questions deep", "🌀", Rarity.RARE, 50, 200, {"max_depth": 5}),
    Achievement("deep_10", "Philosophy Pro", "Go 10 questions deep", "🧠", Rarity.EPIC, 100, 500, {"max_depth": 10}),
    Achievement("deep_20", "Mind Explorer", "Go 20 questions deep", "🔮", Rarity.LEGENDARY, 300, 1500, {"max_depth": 20}),
    
    # Streak Achievements
    Achievement("streak_3", "Getting Started", "3 day streak", "🔥", Rarity.COMMON, 30, 100, {"streak": 3}),
    Achievement("streak_7", "Week Warrior", "7 day streak", "⚡", Rarity.RARE, 75, 300, {"streak": 7}),
    Achievement("streak_30", "Monthly Master", "30 day streak", "🌟", Rarity.EPIC, 300, 1500, {"streak": 30}),
    Achievement("streak_100", "Unstoppable", "100 day streak", "💎", Rarity.LEGENDARY, 1000, 5000, {"streak": 100}),
    
    # Topic Achievements
    Achievement("explorer_4", "Explorer", "Explore 4 different topics", "🗺️", Rarity.COMMON, 50, 200, {"topics_explored": 4}),
    Achievement("explorer_8", "Adventurer", "Explore 8 different topics", "🧭", Rarity.RARE, 100, 500, {"topics_explored": 8}),
    Achievement("polymath", "Polymath", "Explore all topics", "🎓", Rarity.LEGENDARY, 500, 2000, {"topics_explored": 10}),
    
    # Star Achievements
    Achievement("star_100", "Rising Star", "Earn 100 stars", "⭐", Rarity.COMMON, 25, 100, {"stars": 100}),
    Achievement("star_500", "Superstar", "Earn 500 stars", "🌟", Rarity.RARE, 75, 300, {"stars": 500}),
    Achievement("star_2000", "Galaxy Brain", "Earn 2000 stars", "🌌", Rarity.EPIC, 200, 1000, {"stars": 2000}),
    Achievement("star_10000", "Universal Mind", "Earn 10000 stars", "🪐", Rarity.LEGENDARY, 1000, 5000, {"stars": 10000}),
    
    # Special Achievements
    Achievement("night_owl", "Night Owl", "Ask a question after 10 PM", "🦉", Rarity.RARE, 50, 200, {"special": "night_owl"}, secret=True),
    Achievement("early_bird", "Early Bird", "Ask a question before 7 AM", "🐦", Rarity.RARE, 50, 200, {"special": "early_bird"}, secret=True),
    Achievement("weekend_warrior", "Weekend Warrior", "Complete a challenge on weekend", "🎮", Rarity.COMMON, 30, 100, {"special": "weekend"}),
    Achievement("speed_demon", "Speed Demon", "Ask 10 questions in 5 minutes", "⚡", Rarity.EPIC, 100, 500, {"special": "speed_demon"}, secret=True),
    Achievement("perfect_week", "Perfect Week", "Complete daily challenges for 7 days", "💯", Rarity.EPIC, 200, 1000, {"daily_challenges_streak": 7}),
]

# ============================================================
# LEVEL SYSTEM
# ============================================================

LEVELS = [
    Level(1, "Curious Cub", 0, [{"type": "badge", "id": "newbie"}]),
    Level(2, "Wonder Seeker", 100, [{"type": "stars", "amount": 20}]),
    Level(3, "Question Asker", 250, [{"type": "power_up", "id": "star_boost"}]),
    Level(4, "Mind Explorer", 500, [{"type": "topic_unlock", "topic": "Animals"}]),
    Level(5, "Deep Diver", 800, [{"type": "badge", "id": "diver"}, {"type": "stars", "amount": 50}]),
    Level(6, "Thought Pioneer", 1200, [{"type": "power_up", "id": "xp_boost"}]),
    Level(7, "Knowledge Hunter", 1800, [{"type": "topic_unlock", "topic": "Music"}]),
    Level(8, "Wisdom Seeker", 2500, [{"type": "badge", "id": "wise"}]),
    Level(9, "Brain Champion", 3500, [{"type": "power_up", "id": "streak_shield"}]),
    Level(10, "Mind Master", 5000, [{"type": "badge", "id": "master"}, {"type": "stars", "amount": 200}]),
    Level(11, "Philosophy Sage", 7000, [{"type": "topic_unlock", "topic": "History"}]),
    Level(12, "Universe Explorer", 9500, [{"type": "badge", "id": "explorer"}]),
    Level(13, "Cosmic Thinker", 12500, [{"type": "power_up", "id": "mega_boost"}]),
    Level(14, "Galaxy Brain", 16000, [{"type": "topic_unlock", "topic": "Ocean"}]),
    Level(15, "Legendary Mind", 20000, [{"type": "badge", "id": "legend"}, {"type": "stars", "amount": 500}]),
]

# ============================================================
# POWER-UPS
# ============================================================

POWER_UPS = [
    PowerUp("star_boost", "Star Boost", "⭐", "Double stars for 30 minutes", 30, {"type": "star_multiplier", "value": 2}, 100),
    PowerUp("xp_boost", "XP Surge", "📈", "50% more XP for 1 hour", 60, {"type": "xp_multiplier", "value": 1.5}, 150),
    PowerUp("streak_shield", "Streak Shield", "🛡️", "Protect your streak for 1 day", 1440, {"type": "streak_protection", "value": 1}, 200),
    PowerUp("mega_boost", "Mega Boost", "🚀", "Triple rewards for 15 minutes", 15, {"type": "all_multiplier", "value": 3}, 300),
    PowerUp("hint_helper", "Hint Helper", "💡", "Get helpful hints in conversations", 60, {"type": "hints_enabled", "value": True}, 75),
    PowerUp("topic_preview", "Topic Preview", "🔮", "Preview locked topics for 30 min", 30, {"type": "topic_preview", "value": True}, 125),
]

# ============================================================
# GAMIFICATION ENGINE CLASS
# ============================================================

class GamificationEngine:
    """Core gamification logic for BrainSpark"""
    
    def __init__(self, db_session):
        self.db = db_session
        
    # -------------------- XP & LEVELS --------------------
    
    def calculate_level(self, total_xp: int) -> tuple[Level, int, int]:
        """Returns (current_level, xp_in_level, xp_to_next)"""
        current_level = LEVELS[0]
        next_level = LEVELS[1] if len(LEVELS) > 1 else None
        
        for i, level in enumerate(LEVELS):
            if total_xp >= level.xp_required:
                current_level = level
                next_level = LEVELS[i + 1] if i + 1 < len(LEVELS) else None
            else:
                break
        
        xp_in_level = total_xp - current_level.xp_required
        xp_to_next = (next_level.xp_required - current_level.xp_required) if next_level else 0
        
        return current_level, xp_in_level, xp_to_next
    
    def award_xp(self, child_id: str, amount: int, source: str) -> dict:
        """Award XP and check for level up"""
        child = self.get_child(child_id)
        old_level, _, _ = self.calculate_level(child.total_xp)
        
        # Apply multipliers from active power-ups
        multiplier = self.get_active_multiplier(child_id, "xp")
        final_amount = int(amount * multiplier)
        
        child.total_xp += final_amount
        new_level, xp_in_level, xp_to_next = self.calculate_level(child.total_xp)
        
        result = {
            "xp_earned": final_amount,
            "total_xp": child.total_xp,
            "level": new_level.number,
            "level_name": new_level.name,
            "xp_in_level": xp_in_level,
            "xp_to_next": xp_to_next,
            "leveled_up": False,
            "rewards": []
        }
        
        # Check for level up
        if new_level.number > old_level.number:
            result["leveled_up"] = True
            result["rewards"] = self.process_level_rewards(child_id, new_level)
        
        self.db.commit()
        return result
    
    # -------------------- STARS --------------------
    
    def award_stars(self, child_id: str, amount: int, source: str) -> dict:
        """Award stars with multiplier support"""
        child = self.get_child(child_id)
        multiplier = self.get_active_multiplier(child_id, "star")
        final_amount = int(amount * multiplier)
        
        child.stars += final_amount
        self.db.commit()
        
        # Check star-based achievements
        self.check_achievements(child_id)
        
        return {
            "stars_earned": final_amount,
            "total_stars": child.stars,
            "multiplier_active": multiplier > 1
        }
    
    # -------------------- STREAKS --------------------
    
    def update_streak(self, child_id: str) -> dict:
        """Update daily streak"""
        child = self.get_child(child_id)
        today = datetime.utcnow().date()
        last_active = child.streak_last_updated
        
        result = {"streak": child.streak, "streak_increased": False, "streak_lost": False}
        
        if last_active == today:
            return result  # Already active today
        
        yesterday = today - timedelta(days=1)
        
        if last_active == yesterday:
            # Continue streak
            child.streak += 1
            child.longest_streak = max(child.longest_streak, child.streak)
            result["streak_increased"] = True
        elif self.has_active_power_up(child_id, "streak_shield"):
            # Streak shield protects
            result["shield_used"] = True
            self.consume_power_up(child_id, "streak_shield")
        else:
            # Streak broken
            if child.streak > 1:
                result["streak_lost"] = True
                result["lost_streak"] = child.streak
            child.streak = 1
        
        child.streak_last_updated = today
        result["streak"] = child.streak
        
        self.db.commit()
        self.check_achievements(child_id)
        
        return result
    
    # -------------------- ACHIEVEMENTS --------------------
    
    def check_achievements(self, child_id: str) -> List[Achievement]:
        """Check and award any newly earned achievements"""
        child = self.get_child(child_id)
        stats = self.get_child_stats(child_id)
        newly_unlocked = []
        
        for achievement in ACHIEVEMENTS:
            if achievement.id in child.unlocked_achievements:
                continue
            
            if self.evaluate_condition(achievement.condition, stats):
                child.unlocked_achievements.append(achievement.id)
                self.award_stars(child_id, achievement.stars_reward, f"achievement:{achievement.id}")
                self.award_xp(child_id, achievement.xp_reward, f"achievement:{achievement.id}")
                newly_unlocked.append(achievement)
        
        self.db.commit()
        return newly_unlocked
    
    def evaluate_condition(self, condition: dict, stats: dict) -> bool:
        """Evaluate achievement condition against player stats"""
        for key, required_value in condition.items():
            if key == "special":
                return self.check_special_condition(required_value, stats)
            
            current_value = stats.get(key, 0)
            if current_value < required_value:
                return False
        return True
    
    def check_special_condition(self, condition: str, stats: dict) -> bool:
        """Check special achievement conditions"""
        now = datetime.utcnow()
        
        if condition == "night_owl":
            return now.hour >= 22 or now.hour < 4
        elif condition == "early_bird":
            return 5 <= now.hour < 7
        elif condition == "weekend":
            return now.weekday() >= 5
        elif condition == "speed_demon":
            return stats.get("questions_last_5_min", 0) >= 10
        
        return False
    
    # -------------------- DAILY CHALLENGES --------------------
    
    def get_daily_challenge(self, child_id: str) -> DailyChallenge:
        """Get or generate today's daily challenge"""
        today = datetime.utcnow().date()
        seed = int(today.strftime("%Y%m%d"))
        random.seed(seed)
        
        challenges = [
            ("Space", "If aliens visited Earth, what would you show them first?", "👽"),
            ("Nature", "Why do you think leaves change color in autumn?", "🍂"),
            ("Physics", "If you could control one force of nature, which would it be?", "⚡"),
            ("Animals", "Design a new animal by combining two existing ones!", "🦄"),
            ("Ocean", "What do you think lives at the very bottom of the ocean?", "🐙"),
            ("Math", "If you had to explain zero to someone, how would you do it?", "🔢"),
            ("History", "What invention from history would you un-invent and why?", "⚙️"),
            ("Music", "If colors had sounds, what would red sound like?", "🎵"),
        ]
        
        topic, question, emoji = random.choice(challenges)
        
        return DailyChallenge(
            id=f"daily_{today.isoformat()}",
            topic=topic,
            question=question,
            emoji=emoji,
            stars_reward=50,
            xp_reward=100,
            expires_at=datetime.combine(today + timedelta(days=1), datetime.min.time())
        )
    
    def complete_daily_challenge(self, child_id: str) -> dict:
        """Mark daily challenge as complete and award rewards"""
        challenge = self.get_daily_challenge(child_id)
        
        stars = self.award_stars(child_id, challenge.stars_reward, "daily_challenge")
        xp = self.award_xp(child_id, challenge.xp_reward, "daily_challenge")
        
        # Update daily challenge streak
        child = self.get_child(child_id)
        child.daily_challenge_streak += 1
        self.db.commit()
        
        achievements = self.check_achievements(child_id)
        
        return {
            "challenge_completed": True,
            "stars": stars,
            "xp": xp,
            "challenge_streak": child.daily_challenge_streak,
            "new_achievements": [a.id for a in achievements]
        }
    
    # -------------------- POWER-UPS --------------------
    
    def purchase_power_up(self, child_id: str, power_up_id: str) -> dict:
        """Purchase and activate a power-up"""
        power_up = next((p for p in POWER_UPS if p.id == power_up_id), None)
        if not power_up:
            return {"success": False, "error": "Power-up not found"}
        
        child = self.get_child(child_id)
        if child.stars < power_up.cost_stars:
            return {"success": False, "error": "Not enough stars"}
        
        child.stars -= power_up.cost_stars
        expires_at = datetime.utcnow() + timedelta(minutes=power_up.duration_minutes)
        
        # Store active power-up
        self.activate_power_up(child_id, power_up, expires_at)
        self.db.commit()
        
        return {
            "success": True,
            "power_up": power_up.name,
            "expires_at": expires_at.isoformat(),
            "remaining_stars": child.stars
        }
    
    def get_active_multiplier(self, child_id: str, multiplier_type: str) -> float:
        """Get current active multiplier for stars/xp"""
        active_power_ups = self.get_active_power_ups(child_id)
        multiplier = 1.0
        
        for pu in active_power_ups:
            effect = pu.get("effect", {})
            if effect.get("type") == f"{multiplier_type}_multiplier":
                multiplier *= effect.get("value", 1)
            elif effect.get("type") == "all_multiplier":
                multiplier *= effect.get("value", 1)
        
        return multiplier
    
    # -------------------- LEADERBOARD --------------------
    
    def get_leaderboard(self, scope: str = "global", limit: int = 10) -> List[LeaderboardEntry]:
        """Get leaderboard rankings"""
        # In production, this would query the database
        # For now, return sample data structure
        return [
            LeaderboardEntry(
                child_id=f"child_{i}",
                name=f"Player {i}",
                avatar="🧒",
                stars=10000 - (i * 500),
                streak=30 - i,
                rank=i
            )
            for i in range(1, limit + 1)
        ]
    
    # -------------------- QUESTION REWARDS --------------------
    
    def process_question(self, child_id: str, depth: int) -> dict:
        """Process rewards for asking a question"""
        base_stars = 5
        base_xp = 10
        
        # Depth bonus (deeper = more rewards)
        depth_multiplier = 1 + (depth * 0.1)  # 10% more per depth level
        
        stars = self.award_stars(child_id, int(base_stars * depth_multiplier), "question")
        xp = self.award_xp(child_id, int(base_xp * depth_multiplier), "question")
        
        # Update stats
        child = self.get_child(child_id)
        child.total_questions += 1
        child.max_depth = max(child.max_depth, depth)
        self.db.commit()
        
        # Check achievements
        achievements = self.check_achievements(child_id)
        
        return {
            "stars": stars,
            "xp": xp,
            "depth_bonus": depth_multiplier > 1,
            "new_achievements": [a.name for a in achievements]
        }
    
    # -------------------- HELPER METHODS --------------------
    
    def get_child(self, child_id: str):
        """Get child profile from database"""
        # Implementation depends on your ORM
        pass
    
    def get_child_stats(self, child_id: str) -> dict:
        """Get comprehensive stats for achievement checking"""
        child = self.get_child(child_id)
        return {
            "questions_asked": child.total_questions,
            "max_depth": child.max_depth,
            "streak": child.streak,
            "topics_explored": len(child.topics_explored),
            "stars": child.stars,
            "daily_challenges_streak": child.daily_challenge_streak,
        }
    
    def activate_power_up(self, child_id: str, power_up: PowerUp, expires_at: datetime):
        """Store active power-up in database"""
        pass
    
    def get_active_power_ups(self, child_id: str) -> List[dict]:
        """Get list of currently active power-ups"""
        pass
    
    def has_active_power_up(self, child_id: str, power_up_id: str) -> bool:
        """Check if a specific power-up is active"""
        pass
    
    def consume_power_up(self, child_id: str, power_up_id: str):
        """Consume/deactivate a power-up"""
        pass
    
    def process_level_rewards(self, child_id: str, level: Level) -> List[dict]:
        """Process and award level-up rewards"""
        rewards_given = []
        for reward in level.rewards:
            if reward["type"] == "stars":
                self.award_stars(child_id, reward["amount"], f"level_up:{level.number}")
            elif reward["type"] == "topic_unlock":
                self.unlock_topic(child_id, reward["topic"])
            rewards_given.append(reward)
        return rewards_given
    
    def unlock_topic(self, child_id: str, topic: str):
        """Unlock a topic for the child"""
        pass
