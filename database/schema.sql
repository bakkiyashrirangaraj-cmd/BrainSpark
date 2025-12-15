-- ============================================================
-- BrainSpark Database Schema
-- PostgreSQL
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE - Parents and Children
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'parent' CHECK (role IN ('parent', 'child', 'admin')),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_parent_id ON users(parent_id);

-- ============================================================
-- CHILD PROFILES - Extended info for child accounts
-- ============================================================
CREATE TABLE child_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    age_group VARCHAR(20) DEFAULT 'explorers' CHECK (age_group IN ('cubs', 'explorers', 'masters')),
    avatar VARCHAR(10) DEFAULT '🧒',
    display_name VARCHAR(50),
    
    -- Gamification stats
    stars INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    total_deep_dives INTEGER DEFAULT 0,
    
    -- Activity tracking
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    streak_last_updated DATE DEFAULT CURRENT_DATE,
    
    -- JSON fields for flexible data
    achievements JSONB DEFAULT '[]'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_child_profiles_user_id ON child_profiles(user_id);

-- ============================================================
-- TOPICS - Available learning topics
-- ============================================================
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    description TEXT,
    color_gradient VARCHAR(100),
    starter_prompt TEXT,
    difficulty_base INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default topics
INSERT INTO topics (name, emoji, description, color_gradient, starter_prompt, sort_order) VALUES
('Space', '🌌', 'Explore the vast universe', 'from-blue-500 to-purple-600', 'The universe is incredibly vast! What aspect of space fascinates you most?', 1),
('Physics', '⚛️', 'Discover how everything works', 'from-cyan-400 to-blue-500', 'Physics explains how everything in the universe works! What mystery would you like to solve?', 2),
('Nature', '🌿', 'Uncover secrets of the natural world', 'from-green-400 to-emerald-600', 'Nature is full of incredible secrets! What living thing amazes you the most?', 3),
('Math', '🔢', 'The language of the universe', 'from-yellow-400 to-orange-500', 'Math is the language of the universe! Ready to discover some number magic?', 4),
('Animals', '🦁', 'Amazing creatures and superpowers', 'from-orange-400 to-red-500', 'Animals have superpowers humans can only dream of! Which animal ability would you want?', 5),
('Music', '🎵', 'The magic of sound and rhythm', 'from-pink-400 to-purple-500', 'Music is vibrations that make us feel emotions! How does that even work?', 6),
('History', '🏛️', 'Adventures through time', 'from-amber-500 to-yellow-600', 'History is full of mysteries and adventures! What time period would you visit?', 7),
('Ocean', '🌊', 'Mysteries of the deep', 'from-blue-400 to-cyan-600', 'We know more about space than our own oceans! What lurks in the deep?', 8);

-- ============================================================
-- TOPIC PROGRESS - Child's progress in each topic
-- ============================================================
CREATE TABLE topic_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    
    level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    questions_asked INTEGER DEFAULT 0,
    max_depth_reached INTEGER DEFAULT 0,
    
    unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    last_visited TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Track specific achievements per topic
    topic_achievements JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(child_id, topic_id)
);

CREATE INDEX idx_topic_progress_child ON topic_progress(child_id);
CREATE INDEX idx_topic_progress_topic ON topic_progress(topic_id);

-- ============================================================
-- CONVERSATIONS - Chat sessions
-- ============================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id),
    
    title VARCHAR(200),
    depth_reached INTEGER DEFAULT 0,
    stars_earned INTEGER DEFAULT 0,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_conversations_child ON conversations(child_id);
CREATE INDEX idx_conversations_topic ON conversations(topic_id);
CREATE INDEX idx_conversations_active ON conversations(child_id, is_active);

-- ============================================================
-- MESSAGES - Individual chat messages
-- ============================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    
    -- Message analytics
    word_count INTEGER,
    thinking_depth INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(conversation_id, created_at);

-- ============================================================
-- DAILY ACTIVITY - Daily tracking for streaks & analytics
-- ============================================================
CREATE TABLE daily_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    questions_asked INTEGER DEFAULT 0,
    stars_earned INTEGER DEFAULT 0,
    max_depth_reached INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    
    topics_explored JSONB DEFAULT '[]'::jsonb,
    achievements_unlocked JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(child_id, activity_date)
);

CREATE INDEX idx_daily_activity_child_date ON daily_activity(child_id, activity_date);

-- ============================================================
-- ACHIEVEMENTS - Achievement definitions
-- ============================================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    emoji VARCHAR(10),
    
    -- Unlock conditions (JSONB for flexibility)
    unlock_conditions JSONB NOT NULL,
    stars_reward INTEGER DEFAULT 10,
    
    category VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default achievements
INSERT INTO achievements (code, name, description, emoji, unlock_conditions, stars_reward, category) VALUES
('first_spark', 'First Spark', 'Ask your first question', '✨', '{"questions_asked": 1}', 10, 'beginner'),
('curious_mind', 'Curious Mind', 'Ask 10 questions', '🤔', '{"questions_asked": 10}', 25, 'beginner'),
('deep_thinker', 'Deep Thinker', 'Go 5 questions deep in a conversation', '🌀', '{"depth_reached": 5}', 50, 'depth'),
('philosophy_pro', 'Philosophy Pro', 'Go 10 questions deep', '🧠', '{"depth_reached": 10}', 100, 'depth'),
('week_warrior', 'Week Warrior', 'Maintain a 7-day streak', '🔥', '{"streak": 7}', 75, 'streak'),
('explorer', 'Explorer', 'Unlock 4 topics', '🗺️', '{"topics_unlocked": 4}', 50, 'exploration'),
('polymath', 'Polymath', 'Unlock all topics', '🎓', '{"topics_unlocked": 8}', 200, 'exploration'),
('century', 'Century', 'Ask 100 questions', '💯', '{"questions_asked": 100}', 150, 'milestone');

-- ============================================================
-- CHILD ACHIEVEMENTS - Track unlocked achievements
-- ============================================================
CREATE TABLE child_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(child_id, achievement_id)
);

CREATE INDEX idx_child_achievements_child ON child_achievements(child_id);

-- ============================================================
-- DAILY CHALLENGES - Daily brain sparks
-- ============================================================
CREATE TABLE daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_date DATE UNIQUE NOT NULL,
    
    topic_id UUID REFERENCES topics(id),
    question TEXT NOT NULL,
    age_group VARCHAR(20),
    
    stars_reward INTEGER DEFAULT 20,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_child_profiles_updated_at
    BEFORE UPDATE ON child_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_topic_progress_updated_at
    BEFORE UPDATE ON topic_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_daily_activity_updated_at
    BEFORE UPDATE ON daily_activity
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to update streak
CREATE OR REPLACE FUNCTION update_streak(p_child_id UUID)
RETURNS void AS $$
DECLARE
    v_last_date DATE;
    v_current_streak INTEGER;
BEGIN
    SELECT streak_last_updated, streak 
    INTO v_last_date, v_current_streak
    FROM child_profiles WHERE id = p_child_id;
    
    IF v_last_date = CURRENT_DATE - 1 THEN
        -- Continue streak
        UPDATE child_profiles 
        SET streak = streak + 1,
            longest_streak = GREATEST(longest_streak, streak + 1),
            streak_last_updated = CURRENT_DATE
        WHERE id = p_child_id;
    ELSIF v_last_date < CURRENT_DATE - 1 THEN
        -- Reset streak
        UPDATE child_profiles 
        SET streak = 1,
            streak_last_updated = CURRENT_DATE
        WHERE id = p_child_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- VIEWS
-- ============================================================

-- Child dashboard view
CREATE VIEW child_dashboard AS
SELECT 
    cp.id as child_id,
    u.name,
    cp.age_group,
    cp.avatar,
    cp.stars,
    cp.streak,
    cp.total_questions,
    COUNT(DISTINCT tp.topic_id) FILTER (WHERE tp.unlocked) as topics_unlocked,
    COUNT(DISTINCT ca.achievement_id) as achievements_count,
    MAX(c.depth_reached) as max_depth_ever
FROM child_profiles cp
JOIN users u ON u.id = cp.user_id
LEFT JOIN topic_progress tp ON tp.child_id = cp.id
LEFT JOIN child_achievements ca ON ca.child_id = cp.id
LEFT JOIN conversations c ON c.child_id = cp.id
GROUP BY cp.id, u.name;

-- Weekly activity view
CREATE VIEW weekly_activity AS
SELECT 
    child_id,
    activity_date,
    questions_asked,
    stars_earned,
    max_depth_reached
FROM daily_activity
WHERE activity_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY child_id, activity_date;
