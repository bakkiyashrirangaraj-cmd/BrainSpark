import { useState, useEffect } from 'react';
import { authApi, childrenApi, chatApi } from '../api/client';

// Knowledge nodes for constellation
const knowledgeNodes = [
  { id: 1, name: 'Space', emoji: '🌌', x: 50, y: 20, connections: [2, 3], unlocked: true, level: 1 },
  { id: 2, name: 'Physics', emoji: '⚛️', x: 30, y: 40, connections: [1, 4], unlocked: true, level: 1 },
  { id: 3, name: 'Nature', emoji: '🌿', x: 70, y: 35, connections: [1, 5], unlocked: true, level: 1 },
  { id: 4, name: 'Math', emoji: '🔢', x: 20, y: 65, connections: [2, 6], unlocked: true, level: 1 },
  { id: 5, name: 'Animals', emoji: '🦁', x: 80, y: 60, connections: [3, 6], unlocked: true, level: 1 },
  { id: 6, name: 'Music', emoji: '🎵', x: 50, y: 80, connections: [4, 5], unlocked: true, level: 1 },
  { id: 7, name: 'Technology', emoji: '💻', x: 15, y: 25, connections: [2], unlocked: true, level: 1 },
  { id: 8, name: 'Ocean', emoji: '🌊', x: 85, y: 25, connections: [3], unlocked: true, level: 1 }
];

// Sample AI-initiated conversations
const sampleConversations = {
  Space: [
    { role: 'ai', text: "🌌 Welcome, space explorer! Did you know there are more stars in the universe than grains of sand on Earth? What makes you most curious about space?" },
    { role: 'options', choices: ["Why don't planets fall into the sun?", "What's inside a black hole?", "Can we live on Mars?"] }
  ],
  Physics: [
    { role: 'ai', text: "⚛️ Ah, a future physicist! Everything around you follows invisible rules. Drop a feather and a rock - which hits the ground first? Why?" },
    { role: 'options', choices: ["The rock is heavier!", "Air slows the feather?", "Gravity pulls them differently?"] }
  ],
  Nature: [
    { role: 'ai', text: "🌿 Nature is full of secrets! Trees can talk to each other underground through their roots! What would YOU say if you were a tree?" },
    { role: 'options', choices: ["How do they talk without mouths?", "What warnings do they share?", "Can I hear them somehow?"] }
  ],
  Math: [
    { role: 'ai', text: "🔢 Math is like a secret code! Think of any number, double it, add 10, divide by 2, subtract your original number. You got 5, right? How did I know?!" },
    { role: 'options', choices: ["Whoa! Do another trick!", "Wait, let me figure out why...", "Is all math this cool?"] }
  ],
  Animals: [
    { role: 'ai', text: "🦁 Animals have superpowers! Some can see in total darkness, others can regenerate body parts. Which superpower would you want?" },
    { role: 'options', choices: ["Night vision like an owl!", "Regeneration like a starfish!", "Echolocation like a bat!"] }
  ],
  Music: [
    { role: 'ai', text: "🎵 Music is vibrations that make us feel emotions! Close your eyes and imagine a color. What does it sound like?" },
    { role: 'options', choices: ["Colors have sounds?!", "How does music affect our brain?", "Can animals make music?"] }
  ],
  Technology: [
    { role: 'ai', text: "💻 Every app you use is just millions of tiny on/off switches! If you could invent any app, what problem would it solve?" },
    { role: 'options', choices: ["How does my phone work?", "What is AI?", "Can I make my own game?"] }
  ],
  Ocean: [
    { role: 'ai', text: "🌊 We know more about space than our own oceans! The deepest part is over 36,000 feet deep. What do you think lives down there?" },
    { role: 'options', choices: ["Giant sea monsters?", "Glowing creatures?", "Ancient secrets?"] }
  ]
};

// Authentication & Parent Dashboard Component
export default function FullApp() {
  const [screen, setScreen] = useState('landing'); // landing, login, register, parent, constellation, learning
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [depth, setDepth] = useState(0);
  const [stars, setStars] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('brainspark_token');
    if (token) {
      loadChildren();
      setScreen('parent');
    }
  }, []);

  const loadChildren = async () => {
    try {
      const response = await childrenApi.list();
      setChildren(response.data);
    } catch (err) {
      console.error('Failed to load children:', err);
    }
  };

  // Landing Screen
  const LandingScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black flex flex-col items-center justify-center p-6">
      <div className="text-8xl mb-4 animate-bounce">🧠</div>
      <h1 className="text-5xl font-bold text-white mb-2">
        Brain<span className="text-yellow-400">Spark</span>
      </h1>
      <p className="text-xl text-purple-200 mb-8">Where Curiosity Becomes Superpower</p>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => setScreen('login')}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-xl px-8 py-4 rounded-full hover:scale-105 transition-transform"
        >
          Login
        </button>
        <button
          onClick={() => setScreen('register')}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xl px-8 py-4 rounded-full hover:scale-105 transition-transform"
        >
          Create Account
        </button>
        <button
          onClick={() => setScreen('demo')}
          className="bg-white/10 text-white font-bold text-lg px-8 py-3 rounded-full hover:bg-white/20 transition"
        >
          Try Demo (Guest Mode)
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 py-2 text-center text-xs text-white/40 bg-gradient-to-t from-black/30 to-transparent">
        © {new Date().getFullYear()} Bakkiyam Foundation. All rights reserved.
      </div>
    </div>
  );

  // Login Screen
  const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        const response = await authApi.login({ email, password });
        localStorage.setItem('brainspark_token', response.data.access_token);
        setUser(response.data);
        await loadChildren();
        setScreen('parent');
      } catch (err) {
        setError(err.response?.data?.detail || 'Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md">
          <button onClick={() => setScreen('landing')} className="text-white mb-4">← Back</button>

          <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back!</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-yellow-400"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-yellow-400"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-white/60 mt-4">
            Don't have an account?{' '}
            <button onClick={() => setScreen('register')} className="text-yellow-400 hover:underline">
              Register
            </button>
          </p>
        </div>
      </div>
    );
  };

  // Register Screen
  const RegisterScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        const response = await authApi.register({ name, email, password });
        localStorage.setItem('brainspark_token', response.data.access_token);
        setUser(response.data);
        setScreen('parent');
      } catch (err) {
        setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md">
          <button onClick={() => setScreen('landing')} className="text-white mb-4">← Back</button>

          <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-white mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-yellow-400"
                placeholder="Parent Name"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-yellow-400"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-yellow-400"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-white/60 mt-4">
            Already have an account?{' '}
            <button onClick={() => setScreen('login')} className="text-yellow-400 hover:underline">
              Login
            </button>
          </p>
        </div>
      </div>
    );
  };

  // Parent Dashboard
  const ParentDashboard = () => {
    const [showAddChild, setShowAddChild] = useState(false);
    const [childName, setChildName] = useState('');
    const [ageGroup, setAgeGroup] = useState('explorers');
    const [avatar, setAvatar] = useState('🧒');

    const handleAddChild = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        await childrenApi.create({ name: childName, age_group: ageGroup, avatar });
        await loadChildren();
        setShowAddChild(false);
        setChildName('');
      } catch (err) {
        setError('Failed to add child. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('brainspark_token');
      authApi.logout();
      setUser(null);
      setChildren([]);
      setScreen('landing');
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Parent Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>

          <div className="grid gap-4 mb-8">
            {children.map((child) => (
              <div
                key={child.id}
                onClick={() => {
                  setSelectedChild(child);
                  setStars(child.profile?.stars || 0);
                  setScreen('constellation'); // Go to knowledge constellation
                }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{child.profile?.avatar || '🧒'}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{child.name}</h3>
                    <p className="text-purple-200 text-sm capitalize">{child.profile?.age_group || 'explorers'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-300 font-bold">⭐ {child.profile?.stars || 0}</div>
                    <div className="text-orange-300 text-sm">🔥 {child.profile?.streak || 0} day streak</div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowAddChild(true)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-4 rounded-2xl hover:scale-105 transition-transform"
            >
              + Add Child Profile
            </button>
          </div>

          {showAddChild && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6">Add Child Profile</h2>

                {error && (
                  <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleAddChild} className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Child's Name</label>
                    <input
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-yellow-400"
                      placeholder="Enter name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Age Group</label>
                    <select
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-yellow-400"
                    >
                      <option value="cubs">Wonder Cubs (4-6 years)</option>
                      <option value="explorers">Curious Explorers (7-10 years)</option>
                      <option value="masters">Mind Masters (11-14 years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white mb-2">Avatar</label>
                    <div className="grid grid-cols-5 gap-2">
                      {['🧒', '👦', '👧', '🐻', '🚀', '🧠', '🌟', '🦁', '🐼', '🦄'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setAvatar(emoji)}
                          className={`text-3xl p-2 rounded-lg transition ${
                            avatar === emoji ? 'bg-yellow-400' : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddChild(false)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Child'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="fixed bottom-0 left-0 right-0 py-2 text-center text-xs text-white/40 bg-gradient-to-t from-black/30 to-transparent pointer-events-none">
            © {new Date().getFullYear()} Bakkiyam Foundation. All rights reserved.
          </div>
        </div>
      </div>
    );
  };

  // Knowledge Constellation Screen
  const ConstellationScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black p-4 relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: Math.random() * 3 + 1,
        })).map(star => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              opacity: 0.6
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setScreen('parent')} className="text-white">← Back</button>
          <div className="flex gap-2">
            <span className="bg-white/10 px-3 py-1 rounded-full text-yellow-300 text-sm">⭐ {stars}</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-1">
          {selectedChild?.name}'s Knowledge Universe
        </h2>
        <p className="text-purple-200 text-center text-sm mb-4">Tap a star to explore deeper!</p>

        {/* Constellation visualization */}
        <div className="relative h-96 bg-black/30 rounded-3xl backdrop-blur border border-white/10 overflow-hidden">
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full">
            {knowledgeNodes.map(node =>
              node.connections.map(connId => {
                const target = knowledgeNodes.find(n => n.id === connId);
                if (!target || target.id < node.id) return null;
                return (
                  <line
                    key={`${node.id}-${connId}`}
                    x1={`${node.x}%`} y1={`${node.y}%`}
                    x2={`${target.x}%`} y2={`${target.y}%`}
                    stroke={node.unlocked && target.unlocked ? "rgba(147,51,234,0.5)" : "rgba(255,255,255,0.1)"}
                    strokeWidth="2"
                  />
                );
              })
            )}
          </svg>

          {/* Nodes */}
          {knowledgeNodes.map(node => (
            <button
              key={node.id}
              onClick={() => {
                if (node.unlocked) {
                  setSelectedTopic(node.name);
                  setMessages(sampleConversations[node.name] || []);
                  setDepth(0);
                  setScreen('learning');
                }
              }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                node.unlocked ? 'hover:scale-110' : 'opacity-40'
              }`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div className={`relative ${node.unlocked ? 'animate-pulse' : ''}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                  node.unlocked
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50'
                    : 'bg-gray-700'
                }`}>
                  {node.emoji}
                </div>
                <div className="text-white text-xs text-center mt-1 font-medium">{node.name}</div>
                {node.unlocked && (
                  <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {node.level}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 py-2 text-center text-xs text-white/40 bg-gradient-to-t from-black/30 to-transparent pointer-events-none">
          © {new Date().getFullYear()} Bakkiyam Foundation. All rights reserved.
        </div>
      </div>
    </div>
  );

  // Sound effects system
  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const sounds = {
        tap: { frequency: 800, duration: 0.1 },
        correct: { frequency: 523.25, duration: 0.3 },
        star: { frequency: 659.25, duration: 0.4 },
        whoosh: { frequency: 200, duration: 0.2 }
      };

      const sound = sounds[type] || sounds.tap;
      oscillator.frequency.value = sound.frequency;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + sound.duration);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  // Interactive Learning Screen - Card-based for kids!
  const LearningScreen = () => {
    const [mascotExpression, setMascotExpression] = useState('excited');
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    const getMascotEmoji = () => {
      const topic = knowledgeNodes.find(n => n.name === selectedTopic);
      return topic?.emoji || '🧠';
    };

    // Get current card to display
    const getCurrentCard = () => {
      if (messages.length === 0) return null;
      return messages[currentCardIndex];
    };

    const handleChoice = async (choiceText) => {
      playSound('tap');
      setMascotExpression('neutral');

      // Add user's choice to messages
      const userMsg = { role: 'user', text: choiceText };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);
      setMascotExpression('thinking');

      // Increment depth for follow-up question
      const newDepth = depth + 1;
      setDepth(newDepth);

      // Award stars - with sound and celebration!
      if (newDepth % 3 === 0) {
        playSound('star');
        setStars(prev => prev + 1);
        setMascotExpression('celebrating');
        setShowReward(true);
        setTimeout(() => {
          setShowReward(false);
          setMascotExpression('excited');
        }, 2000);
      }

      try {
        const response = await chatApi.sendMessage({
          topic: selectedTopic || 'General',
          message: choiceText,
          age_group: selectedChild?.profile?.age_group || 'explorers',
          preferred_model: 'grok',
          enable_fallback: true
        });

        setIsTyping(false);
        setMascotExpression('excited');
        playSound('correct');

        const aiMsg = { role: 'ai', text: response.data.response };
        setMessages(prev => [...prev, aiMsg]);

        const followUpOptions = [
          `Tell me more about that!`,
          `Why does that happen?`,
          `Can you give me an example?`,
          `What else should I know?`
        ];

        setMessages(prev => [...prev, { role: 'options', choices: followUpOptions }]);

        // Move to next card (the new AI message)
        setCurrentCardIndex(prev => prev + 1);
      } catch (err) {
        setIsTyping(false);
        setMascotExpression('excited');
        setMessages(prev => [...prev, {
          role: 'ai',
          text: "That's a fascinating thought! Let me think deeper... Which direction should we explore?"
        }, {
          role: 'options',
          choices: [`Go deeper into ${selectedTopic}`, `Try a different angle`, `Connect to another topic`]
        }]);
        setCurrentCardIndex(prev => prev + 1);
      }
    };

    const nextCard = () => {
      playSound('whoosh');
      if (currentCardIndex < messages.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      }
    };

    const prevCard = () => {
      playSound('whoosh');
      if (currentCardIndex > 0) {
        setCurrentCardIndex(prev => prev - 1);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black flex flex-col relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 3,
            duration: 3 + Math.random() * 2
          })).map(particle => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full opacity-60"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animation: `twinkle ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`
              }}
            />
          ))}
        </div>

        {/* Header with depth and stars */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/30 relative z-10">
          <button
            onClick={() => setScreen('constellation')}
            className="text-white hover:text-yellow-400 transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/30 px-3 py-1 rounded-full text-white text-sm flex items-center gap-1">
              <span className="text-purple-300">Depth</span>
              <span className="font-bold text-yellow-300">{depth}</span>
            </div>
            <div className="bg-yellow-500/30 px-3 py-1 rounded-full text-white text-sm flex items-center gap-1">
              ⭐ <span className="font-bold">{stars}</span>
            </div>
          </div>
        </div>

        {/* Animated Mascot Character */}
        <div className="relative z-10 flex justify-center py-4">
          <div className={`relative transition-all duration-500 ${
            mascotExpression === 'celebrating' ? 'animate-bounce' :
            mascotExpression === 'thinking' ? 'animate-pulse' :
            'animate-float'
          }`}>
            <div className={`text-6xl filter drop-shadow-lg ${
              mascotExpression === 'celebrating' ? 'scale-125' : 'scale-100'
            } transition-transform duration-300`}>
              {getMascotEmoji()}
            </div>
            {mascotExpression === 'celebrating' && (
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                    style={{
                      transform: `rotate(${i * 45}deg) translateY(-40px)`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Topic header */}
        <div className="p-4 bg-gradient-to-r from-purple-600/40 to-pink-600/40 text-center relative z-10">
          <h2 className="text-2xl font-bold text-white">
            {knowledgeNodes.find(n => n.name === selectedTopic)?.emoji} {selectedTopic}
          </h2>
          <p className="text-purple-200 text-sm">Tap your choice to explore deeper!</p>
        </div>

        {/* Card-based interface - NO SCROLLING! */}
        <div className="flex-1 relative flex items-center justify-center p-4">
          {/* Navigation Hint */}
          {messages.length > 1 && (
            <div className="absolute top-2 right-2 text-white/50 text-xs z-20">
              Card {currentCardIndex + 1} / {messages.length}
            </div>
          )}

          {/* Previous Card Button */}
          {currentCardIndex > 0 && (
            <button
              onClick={prevCard}
              className="absolute left-2 z-20 bg-purple-500/50 hover:bg-purple-500/70 text-white p-3 rounded-full backdrop-blur transition-all hover:scale-110"
            >
              <span className="text-2xl">←</span>
            </button>
          )}

          {/* Next Card Button */}
          {currentCardIndex < messages.length - 1 && (
            <button
              onClick={nextCard}
              className="absolute right-2 z-20 bg-purple-500/50 hover:bg-purple-500/70 text-white p-3 rounded-full backdrop-blur transition-all hover:scale-110"
            >
              <span className="text-2xl">→</span>
            </button>
          )}

          {/* Current Card Display */}
          <div className="w-full max-w-2xl relative z-10">
            {(() => {
              const currentCard = getCurrentCard();
              if (!currentCard) {
                // No messages yet - show loading
                return (
                  <div className="text-center text-white p-8">
                    <div className="text-6xl mb-4 animate-bounce">{getMascotEmoji()}</div>
                    <p className="text-xl">Starting your adventure...</p>
                  </div>
                );
              }

              if (currentCard.role === 'ai') {
                return (
                  <div className="animate-slide-in">
                    <div className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-lg border-2 border-purple-400/50 p-8 rounded-3xl text-white shadow-2xl">
                      <div className="text-sm opacity-70 mb-3 flex items-center gap-2">
                        <span className="text-2xl">{getMascotEmoji()}</span>
                        <span>BrainSpark AI</span>
                      </div>
                      <div className="text-xl leading-relaxed font-medium">{currentCard.text}</div>
                    </div>
                  </div>
                );
              } else if (currentCard.role === 'user') {
                return (
                  <div className="animate-slide-in">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 rounded-3xl text-black font-bold shadow-2xl text-center">
                      <div className="text-sm opacity-70 mb-2">You said:</div>
                      <div className="text-xl">{currentCard.text}</div>
                    </div>
                  </div>
                );
              } else if (currentCard.role === 'options') {
                return (
                  <div className="space-y-4 animate-slide-in">
                    <div className="text-center text-yellow-300 text-xl font-bold mb-6 animate-pulse">
                      ✨ Choose your path! ✨
                    </div>
                    {currentCard.choices.map((choice, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChoice(choice)}
                        className="group w-full relative overflow-hidden bg-gradient-to-r from-purple-500/50 to-pink-500/50 hover:from-purple-500/70 hover:to-pink-500/70 backdrop-blur-md border-2 border-purple-400/60 hover:border-yellow-400 text-white p-6 rounded-3xl transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl hover:shadow-purple-500/50 text-left font-semibold active:scale-95 transform"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                        <div className="relative flex items-center gap-4">
                          <span className="text-3xl group-hover:scale-125 transition-transform duration-300">
                            {['🚀', '⭐', '💫', '🌟'][idx % 4]}
                          </span>
                          <span className="flex-1 text-lg leading-relaxed">{choice}</span>
                          <span className="text-yellow-400 text-2xl group-hover:translate-x-2 transition-transform">→</span>
                        </div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-yellow-300 text-sm animate-spin">✨</span>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              }
              return null;
            })()}

            {/* Thinking indicator */}
            {isTyping && (
              <div className="mt-8 flex justify-center animate-fade-in">
                <div className="bg-purple-500/30 backdrop-blur border-2 border-purple-400/50 p-6 rounded-3xl text-white flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-lg font-medium">Thinking deeply...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reward popup with particle explosion */}
        {showReward && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            {/* Particle burst */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-yellow-400"
                style={{
                  left: '50%',
                  top: '50%',
                  animation: `particle-explosion 1s ease-out forwards`,
                  animationDelay: `${i * 0.03}s`,
                  transform: `rotate(${i * 18}deg) translateY(0)`,
                  '--angle': `${i * 18}deg`
                } as any}
              />
            ))}

            {/* Main reward message */}
            <div className="relative">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-2xl px-8 py-6 rounded-2xl shadow-2xl animate-bounce border-4 border-yellow-300">
                <div className="flex items-center gap-3">
                  <span className="text-4xl animate-spin">⭐</span>
                  <div>
                    <div className="text-2xl">+1 Star!</div>
                    <div className="text-sm font-normal">Keep exploring!</div>
                  </div>
                  <span className="text-4xl animate-spin">⭐</span>
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-yellow-300 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
            </div>
          </div>
        )}

        <div className="py-2 text-center text-xs text-white/40 bg-gradient-to-t from-black/30 to-transparent">
          © {new Date().getFullYear()} Bakkiyam Foundation. All rights reserved.
        </div>
      </div>
    );
  };

  // Render based on screen
  return (
    <div className="font-sans">
      {screen === 'landing' && <LandingScreen />}
      {screen === 'login' && <LoginScreen />}
      {screen === 'register' && <RegisterScreen />}
      {screen === 'parent' && <ParentDashboard />}
      {screen === 'constellation' && <ConstellationScreen />}
      {screen === 'learning' && <LearningScreen />}
      {screen === 'topics' && <TopicsScreen />}
      {screen === 'demo' && <LearningScreen />}
    </div>
  );
}
