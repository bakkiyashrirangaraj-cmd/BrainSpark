import { useState, useEffect } from 'react';
import { authApi, childrenApi, chatApi } from '../api/client';

// Authentication & Parent Dashboard Component
export default function FullApp() {
  const [screen, setScreen] = useState('landing'); // landing, login, register, parent, topics, chat
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
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
                  setScreen('topics'); // Go to topic selection first
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

  // Topics Selection Screen
  const TopicsScreen = () => {
    const topics = [
      { name: 'Space', emoji: '🌌', gradient: 'from-blue-500 to-purple-600' },
      { name: 'Physics', emoji: '⚛️', gradient: 'from-cyan-400 to-blue-500' },
      { name: 'Nature', emoji: '🌿', gradient: 'from-green-400 to-emerald-600' },
      { name: 'Math', emoji: '🔢', gradient: 'from-yellow-400 to-orange-500' },
      { name: 'Animals', emoji: '🦁', gradient: 'from-orange-400 to-red-500' },
      { name: 'Music', emoji: '🎵', gradient: 'from-pink-400 to-purple-500' },
      { name: 'Technology', emoji: '💻', gradient: 'from-indigo-400 to-cyan-500' },
      { name: 'Ocean', emoji: '🌊', gradient: 'from-blue-400 to-cyan-600' },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setScreen('parent')}
              className="text-white text-xl"
            >
              ← Back
            </button>
            <h2 className="text-white text-2xl font-bold">
              Choose a Topic
            </h2>
            <div className="w-8"></div>
          </div>

          <div className="text-center text-white/60 mb-8">
            What would you like to explore with {selectedChild?.name}?
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <div
                key={topic.name}
                onClick={() => {
                  setSelectedTopic(topic.name);
                  setScreen('demo');
                }}
                className={`bg-gradient-to-br ${topic.gradient} rounded-2xl p-6 hover:scale-105 transition cursor-pointer shadow-xl`}
              >
                <div className="text-6xl mb-3">{topic.emoji}</div>
                <div className="text-white font-bold text-xl">{topic.name}</div>
              </div>
            ))}
          </div>

          <div className="fixed bottom-0 left-0 right-0 py-2 text-center text-xs text-white/40 bg-gradient-to-t from-black/30 to-transparent pointer-events-none">
            © {new Date().getFullYear()} Bakkiyam Foundation. All rights reserved.
          </div>
        </div>
      </div>
    );
  };

  // Demo/Guest Mode - simplified chat
  const DemoScreen = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
      if (!inputText.trim() || isLoading) return;

      const userMsg = { role: 'user', text: inputText.trim() };
      setMessages(prev => [...prev, userMsg]);
      setInputText('');
      setIsLoading(true);

      try {
        const response = await chatApi.sendMessage({
          topic: selectedTopic || 'General',
          message: userMsg.text,
          age_group: selectedChild?.profile?.age_group || 'explorers',
          preferred_model: 'grok',
          enable_fallback: true
        });

        setMessages(prev => [...prev, { role: 'assistant', text: response.data.response }]);
      } catch (err) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: 'Hmm, something went wrong. But let me think about that... What else are you curious about?'
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black flex flex-col">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <button
            onClick={() => user ? setScreen('parent') : setScreen('landing')}
            className="text-white"
          >
            ← Back
          </button>
          <h2 className="text-white font-bold">
            {selectedChild?.name || 'Guest Mode'}
          </h2>
          <div className="w-16"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/60 mt-8">
              <div className="text-6xl mb-4">🧠</div>
              <p>Ask me anything! I'm here to spark your curiosity.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/10 text-white'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-white p-4 rounded-2xl">
                Thinking... 🤔
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-black/30">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-yellow-400"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-6 py-3 rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>

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
      {screen === 'topics' && <TopicsScreen />}
      {screen === 'demo' && <DemoScreen />}
    </div>
  );
}
