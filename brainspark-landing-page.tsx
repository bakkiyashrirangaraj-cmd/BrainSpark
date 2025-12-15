import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [childAge, setChildAge] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);

  const testimonials = [
    { name: 'Priya S.', location: 'Chennai', child: 'Son, 8', text: "My son asked me 'Why do we dream?' and then explained REM sleep to ME. BrainSpark did that in 2 weeks.", avatar: '👩‍💼' },
    { name: 'Ahmed K.', location: 'Dubai', child: 'Daughter, 6', text: "She used to just watch cartoons. Now she's obsessed with space and asks questions I can't even answer!", avatar: '👨‍💼' },
    { name: 'Lakshmi R.', location: 'Bangalore', child: 'Son, 12', text: "Finally something that challenges him intellectually. He's discussing philosophy at dinner now.", avatar: '👩‍🏫' },
    { name: 'Sarah M.', location: 'London', child: 'Twins, 9', text: "They compete to see who can go deeper in topics. Best sibling rivalry ever.", avatar: '👩‍👧‍👦' },
  ];

  const faqItems = [
    { q: 'Is it safe for my child?', a: 'Absolutely. No external links, no ads, no chat with strangers. All conversations are with our AI, designed specifically for children. Parent dashboard shows everything.' },
    { q: 'Will it replace real learning?', a: "BrainSpark supplements learning — it sparks curiosity that carries into school, books, and real-world exploration." },
    { q: 'What makes this different from educational apps?', a: "Most apps are disguised worksheets. BrainSpark is conversational, adapts to your child's interests, and builds genuine thinking skills." },
    { q: 'How much screen time is recommended?', a: "15-30 minutes of active thinking beats hours of passive watching. Our streaks encourage daily habit without excess." },
    { q: 'Does it work in my language?', a: "Yes! We support English, Tamil, Hindi, Telugu, Malayalam, and Arabic. More coming soon." },
  ];

  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    if (email && childAge) setSubmitted(true);
  };

  const StarField = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(80)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white animate-pulse"
          style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, width: Math.random()*2+1, height: Math.random()*2+1, animationDelay: `${Math.random()*3}s`, opacity: 0.4 }} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="font-bold text-xl">Brain<span className="text-yellow-400">Spark</span></span>
          </div>
          <div className="hidden md:flex gap-6 text-sm text-white/70">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#science" className="hover:text-white">Science</a>
            <a href="#testimonials" className="hover:text-white">Stories</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
          </div>
          <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
            Try Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <StarField />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm mb-6 border border-white/20">
            🎓 Trusted by 10,000+ Parents Worldwide
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Turn Screen Time Into<br/>
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Brain Time</span>
          </h1>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            An AI companion that makes your child actually WANT to think deeply. No more mindless scrolling — just endless curiosity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-orange-500/30">
              Start Free Trial →
            </button>
            <button className="bg-white/10 backdrop-blur border border-white/20 px-8 py-4 rounded-full font-medium hover:bg-white/20 transition-colors">
              ▶ Watch Demo
            </button>
          </div>
          <p className="text-white/50 text-sm">No credit card required • 7-day free trial</p>

          {/* Demo Preview */}
          <div className="mt-12 relative">
            <div className="bg-gradient-to-b from-purple-500/20 to-transparent p-1 rounded-3xl">
              <div className="bg-black/60 backdrop-blur rounded-3xl p-4 border border-white/10">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-left">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-2xl">🤖</span>
                    <div className="bg-white/10 rounded-2xl rounded-tl-none p-4 text-white">
                      Did you know there are more stars in the universe than grains of sand on Earth? 🌌 What do you think is out there?
                    </div>
                  </div>
                  <div className="flex items-start gap-3 justify-end mb-4">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl rounded-tr-none p-4 text-white">
                      Are there aliens? 👽
                    </div>
                    <span className="text-2xl">🧒</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🤖</span>
                    <div className="bg-white/10 rounded-2xl rounded-tl-none p-4 text-white">
                      Great question! Scientists think there might be billions of planets that could have life. But here's the deep question: if aliens exist, why haven't we heard from them? 🤔
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
          {[
            { value: '40%', label: 'More Questions Asked', icon: '❓' },
            { value: '3.5x', label: 'Deeper Thinking', icon: '🧠' },
            { value: '92%', label: 'Kids Want More', icon: '🔥' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-1">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-black/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Problem Every Parent Faces</h2>
          <p className="text-purple-200 mb-12 max-w-2xl mx-auto">Kids spend 7+ hours daily on screens. Most of it is passive consumption that numbs their natural curiosity.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '📱', title: 'Endless Scrolling', desc: 'Short videos train brains for instant gratification' },
              { icon: '🎮', title: 'Addictive Games', desc: 'Designed to hook, not to teach' },
              { icon: '😴', title: 'Passive Watching', desc: 'Zero thinking required, curiosity dies' },
            ].map((p, i) => (
              <div key={i} className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-left">
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="text-xl font-bold text-red-300 mb-2">{p.title}</h3>
                <p className="text-white/60">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What If Screen Time Made Kids Smarter?</h2>
            <p className="text-purple-200 max-w-2xl mx-auto">BrainSpark is designed by child psychologists and AI researchers to be as engaging as games — but builds real cognitive skills.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '🌀', title: 'The Why Chain', desc: 'Every answer opens new doors. Kids naturally go 5, 10, even 20 questions deep.' },
              { icon: '🌌', title: 'Knowledge Universe', desc: 'Visual constellation grows as they explore. Kids SEE their brain expanding.' },
              { icon: '🏆', title: 'Smart Rewards', desc: 'Stars, streaks, achievements — but earned through THINKING, not clicking.' },
              { icon: '🎯', title: 'Adaptive AI', desc: 'Conversations match their age, interests, and growing edge of knowledge.' },
            ].map((f, i) => (
              <div key={i} className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-400/30 rounded-2xl p-6">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-white/70">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Age Groups */}
      <section className="py-20 px-4 bg-black/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Designed for Every Age</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { age: '4-6', name: 'Wonder Cubs', emoji: '🐻', desc: 'Magical discoveries, simple questions, lots of celebration', color: 'from-pink-400 to-orange-400' },
              { age: '7-10', name: 'Curious Explorers', emoji: '🚀', desc: 'Adventure-driven learning, mind-bending "what ifs"', color: 'from-cyan-400 to-blue-500' },
              { age: '11-14', name: 'Mind Masters', emoji: '🧠', desc: 'Philosophy, deep reasoning, real intellectual challenge', color: 'from-purple-500 to-indigo-600' },
            ].map((g, i) => (
              <div key={i} className={`bg-gradient-to-br ${g.color} rounded-2xl p-6 text-left`}>
                <div className="text-5xl mb-4">{g.emoji}</div>
                <div className="text-white/80 text-sm mb-1">{g.age} years</div>
                <h3 className="text-2xl font-bold mb-2">{g.name}</h3>
                <p className="text-white/80">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="text-center">
              <div className="text-6xl mb-6">{testimonials[activeTestimonial].avatar}</div>
              <p className="text-xl md:text-2xl italic mb-6">"{testimonials[activeTestimonial].text}"</p>
              <div className="font-bold">{testimonials[activeTestimonial].name}</div>
              <div className="text-white/60 text-sm">{testimonials[activeTestimonial].location} • {testimonials[activeTestimonial].child}</div>
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === activeTestimonial ? 'bg-yellow-400' : 'bg-white/30'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-black/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-purple-200 mb-12">Less than a streaming subscription. More than entertainment.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '₹0', period: 'forever', features: ['3 topics', '10 questions/day', 'Basic achievements'], highlight: false },
              { name: 'Spark', price: '₹299', period: '/month', features: ['All topics', 'Unlimited questions', 'Voice mode', 'Parent dashboard', 'All achievements'], highlight: true, badge: 'Most Popular' },
              { name: 'Family', price: '₹499', period: '/month', features: ['Everything in Spark', 'Up to 4 children', 'Multiplayer challenges', 'Priority support'], highlight: false },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-6 ${plan.highlight ? 'bg-gradient-to-b from-yellow-400/20 to-orange-500/10 border-2 border-yellow-400/50 scale-105' : 'bg-white/5 border border-white/10'}`}>
                {plan.badge && <div className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">{plan.badge}</div>}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-white/60">{plan.period}</span>
                </div>
                <ul className="text-left mb-6 space-y-2">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-white/80">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-full font-bold ${plan.highlight ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' : 'bg-white/10 hover:bg-white/20'}`}>
                  Start {plan.name === 'Free' ? 'Free' : 'Trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Questions Parents Ask</h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-4 text-left flex justify-between items-center">
                  <span className="font-medium">{item.q}</span>
                  <span className="text-xl">{activeFaq === i ? '−' : '+'}</span>
                </button>
                {activeFaq === i && <div className="px-4 pb-4 text-white/70">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-black/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Child's Curiosity Is Waiting</h2>
          <p className="text-purple-200 mb-8">Join thousands of parents turning screen time into brain time</p>
          
          {!submitted ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-md mx-auto">
              <h3 className="font-bold mb-4">Get Early Access</h3>
              <input type="email" placeholder="Parent Email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 mb-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400" />
              <select value={childAge} onChange={e => setChildAge(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 mb-4 text-white focus:outline-none focus:border-purple-400">
                <option value="" className="bg-slate-800">Child's Age</option>
                <option value="4-6" className="bg-slate-800">4-6 years</option>
                <option value="7-10" className="bg-slate-800">7-10 years</option>
                <option value="11-14" className="bg-slate-800">11-14 years</option>
              </select>
              <button onClick={handleSubmit} disabled={!email || !childAge}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100">
                Join Waitlist →
              </button>
            </div>
          ) : (
            <div className="bg-green-500/20 border border-green-400/50 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-4xl mb-4">🎉</div>
              <p className="text-green-300 font-medium">You're on the list! Check your email.</p>
            </div>
          )}
          
          <p className="text-white/50 text-sm mt-4">7 days free • Cancel anytime • No credit card needed</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <span className="font-bold">BrainSpark</span>
              <span className="text-white/50 text-sm ml-2">Where Curiosity Becomes Superpower</span>
            </div>
            <div className="flex gap-6 text-sm text-white/60">
              {['About', 'Privacy', 'Terms', 'Contact', 'Blog'].map((link, i) => (
                <a key={i} href="#" className="hover:text-white">{link}</a>
              ))}
            </div>
          </div>
          <div className="text-center text-white/40 text-sm mt-8">© 2025 BrainSpark by Bakkiyam Foundation. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
