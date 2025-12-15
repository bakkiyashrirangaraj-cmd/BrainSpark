import { useState, useEffect } from 'react';

// Animated stars background
const StarField = () => {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 3
  }));
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            opacity: 0.6
          }}
        />
      ))}
    </div>
  );
};

// Age group cards
const ageGroups = [
  { id: 'cubs', name: 'Wonder Cubs', age: '4-6 years', emoji: '🐻', color: 'from-pink-400 to-orange-400', desc: 'Magical discoveries & gentle puzzles' },
  { id: 'explorers', name: 'Curious Explorers', age: '7-10 years', emoji: '🚀', color: 'from-cyan-400 to-blue-500', desc: 'Adventures & mind-bending questions' },
  { id: 'masters', name: 'Mind Masters', age: '11-14 years', emoji: '🧠', color: 'from-purple-500 to-indigo-600', desc: 'Deep thinking & philosophy' }
];

// Knowledge nodes for constellation
const knowledgeNodes = [
  { id: 1, name: 'Space', emoji: '🌌', x: 50, y: 20, connections: [2, 3], unlocked: true, level: 3 },
  { id: 2, name: 'Physics', emoji: '⚛️', x: 30, y: 40, connections: [1, 4], unlocked: true, level: 2 },
  { id: 3, name: 'Nature', emoji: '🌿', x: 70, y: 35, connections: [1, 5], unlocked: true, level: 4 },
  { id: 4, name: 'Math', emoji: '🔢', x: 20, y: 65, connections: [2, 6], unlocked: true, level: 1 },
  { id: 5, name: 'Animals', emoji: '🦁', x: 80, y: 60, connections: [3, 6], unlocked: false, level: 0 },
  { id: 6, name: 'Music', emoji: '🎵', x: 50, y: 80, connections: [4, 5], unlocked: false, level: 0 }
];

// Sample conversation for demo
const sampleConversations = {
  Space: [
    { role: 'ai', text: "🌌 Welcome, space explorer! Did you know there are more stars in the universe than grains of sand on Earth? What makes you most curious about space?" },
    { role: 'options', choices: ["Why don't planets fall into the sun?", "What's inside a black hole?", "Can we live on Mars?"] }
  ],
  Physics: [
    { role: 'ai', text: "⚛️ Ah, a future physicist! Everything around you follows invisible rules. Want to discover one? Drop a feather and a rock - which hits the ground first? Why do you think that happens?" },
    { role: 'options', choices: ["The rock is heavier!", "Air slows the feather?", "Gravity pulls them differently?"] }
  ],
  Nature: [
    { role: 'ai', text: "🌿 Nature is full of secrets! Did you know trees can talk to each other underground? They share food and warnings through their roots! What would YOU say if you were a tree?" },
    { role: 'options', choices: ["How do they talk without mouths?", "What warnings do they share?", "Can I hear them somehow?"] }
  ],
  Math: [
    { role: 'ai', text: "🔢 Math is like a secret code that unlocks the universe! Here's a magic trick: Think of any number, double it, add 10, divide by 2, subtract your original number. You got 5, right? How did I know?!" },
    { role: 'options', choices: ["Whoa! Do another trick!", "Wait, let me figure out why...", "Is all math this cool?"] }
  ]
};

// Deep dive follow-ups
const deepDives = {
  "Why don't planets fall into the sun?": [
    { role: 'ai', text: "🤔 Great question! Imagine spinning a ball on a string around your head. The ball wants to fly away, but the string pulls it back. Planets are like that ball - they're falling toward the sun, but moving so fast sideways that they keep missing it! This is called an orbit." },
    { role: 'ai', text: "🌀 But here's the DEEP question: What if a planet slowed down? What do you think would happen?" },
    { role: 'options', choices: ["It would spiral into the sun!", "It would float away into space?", "Would it become a moon?"] }
  ],
  "It would spiral into the sun!": [
    { role: 'ai', text: "🎯 EXACTLY! You just discovered orbital mechanics! When things slow down, they fall inward. When they speed up, they fly outward." },
    { role: 'ai', text: "🚀 This is how we send rockets to Mars! We speed them up to push them outward. Here's the REALLY wild part: to slow DOWN a spacecraft, we actually have to speed it up in the opposite direction. Mind-bending, right?" },
    { role: 'ai', text: "💭 Imagine you're designing a mission to visit Jupiter. You only have limited fuel. How would you get there without using too much?" },
    { role: 'options', choices: ["Use other planets' gravity to slingshot!", "Go in a straight line really fast?", "Wait for Jupiter to come closer?"] }
  ]
};

export default function BrainSpark() {
  const [screen, setScreen] = useState('landing'); // landing, ageSelect, constellation, chat
  const [selectedAge, setSelectedAge] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streak, setStreak] = useState(7);
  const [stars, setStars] = useState(142);
  const [depth, setDepth] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showReward, setShowReward] = useState(false);

  // Landing screen
  const LandingScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <StarField />
      <div className="relative z-10 text-center">
        <div className="text-8xl mb-4 animate-bounce">🧠</div>
        <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
          Brain<span className="text-yellow-400">Spark</span>
        </h1>
        <p className="text-xl text-purple-200 mb-8">Where Curiosity Becomes Superpower</p>
        
        <div className="flex gap-4 justify-center mb-8">
          <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-full text-white">
            🔥 {streak} Day Streak
          </div>
          <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-full text-yellow-300">
            ⭐ {stars} Stars
          </div>
        </div>
        
        <button
          onClick={() => setScreen('ageSelect')}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xl px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-lg shadow-orange-500/50"
        >
          Start Thinking! 🚀
        </button>
        
        <p className="text-purple-300 mt-6 text-sm">Trusted by 10,000+ curious minds</p>
      </div>
    </div>
  );

  // Age selection screen
  const AgeSelectScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black p-6 relative">
      <StarField />
      <div className="relative z-10">
        <button onClick={() => setScreen('landing')} className="text-white mb-4">← Back</button>
        <h2 className="text-3xl font-bold text-white text-center mb-2">Who's Ready to Think? 🤔</h2>
        <p className="text-purple-200 text-center mb-8">Choose your adventure level</p>
        
        <div className="grid gap-4 max-w-md mx-auto">
          {ageGroups.map(group => (
            <button
              key={group.id}
              onClick={() => { setSelectedAge(group); setScreen('constellation'); }}
              className={`bg-gradient-to-r ${group.color} p-6 rounded-2xl text-left hover:scale-102 transition-all shadow-lg`}
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{group.emoji}</span>
                <div>
                  <h3 className="text-xl font-bold text-white">{group.name}</h3>
                  <p className="text-white/80 text-sm">{group.age}</p>
                  <p className="text-white/60 text-xs mt-1">{group.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Knowledge Constellation screen
  const ConstellationScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black p-4 relative">
      <StarField />
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setScreen('ageSelect')} className="text-white">← Back</button>
          <div className="flex gap-2">
            <span className="bg-white/10 px-3 py-1 rounded-full text-white text-sm">🔥 {streak}</span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-yellow-300 text-sm">⭐ {stars}</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-1">Your Knowledge Universe</h2>
        <p className="text-purple-200 text-center text-sm mb-4">Tap a star to explore deeper!</p>
        
        {/* Constellation visualization */}
        <div className="relative h-80 bg-black/30 rounded-3xl backdrop-blur border border-white/10 overflow-hidden">
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
                  setScreen('chat');
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
                {!node.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        
        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">4/6</div>
            <div className="text-purple-200 text-xs">Topics Unlocked</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-300">12</div>
            <div className="text-purple-200 text-xs">Deep Dives</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-400">3</div>
            <div className="text-purple-200 text-xs">Aha! Moments</div>
          </div>
        </div>
        
        {/* Daily challenge */}
        <div className="mt-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💡</span>
            <div>
              <div className="text-yellow-300 font-bold">Daily Brain Spark</div>
              <div className="text-white text-sm">Why do we dream? Explore the mystery!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Chat screen
  const ChatScreen = () => {
    const handleChoice = (choice) => {
      setIsTyping(true);
      const newMessages = [...messages.filter(m => m.role !== 'options'), { role: 'user', text: choice }];
      setMessages(newMessages);
      
      setTimeout(() => {
        setIsTyping(false);
        const followUp = deepDives[choice];
        if (followUp) {
          setMessages([...newMessages, ...followUp]);
          setDepth(d => d + 1);
          setStars(s => s + 5);
          if (depth >= 2) {
            setShowReward(true);
            setTimeout(() => setShowReward(false), 3000);
          }
        } else {
          setMessages([...newMessages, 
            { role: 'ai', text: "🌟 Fascinating thought! Let me think about that..." },
            { role: 'ai', text: "Every question you ask opens new doors. What else makes you curious about " + selectedTopic + "?" },
            { role: 'options', choices: ["Tell me something mind-blowing!", "I want a harder challenge", "Let's explore a different topic"] }
          ]);
        }
      }, 1500);
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black flex flex-col relative">
        <StarField />
        
        {/* Reward popup */}
        {showReward && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-3xl text-center animate-bounce">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-black">Deep Thinker!</h3>
              <p className="text-black/70">You went {depth + 1} levels deep!</p>
              <p className="text-black font-bold mt-2">+10 ⭐ Stars</p>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="relative z-10 p-4 border-b border-white/10">
          <div className="flex justify-between items-center">
            <button onClick={() => setScreen('constellation')} className="text-white">← Back</button>
            <div className="text-white font-bold">{selectedTopic}</div>
            <div className="bg-purple-500/30 px-3 py-1 rounded-full text-purple-200 text-sm">
              Depth: {depth} 🌀
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 relative z-10">
          {messages.map((msg, i) => (
            <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
              {msg.role === 'ai' && (
                <div className="inline-block bg-white/10 backdrop-blur rounded-2xl rounded-tl-none p-4 max-w-[85%] text-white">
                  {msg.text}
                </div>
              )}
              {msg.role === 'user' && (
                <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl rounded-tr-none p-4 max-w-[85%] text-white">
                  {msg.text}
                </div>
              )}
              {msg.role === 'options' && (
                <div className="flex flex-col gap-2 mt-4">
                  {msg.choices.map((choice, j) => (
                    <button
                      key={j}
                      onClick={() => handleChoice(choice)}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur rounded-xl p-3 text-white text-left transition-all hover:scale-102"
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="inline-block bg-white/10 backdrop-blur rounded-2xl rounded-tl-none p-4 text-white">
              <span className="animate-pulse">Thinking...</span> 🤔
            </div>
          )}
        </div>
        
        {/* Bottom stats */}
        <div className="relative z-10 p-4 border-t border-white/10 bg-black/30">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-yellow-300 font-bold">{stars} ⭐</div>
              <div className="text-purple-200 text-xs">Stars</div>
            </div>
            <div>
              <div className="text-orange-300 font-bold">{streak} 🔥</div>
              <div className="text-purple-200 text-xs">Streak</div>
            </div>
            <div>
              <div className="text-green-300 font-bold">{depth} 🌀</div>
              <div className="text-purple-200 text-xs">Depth</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans">
      {screen === 'landing' && <LandingScreen />}
      {screen === 'ageSelect' && <AgeSelectScreen />}
      {screen === 'constellation' && <ConstellationScreen />}
      {screen === 'chat' && <ChatScreen />}
    </div>
  );
}
