import { useState, useEffect, useRef } from 'react';

// ============================================================
// Voice Mode Component for BrainSpark
// Enables younger kids to interact through speech
// ============================================================

export default function VoiceMode() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [volume, setVolume] = useState(80);
  const [speed, setSpeed] = useState(0.9);
  const [messages, setMessages] = useState([]);
  const [visualizerData, setVisualizerData] = useState(new Array(20).fill(10));
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const text = result[0].transcript;
        setTranscript(text);
        
        if (result.isFinal) {
          handleUserSpeech(text);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Load available voices
    const loadVoices = () => {
      const voices = synthRef.current.getVoices();
      // Prefer child-friendly voices
      const preferredVoice = voices.find(v => 
        v.name.includes('Female') || 
        v.name.includes('Samantha') ||
        v.name.includes('Google UK English Female')
      ) || voices[0];
      setSelectedVoice(preferredVoice);
    };

    synthRef.current.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Audio visualizer animation
  useEffect(() => {
    if (isListening || isSpeaking) {
      const animate = () => {
        setVisualizerData(prev => 
          prev.map(() => Math.random() * 50 + 10)
        );
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      setVisualizerData(new Array(20).fill(10));
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  }, [isListening, isSpeaking]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleUserSpeech = async (text) => {
    if (!text.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text, timestamp: new Date() }]);
    
    // Simulate AI response (in production, call Claude API)
    const response = await getAIResponse(text);
    setAiResponse(response);
    setMessages(prev => [...prev, { role: 'ai', text: response, timestamp: new Date() }]);
    
    // Speak the response
    if (voiceEnabled) {
      speakResponse(response);
    }
  };

  const getAIResponse = async (userText) => {
    // Demo responses for voice mode
    const responses = {
      space: "Wow! Space is amazing! Did you know that on Mars, a day is almost the same length as a day on Earth? What else would you like to know about space?",
      animal: "Animals are incredible! My favorite fact is that octopuses have three hearts! Which animal do you think is the coolest?",
      why: "That's such a great question! The world is full of mysteries waiting to be solved. What do YOU think the answer might be?",
      default: "I love how curious you are! Keep asking questions - that's how we learn amazing things! What else are you wondering about?"
    };

    const lowerText = userText.toLowerCase();
    if (lowerText.includes('space') || lowerText.includes('star') || lowerText.includes('planet')) {
      return responses.space;
    } else if (lowerText.includes('animal') || lowerText.includes('dog') || lowerText.includes('cat')) {
      return responses.animal;
    } else if (lowerText.includes('why')) {
      return responses.why;
    }
    return responses.default;
  };

  const speakResponse = (text) => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = speed;
    utterance.volume = volume / 100;
    utterance.pitch = 1.1; // Slightly higher pitch for friendlier tone

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  // Character states based on activity
  const getCharacterState = () => {
    if (isListening) return { emoji: '👂', text: "I'm listening...", color: 'from-green-400 to-emerald-500' };
    if (isSpeaking) return { emoji: '🗣️', text: "Let me tell you...", color: 'from-blue-400 to-cyan-500' };
    return { emoji: '🤗', text: "Tap to talk!", color: 'from-purple-400 to-pink-500' };
  };

  const character = getCharacterState();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">🎤 Voice Mode</h1>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              voiceEnabled ? 'bg-green-500 text-white' : 'bg-white/20 text-white/60'
            }`}
          >
            {voiceEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
          </button>
        </div>

        {/* Main Character / Visualizer */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-6 border border-white/20">
          {/* Audio Visualizer */}
          <div className="flex justify-center items-end gap-1 h-24 mb-6">
            {visualizerData.map((height, i) => (
              <div
                key={i}
                className={`w-2 rounded-full bg-gradient-to-t ${character.color} transition-all duration-75`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>

          {/* Character Display */}
          <div className="text-center">
            <div className={`text-8xl mb-4 transition-transform ${isListening || isSpeaking ? 'animate-bounce' : ''}`}>
              {character.emoji}
            </div>
            <p className={`text-xl font-medium bg-gradient-to-r ${character.color} bg-clip-text text-transparent`}>
              {character.text}
            </p>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="mt-6 bg-white/10 rounded-xl p-4">
              <p className="text-white/60 text-xs mb-1">You said:</p>
              <p className="text-white text-lg">{transcript}</p>
            </div>
          )}
        </div>

        {/* Main Action Button */}
        <div className="flex justify-center mb-6">
          {isListening ? (
            <button
              onClick={stopListening}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse"
            >
              <div className="text-center">
                <div className="text-4xl mb-1">🛑</div>
                <span className="text-white text-sm font-medium">Stop</span>
              </div>
            </button>
          ) : isSpeaking ? (
            <button
              onClick={stopSpeaking}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/50 animate-pulse"
            >
              <div className="text-center">
                <div className="text-4xl mb-1">⏸️</div>
                <span className="text-white text-sm font-medium">Pause</span>
              </div>
            </button>
          ) : (
            <button
              onClick={startListening}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50 hover:scale-105 active:scale-95 transition-transform"
            >
              <div className="text-center">
                <div className="text-4xl mb-1">🎤</div>
                <span className="text-white text-sm font-medium">Talk to me!</span>
              </div>
            </button>
          )}
        </div>

        {/* Quick Prompts for Kids */}
        <div className="mb-6">
          <p className="text-white/60 text-sm text-center mb-3">Or try saying:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["Why is the sky blue?", "Tell me about dinosaurs!", "What's in space?", "How do birds fly?"].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleUserSpeech(prompt)}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-white text-sm transition-colors border border-white/20"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation History */}
        {messages.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 max-h-60 overflow-y-auto">
            <h3 className="text-white/60 text-sm mb-3">Our Chat</h3>
            <div className="space-y-3">
              {messages.slice(-6).map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-purple-500/50 text-white rounded-br-sm'
                      : 'bg-white/20 text-white rounded-bl-sm'
                  }`}>
                    <span className="mr-2">{msg.role === 'user' ? '🧒' : '🤖'}</span>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <h3 className="text-white font-medium mb-4">⚙️ Voice Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-sm">Volume</label>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="text-white/60 text-sm">Speed (slower is easier for kids)</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Browser Support Notice */}
        {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
          <div className="mt-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 text-center">
            <p className="text-yellow-300 text-sm">
              ⚠️ Voice mode works best in Chrome or Edge browsers
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
