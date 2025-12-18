import React from 'react';

interface MascotProps {
  ageGroup: 'wonder_cubs' | 'curious_explorers' | 'mind_masters';
  emotion?: 'happy' | 'thinking' | 'celebrating' | 'encouraging';
  size?: number;
}

export const Mascot: React.FC<MascotProps> = ({
  ageGroup,
  emotion = 'happy',
  size = 120
}) => {
  const mascots = {
    wonder_cubs: <Sparkle emotion={emotion} size={size} />,
    curious_explorers: <Nova emotion={emotion} size={size} />,
    mind_masters: <Axiom emotion={emotion} size={size} />
  };

  return (
    <div className="mascot-container animate-float">
      {mascots[ageGroup]}
    </div>
  );
};

// Sparkle the Firefly (Wonder Cubs 4-6)
const Sparkle: React.FC<{ emotion: string; size: number }> = ({ emotion, size }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className="mascot sparkle"
    >
      {/* Glow effect */}
      <defs>
        <radialGradient id="sparkle-glow">
          <stop offset="0%" stopColor="#FFE566" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Outer glow */}
      <circle cx="100" cy="100" r="60" fill="url(#sparkle-glow)" className="pulse-glow" />

      {/* Body */}
      <ellipse cx="100" cy="100" rx="35" ry="45" fill="#FFE566" filter="url(#glow)" />

      {/* Wings */}
      <ellipse cx="70" cy="90" rx="15" ry="25" fill="#E6E6FA" opacity="0.7" className="wing-flutter-left" />
      <ellipse cx="130" cy="90" rx="15" ry="25" fill="#E6E6FA" opacity="0.7" className="wing-flutter-right" />

      {/* Eyes */}
      <circle cx="90" cy="90" r="10" fill="#333" />
      <circle cx="110" cy="90" r="10" fill="#333" />
      <circle cx="92" cy="88" r="4" fill="#fff" />
      <circle cx="112" cy="88" r="4" fill="#fff" />

      {/* Smile */}
      {emotion === 'happy' && (
        <path d="M 85 105 Q 100 115 115 105" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {emotion === 'celebrating' && (
        <>
          <path d="M 85 105 Q 100 120 115 105" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
          <text x="100" y="150" fontSize="30" textAnchor="middle">✨</text>
        </>
      )}

      {/* Antennae */}
      <line x1="90" y1="65" x2="85" y2="50" stroke="#FFD700" strokeWidth="2" />
      <line x1="110" y1="65" x2="115" y2="50" stroke="#FFD700" strokeWidth="2" />
      <circle cx="85" cy="50" r="5" fill="#FFD700" className="antenna-glow" />
      <circle cx="115" cy="50" r="5" fill="#FFD700" className="antenna-glow" />
    </svg>
  );
};

// Nova the Owl (Curious Explorers 7-10)
const Nova: React.FC<{ emotion: string; size: number }> = ({ emotion, size }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className="mascot nova"
    >
      {/* Body */}
      <ellipse cx="100" cy="120" rx="50" ry="60" fill="#8B7355" />

      {/* Wings */}
      <ellipse cx="55" cy="120" rx="20" ry="40" fill="#A0826D" className="wing-subtle-left" />
      <ellipse cx="145" cy="120" rx="20" ry="40" fill="#A0826D" className="wing-subtle-right" />

      {/* Head */}
      <circle cx="100" cy="80" r="40" fill="#8B7355" />

      {/* Eyes (large and expressive) */}
      <circle cx="85" cy="75" r="18" fill="#fff" />
      <circle cx="115" cy="75" r="18" fill="#fff" />
      <circle cx="85" cy="75" r="12" fill="#333" />
      <circle cx="115" cy="75" r="12" fill="#333" />
      <circle cx="88" cy="72" r="5" fill="#fff" />
      <circle cx="118" cy="72" r="5" fill="#fff" />

      {/* Beak */}
      <polygon points="100,85 95,95 105,95" fill="#FFD700" />

      {/* Explorer goggles */}
      <ellipse cx="85" cy="70" rx="22" ry="20" fill="none" stroke="#20B2AA" strokeWidth="2" />
      <ellipse cx="115" cy="70" rx="22" ry="20" fill="none" stroke="#20B2AA" strokeWidth="2" />
      <line x1="107" y1="70" x2="93" y2="70" stroke="#20B2AA" strokeWidth="2" />

      {/* Feather tufts */}
      <path d="M 70 60 L 65 50 L 72 58" fill="#A0826D" />
      <path d="M 130 60 L 135 50 L 128 58" fill="#A0826D" />

      {emotion === 'curious' && (
        <text x="100" y="160" fontSize="20" textAnchor="middle">🔭</text>
      )}
    </svg>
  );
};

// Axiom the Phoenix (Mind Masters 11-14)
const Axiom: React.FC<{ emotion: string; size: number }> = ({ emotion, size }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className="mascot axiom"
    >
      <defs>
        <linearGradient id="phoenix-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DC143C" />
          <stop offset="100%" stopColor="#DAA520" />
        </linearGradient>
        <filter id="flame-glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Flame aura */}
      <path
        d="M 100 40 Q 80 60 85 90 T 100 130 Q 115 110 115 90 T 100 40"
        fill="url(#phoenix-gradient)"
        opacity="0.3"
        filter="url(#flame-glow)"
        className="flame-flicker"
      />

      {/* Body */}
      <ellipse cx="100" cy="110" rx="35" ry="45" fill="url(#phoenix-gradient)" />

      {/* Wings (angular, flame-like) */}
      <path
        d="M 65 100 L 50 90 L 55 110 L 45 115 L 60 125 Z"
        fill="#DC143C"
        opacity="0.8"
        className="wing-flame-left"
      />
      <path
        d="M 135 100 L 150 90 L 145 110 L 155 115 L 140 125 Z"
        fill="#DC143C"
        opacity="0.8"
        className="wing-flame-right"
      />

      {/* Head */}
      <circle cx="100" cy="75" r="25" fill="url(#phoenix-gradient)" />

      {/* Eyes (sharp, confident) */}
      <ellipse cx="92" cy="72" rx="6" ry="8" fill="#FFD700" />
      <ellipse cx="108" cy="72" rx="6" ry="8" fill="#FFD700" />
      <ellipse cx="92" cy="72" rx="3" ry="4" fill="#333" />
      <ellipse cx="108" cy="72" rx="3" ry="4" fill="#333" />

      {/* Beak */}
      <polygon points="100,78 97,83 103,83" fill="#DAA520" />

      {/* Crest (flame-like feathers) */}
      <path d="M 100 55 L 95 45 L 98 55 Z" fill="#DC143C" />
      <path d="M 100 55 L 105 48 L 102 55 Z" fill="#FFD700" />
      <path d="M 90 60 L 88 52 L 92 58 Z" fill="#DC143C" opacity="0.7" />
      <path d="M 110 60 L 112 52 L 108 58 Z" fill="#DAA520" opacity="0.7" />

      {emotion === 'challenging' && (
        <text x="100" y="165" fontSize="20" textAnchor="middle">🔥</text>
      )}
    </svg>
  );
};
