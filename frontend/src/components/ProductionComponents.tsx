import { useState, useEffect, useRef } from 'react';
import { chatApi } from '../api/client';

// ============================================================
// CONFIGURATION - Change these for deployment
// ============================================================
const CONFIG = {
  APP_NAME: 'BrainSpark',
  VERSION: '1.0.0',
};

// ============================================================
// COMPONENTS
// ============================================================

// Animated Background
const StarField = ({ density = 50 }) => {
  const stars = Array.from({ length: density }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 3
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            animation: `pulse ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
            opacity: 0.6
          }}
        />
      ))}
    </div>
  );
};

// Floating particles effect
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-purple-400/30 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`
        }}
      />
    ))}
    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
        50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
      }
    `}</style>
  </div>
);

// Loading Spinner
const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizeClasses[size]} border-2 border-white/30 border-t-white rounded-full animate-spin`} />
  );
};

// Achievement Badge
const AchievementBadge = ({ achievement, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
    <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 rounded-3xl animate-bounce">
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-3xl text-center">
        <div className="text-6xl mb-4">{achievement.emoji}</div>
        <h3 className="text-2xl font-bold text-black mb-2">{achievement.title}</h3>
        <p className="text-black/70 mb-4">{achievement.description}</p>
        <div className="text-black font-bold text-xl">+{achievement.stars} ⭐</div>
        <button
          onClick={onClose}
          className="mt-4 bg-black/20 hover:bg-black/30 text-black px-6 py-2 rounded-full transition-colors"
        >
          Awesome!
        </button>
      </div>
    </div>
  </div>
);

// ============================================================
// DATA CONFIGURATION
// ============================================================

const AGE_GROUPS = [
  {
    id: 'cubs',
    name: 'Wonder Cubs',
    age: '4-6 years',
    emoji: '🐻',
    color: 'from-pink-400 to-orange-400',
    description: 'Magical discoveries & gentle puzzles',
    systemPrompt: `You are BrainSpark, talking to a 4-6 year old child.

PERSONALITY: Warm, magical, endlessly patient, celebrates everything
LANGUAGE: Very simple words (1-2 syllables preferred), short sentences, lots of emojis
STYLE: Make everything feel like magic and adventure

RULES:
- Use max 2-3 sentences per response
- Ask ONE simple question at a time
- Use familiar comparisons (animals, toys, family)
- Celebrate every answer with genuine enthusiasm
- If they're wrong, gently redirect without making them feel bad
- Use sound effects and expressions (Wow! Whoosh! Amazing!)

Always end with a simple, engaging question.`
  },
  {
    id: 'explorers',
    name: 'Curious Explorers',
    age: '7-10 years',
    emoji: '🚀',
    color: 'from-cyan-400 to-blue-500',
    description: 'Adventures & mind-bending questions',
    systemPrompt: `You are BrainSpark, talking to a 7-10 year old child.

PERSONALITY: Exciting, adventurous, like a cool science teacher
LANGUAGE: Clear explanations, adventure metaphors, relatable examples
STYLE: Turn learning into exciting discoveries and mysteries to solve

RULES:
- Use analogies from their world (video games, sports, school, movies)
- Challenge them slightly but keep it achievable
- Build on their answers to go deeper
- Use "detective" or "scientist" framing
- Introduce "mind-blowing" facts that make them say "whoa!"

Always end with a thought-provoking question that makes them curious.`
  },
  {
    id: 'masters',
    name: 'Mind Masters',
    age: '11-14 years',
    emoji: '🧠',
    color: 'from-purple-500 to-indigo-600',
    description: 'Deep thinking & philosophy',
    systemPrompt: `You are BrainSpark, talking to an 11-14 year old.

PERSONALITY: Intellectually engaging, treats them as capable thinkers
LANGUAGE: Can handle complexity, introduce proper terminology
STYLE: Socratic method - guide them to discover answers themselves

RULES:
- Ask "why" and "how" questions that require reasoning
- Introduce philosophical angles and ethical considerations
- Connect topics across disciplines
- Challenge assumptions respectfully
- Encourage them to form and defend opinions
- Reference real scientists, thinkers, and discoveries

Always end with a deep question that requires genuine thought.`
  }
];

const TOPICS = [
  { id: 1, name: 'Space', emoji: '🌌', x: 50, y: 12, color: 'from-blue-500 to-purple-600', unlockLevel: 0 },
  { id: 2, name: 'Physics', emoji: '⚛️', x: 20, y: 30, color: 'from-cyan-400 to-blue-500', unlockLevel: 0 },
  { id: 3, name: 'Nature', emoji: '🌿', x: 80, y: 25, color: 'from-green-400 to-emerald-600', unlockLevel: 0 },
  { id: 4, name: 'Math', emoji: '🔢', x: 12, y: 55, color: 'from-yellow-400 to-orange-500', unlockLevel: 0 },
  { id: 5, name: 'Animals', emoji: '🦁', x: 88, y: 50, color: 'from-orange-400 to-red-500', unlockLevel: 5 },
  { id: 6, name: 'Music', emoji: '🎵', x: 35, y: 75, color: 'from-pink-400 to-purple-500', unlockLevel: 5 },
  { id: 7, name: 'History', emoji: '🏛️', x: 65, y: 78, color: 'from-amber-500 to-yellow-600', unlockLevel: 10 },
  { id: 8, name: 'Ocean', emoji: '🌊', x: 50, y: 48, color: 'from-blue-400 to-cyan-600', unlockLevel: 10 },
  { id: 9, name: 'Technology', emoji: '🤖', x: 25, y: 90, color: 'from-gray-400 to-slate-600', unlockLevel: 15 },
  { id: 10, name: 'Art', emoji: '🎨', x: 75, y: 88, color: 'from-rose-400 to-pink-600', unlockLevel: 15 }
];

const ACHIEVEMENTS = [
  { id: 'first_spark', title: 'First Spark', emoji: '✨', description: 'Asked your first question', condition: s => s.totalQuestions >= 1, stars: 10 },
  { id: 'curious_5', title: 'Curious Mind', emoji: '🤔', description: 'Asked 5 questions', condition: s => s.totalQuestions >= 5, stars: 25 },
  { id: 'deep_5', title: 'Deep Thinker', emoji: '🌀', description: 'Went 5 questions deep', condition: s => s.maxDepth >= 5, stars: 50 },
  { id: 'deep_10', title: 'Philosophy Pro', emoji: '🧠', description: 'Went 10 questions deep', condition: s => s.maxDepth >= 10, stars: 100 },
  { id: 'streak_3', title: 'Getting Started', emoji: '🔥', description: '3 day streak', condition: s => s.streak >= 3, stars: 30 },
  { id: 'streak_7', title: 'Week Warrior', emoji: '⚡', description: '7 day streak', condition: s => s.streak >= 7, stars: 75 },
  { id: 'explorer', title: 'Explorer', emoji: '🗺️', description: 'Explored 4 topics', condition: s => s.topicsExplored.length >= 4, stars: 50 },
  { id: 'star_100', title: 'Rising Star', emoji: '🌟', description: 'Earned 100 stars', condition: s => s.stars >= 100, stars: 25 },
  { id: 'star_500', title: 'Superstar', emoji: '💫', description: 'Earned 500 stars', condition: s => s.stars >= 500, stars: 100 }
];

const DAILY_CHALLENGES = [
  { topic: 'Space', question: "If you could send one message to aliens, what would you say?", emoji: '👽' },
  { topic: 'Nature', question: "Why do you think flowers are colorful?", emoji: '🌸' },
  { topic: 'Physics', question: "If gravity disappeared for 10 seconds, what would happen?", emoji: '🎈' },
  { topic: 'Animals', question: "Which animal would make the best president?", emoji: '🦁' },
  { topic: 'Ocean', question: "What creature do you think lives at the deepest part of the ocean?", emoji: '🐙' },
  { topic: 'Math', question: "Why is there no biggest number?", emoji: '♾️' },
  { topic: 'History', question: "If you could have dinner with anyone from history, who would it be?", emoji: '🍽️' }
];

const TOPIC_STARTERS = {
  Space: "🌌 The universe is mind-bogglingly vast! There are more stars than grains of sand on Earth. What aspect of space makes you most curious?",
  Physics: "⚛️ Physics is the rulebook of the universe! Everything from why you don't float away to how your phone works follows these rules. What physics mystery would you like to solve?",
  Nature: "🌿 Nature is the greatest inventor! Every plant and animal has superpowers we're still discovering. What living thing fascinates you most?",
  Math: "🔢 Math is like a secret language that unlocks the universe! Patterns are everywhere once you learn to see them. Ready for some number magic?",
  Animals: "🦁 Animals have abilities that seem like superpowers! Echolocation, regeneration, camouflage... Which animal ability would you want?",
  Music: "🎵 Music is invisible waves that somehow make us feel emotions! How does vibrating air create feelings? Let's explore this mystery!",
  History: "🏛️ History is full of incredible stories - brave explorers, clever inventors, and world-changing ideas. What time period would you visit?",
  Ocean: "🌊 We've explored more of space than our own oceans! The deep sea is full of creatures that look like aliens. What mysteries lurk below?",
  Technology: "🤖 Technology is transforming our world faster than ever! From AI to rockets to tiny chips. What tech amazes you most?",
  Art: "🎨 Art lets us express things words can't capture. Every color, every stroke has meaning. What does creativity mean to you?"
};

// ============================================================
// MAIN APP
// ============================================================

export default function BrainSpark() {
  // State
  const [screen, setScreen] = useState('landing');
  const [ageGroup, setAgeGroup] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAchievement, setShowAchievement] = useState(null);
  const messagesEndRef = useRef(null);

  // Stats (persisted to localStorage)
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('brainspark_stats');
      return saved ? JSON.parse(saved) : {
        stars: 0,
        streak: 1,
        totalQuestions: 0,
        maxDepth: 0,
        currentDepth: 0,
        topicsExplored: [],
        unlockedAchievements: [],
        lastActiveDate: new Date().toDateString(),
        weeklyActivity: [0, 0, 0, 0, 0, 0, 0]
      };
    } catch {
      return {
        stars: 0, streak: 1, totalQuestions: 0, maxDepth: 0, currentDepth: 0,
        topicsExplored: [], unlockedAchievements: [], lastActiveDate: new Date().toDateString(),
        weeklyActivity: [0, 0, 0, 0, 0, 0, 0]
      };
    }
  });

  // Save stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('brainspark_stats', JSON.stringify(stats));
    } catch (e) {
      console.log('Could not save stats');
    }
  }, [stats]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check for new achievements
  const checkAchievements = (newStats) => {
    for (const achievement of ACHIEVEMENTS) {
      if (!newStats.unlockedAchievements.includes(achievement.id) && achievement.condition(newStats)) {
        setShowAchievement(achievement);
        return { ...newStats, unlockedAchievements: [...newStats.unlockedAchievements, achievement.id], stars: newStats.stars + achievement.stars };
      }
    }
    return newStats;
  };

  // Update streak
  const updateStreak = (currentStats) => {
    const today = new Date().toDateString();
    const lastActive = currentStats.lastActiveDate;
    
    if (lastActive === today) return currentStats;
    
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = lastActive === yesterday ? currentStats.streak + 1 : 1;
    
    return { ...currentStats, streak: newStreak, lastActiveDate: today };
  };

  // Backend API call
  const sendToClaude = async (userMessage) => {
    try {
      const response = await chatApi.sendMessage({
        topic: currentTopic.name,
        message: userMessage,
        age_group: ageGroup.id,
        preferred_model: 'grok',
        enable_fallback: true
      });

      return response.data.response || getFallbackResponse();
    } catch (error) {
      console.error('API Error:', error);
      return getFallbackResponse();
    }
  };

  const getFallbackResponse = () => {
    const responses = [
      `That's a fascinating thought! 🤔 ${TOPIC_STARTERS[currentTopic?.name] || "Tell me more about what you're thinking..."}`,
      `Wow, you're really thinking deeply! Let me share something amazing about ${currentTopic?.name}...`,
      `Great question! The world is full of mysteries like this. What else makes you curious?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Handle sending message
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg = { role: 'user', text: inputText.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const response = await sendToClaude(inputText);

    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setIsLoading(false);

    // Update stats
    let newStats = {
      ...stats,
      totalQuestions: stats.totalQuestions + 1,
      currentDepth: stats.currentDepth + 1,
      maxDepth: Math.max(stats.maxDepth, stats.currentDepth + 1),
      stars: stats.stars + 5,
      topicsExplored: stats.topicsExplored.includes(currentTopic.name)
        ? stats.topicsExplored
        : [...stats.topicsExplored, currentTopic.name]
    };

    newStats = updateStreak(newStats);
    newStats = checkAchievements(newStats);
    setStats(newStats);
  };

  // Start topic conversation
  const startTopic = (topic) => {
    setCurrentTopic(topic);
    setMessages([{ role: 'ai', text: TOPIC_STARTERS[topic.name] }]);
    setStats(prev => ({ ...prev, currentDepth: 0 }));
    setScreen('chat');
  };

  // Get daily challenge
  const getDailyChallenge = () => {
    const dayIndex = new Date().getDay();
    return DAILY_CHALLENGES[dayIndex % DAILY_CHALLENGES.length];
  };

  // Check if topic is unlocked
  const isTopicUnlocked = (topic) => {
    return stats.totalQuestions >= topic.unlockLevel;
  };

  // ==================== SCREENS ====================

  // Landing Screen
  const LandingScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <StarField density={60} />
      <FloatingParticles />
      
      <div className="relative z-10 text-center max-w-md">
        <div className="text-7xl mb-4 animate-bounce">🧠</div>
        <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
          Brain<span className="text-yellow-400">Spark</span>
        </h1>
        <p className="text-xl text-purple-200 mb-8">Where Curiosity Becomes Superpower</p>

        <div className="flex gap-3 justify-center mb-8 flex-wrap">
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white border border-white/20">
            🔥 {stats.streak} Day Streak
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-yellow-300 border border-yellow-400/30">
            ⭐ {stats.stars} Stars
          </div>
        </div>

        <button
          onClick={() => setScreen('ageSelect')}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xl px-8 py-4 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-orange-500/40"
        >
          Start Thinking! 🚀
        </button>

        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => setScreen('parent')}
            className="text-purple-300 hover:text-white transition-colors text-sm"
          >
            👨‍👩‍👧 Parent Dashboard
          </button>
          <button
            onClick={() => setScreen('achievements')}
            className="text-purple-300 hover:text-white transition-colors text-sm"
          >
            🏆 Achievements
          </button>
        </div>
      </div>
    </div>
  );

  // Age Selection Screen
  const AgeSelectScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black p-6 relative">
      <StarField density={40} />
      
      <div className="relative z-10 max-w-md mx-auto">
        <button onClick={() => setScreen('landing')} className="text-white/70 hover:text-white mb-6 flex items-center gap-2">
          ← Back
        </button>
        
        <h2 className="text-3xl font-bold text-white text-center mb-2">Who's Ready to Think? 🤔</h2>
        <p className="text-purple-200 text-center mb-8">Choose your adventure level</p>

        <div className="space-y-4">
          {AGE_GROUPS.map(group => (
            <button
              key={group.id}
              onClick={() => { setAgeGroup(group); setScreen('constellation'); }}
              className={`w-full bg-gradient-to-r ${group.color} p-5 rounded-2xl text-left hover:scale-102 active:scale-98 transition-all shadow-lg`}
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{group.emoji}</span>
                <div>
                  <h3 className="text-xl font-bold text-white">{group.name}</h3>
                  <p className="text-white/80 text-sm">{group.age}</p>
                  <p className="text-white/60 text-xs mt-1">{group.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Constellation Screen
  const ConstellationScreen = () => {
    const dailyChallenge = getDailyChallenge();
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black p-4 relative">
        <StarField density={30} />
        
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setScreen('ageSelect')} className="text-white/70 hover:text-white">← Back</button>
            <div className="flex gap-2">
              <span className="bg-white/10 px-3 py-1 rounded-full text-white text-sm border border-white/20">🔥 {stats.streak}</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-yellow-300 text-sm border border-yellow-400/30">⭐ {stats.stars}</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-1">Your Knowledge Universe</h2>
          <p className="text-purple-200 text-center text-sm mb-4">Tap a star to explore!</p>

          {/* Constellation Map */}
          <div className="relative h-72 bg-black/40 rounded-3xl backdrop-blur-sm border border-white/10 overflow-hidden">
            {TOPICS.map(topic => {
              const unlocked = isTopicUnlocked(topic);
              return (
                <button
                  key={topic.id}
                  onClick={() => unlocked && startTopic(topic)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${unlocked ? 'hover:scale-110 active:scale-95' : 'opacity-40 cursor-not-allowed'}`}
                  style={{ left: `${topic.x}%`, top: `${topic.y}%` }}
                  disabled={!unlocked}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg bg-gradient-to-br ${topic.color} ${unlocked ? 'shadow-lg animate-pulse' : 'grayscale'}`}>
                      {topic.emoji}
                    </div>
                    <div className="text-white text-xs text-center mt-1 font-medium whitespace-nowrap">{topic.name}</div>
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg">🔒</span>
                      </div>
                    )}
                    {unlocked && stats.topicsExplored.includes(topic.name) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center text-xs">✓</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stats Row */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
              <div className="text-xl font-bold text-white">{stats.topicsExplored.length}/{TOPICS.length}</div>
              <div className="text-purple-200 text-xs">Explored</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
              <div className="text-xl font-bold text-yellow-300">{stats.totalQuestions}</div>
              <div className="text-purple-200 text-xs">Questions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
              <div className="text-xl font-bold text-green-400">{stats.maxDepth}</div>
              <div className="text-purple-200 text-xs">Max Depth</div>
            </div>
          </div>

          {/* Daily Challenge */}
          <div className="mt-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{dailyChallenge.emoji}</span>
              <div className="flex-1">
                <div className="text-yellow-300 font-bold text-sm">Daily Brain Spark</div>
                <div className="text-white text-sm">{dailyChallenge.question}</div>
              </div>
              <button
                onClick={() => startTopic(TOPICS.find(t => t.name === dailyChallenge.topic) || TOPICS[0])}
                className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-full text-sm font-bold transition-colors"
              >
                Go!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Chat Screen
  const ChatScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black flex flex-col relative">
      <StarField density={20} />

      {/* Header */}
      <div className="relative z-10 p-4 border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <button onClick={() => setScreen('constellation')} className="text-white/70 hover:text-white">
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentTopic?.emoji}</span>
            <span className="text-white font-bold">{currentTopic?.name}</span>
          </div>
          <div className="bg-purple-500/30 px-3 py-1 rounded-full text-purple-200 text-sm border border-purple-400/30">
            🌀 Depth: {stats.currentDepth}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 rounded-br-sm'
                  : 'bg-white/10 backdrop-blur-sm border border-white/10 rounded-bl-sm'
              } text-white`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl rounded-bl-sm p-4 text-white flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10 p-4 border-t border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your thoughts..."
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-5 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold disabled:opacity-50 hover:scale-105 active:scale-95 transition-transform"
            >
              Send
            </button>
          </div>
          
          <div className="flex justify-around mt-3 text-center text-sm">
            <div><span className="text-yellow-300 font-bold">{stats.stars}</span> <span className="text-purple-300">⭐</span></div>
            <div><span className="text-orange-300 font-bold">{stats.streak}</span> <span className="text-purple-300">🔥</span></div>
            <div><span className="text-green-300 font-bold">{stats.currentDepth}</span> <span className="text-purple-300">🌀</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Parent Dashboard
  const ParentDashboard = () => (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setScreen('landing')} className="text-white/70 hover:text-white">← Back</button>
          <h1 className="text-xl font-bold text-white">👨‍👩‍👧 Parent Dashboard</h1>
          <div />
        </div>

        {/* Stats Overview */}
        <div className="bg-white/10 rounded-2xl p-6 mb-4 border border-white/10">
          <h2 className="text-lg font-bold text-white mb-4">Progress Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{stats.stars}</div>
              <div className="text-slate-400 text-sm">Total Stars</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-400">{stats.streak}</div>
              <div className="text-slate-400 text-sm">Day Streak</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.totalQuestions}</div>
              <div className="text-slate-400 text-sm">Questions Asked</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{stats.maxDepth}</div>
              <div className="text-slate-400 text-sm">Deepest Dive</div>
            </div>
          </div>
        </div>

        {/* Topics Explored */}
        <div className="bg-white/10 rounded-2xl p-6 mb-4 border border-white/10">
          <h2 className="text-lg font-bold text-white mb-4">Topics Explored</h2>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map(topic => (
              <span
                key={topic.id}
                className={`px-3 py-1 rounded-full text-sm ${
                  stats.topicsExplored.includes(topic.name)
                    ? `bg-gradient-to-r ${topic.color} text-white`
                    : 'bg-white/10 text-slate-500'
                }`}
              >
                {topic.emoji} {topic.name}
              </span>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-bold text-white mb-4">🏆 Achievements ({stats.unlockedAchievements.length}/{ACHIEVEMENTS.length})</h2>
          <div className="grid grid-cols-3 gap-3">
            {ACHIEVEMENTS.map(ach => (
              <div
                key={ach.id}
                className={`text-center p-3 rounded-xl ${
                  stats.unlockedAchievements.includes(ach.id)
                    ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-400/50'
                    : 'bg-white/5 border border-white/10 opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">{ach.emoji}</div>
                <div className="text-white text-xs font-medium">{ach.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="mt-4 bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
          <h3 className="text-blue-300 font-bold mb-2">💡 Insight</h3>
          <p className="text-slate-300 text-sm">
            {stats.topicsExplored.length > 0
              ? `Your child shows strong curiosity in ${stats.topicsExplored.slice(0, 2).join(' and ')}! Consider related activities like museum visits or documentaries.`
              : 'Start exploring topics together to unlock personalized insights!'}
          </p>
        </div>
      </div>
    </div>
  );

  // Achievements Screen
  const AchievementsScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black p-4">
      <StarField density={30} />
      
      <div className="relative z-10 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setScreen('landing')} className="text-white/70 hover:text-white">← Back</button>
          <h1 className="text-xl font-bold text-white">🏆 Achievements</h1>
          <div className="text-yellow-300 font-bold">{stats.unlockedAchievements.length}/{ACHIEVEMENTS.length}</div>
        </div>

        <div className="space-y-3">
          {ACHIEVEMENTS.map(ach => {
            const unlocked = stats.unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border ${
                  unlocked
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50'
                    : 'bg-white/5 border-white/10 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{unlocked ? ach.emoji : '🔒'}</div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold">{ach.title}</h3>
                    <p className="text-white/60 text-sm">{ach.description}</p>
                  </div>
                  <div className="text-yellow-300 font-bold">+{ach.stars} ⭐</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render current screen
  return (
    <div className="font-sans">
      {showAchievement && (
        <AchievementBadge
          achievement={showAchievement}
          onClose={() => setShowAchievement(null)}
        />
      )}

      {screen === 'landing' && <LandingScreen />}
      {screen === 'ageSelect' && <AgeSelectScreen />}
      {screen === 'constellation' && <ConstellationScreen />}
      {screen === 'chat' && <ChatScreen />}
      {screen === 'parent' && <ParentDashboard />}
      {screen === 'achievements' && <AchievementsScreen />}

      {/* Copyright Footer */}
      <div className="fixed bottom-0 left-0 right-0 py-2 text-center text-xs text-white/40 bg-gradient-to-t from-black/30 to-transparent pointer-events-none">
        © {new Date().getFullYear()} Bakkiyam Foundation. All rights reserved.
      </div>
    </div>
  );
}
