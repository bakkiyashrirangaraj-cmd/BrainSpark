import React, { useState } from 'react';

interface ConstellationNode {
  id: number;
  name: string;
  emoji: string;
  x: number;
  y: number;
  connections: number[];
  unlocked: boolean;
  depth: number;
}

interface KnowledgeConstellationProps {
  nodes: ConstellationNode[];
  onNodeClick: (node: ConstellationNode) => void;
  userProgress?: Record<number, { depth: number; unlocked: boolean }>;
}

export const KnowledgeConstellation: React.FC<KnowledgeConstellationProps> = ({
  nodes,
  onNodeClick,
  userProgress = {}
}) => {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  // SVG dimensions
  const width = 800;
  const height = 600;

  // Get node progress
  const getNodeStatus = (nodeId: number) => {
    const progress = userProgress[nodeId];
    return {
      unlocked: progress?.unlocked ?? false,
      depth: progress?.depth ?? 0
    };
  };

  // Convert percentage coordinates to SVG coordinates
  const getNodePosition = (node: ConstellationNode) => ({
    x: (node.x / 100) * width,
    y: (node.y / 100) * height
  });

  // Render connection lines
  const renderConnections = () => {
    const lines: JSX.Element[] = [];

    nodes.forEach(node => {
      const nodePos = getNodePosition(node);
      const nodeStatus = getNodeStatus(node.id);

      node.connections.forEach(targetId => {
        const targetNode = nodes.find(n => n.id === targetId);
        if (!targetNode) return;

        const targetPos = getNodePosition(targetNode);
        const targetStatus = getNodeStatus(targetId);

        // Only show connection if both nodes are unlocked
        const bothUnlocked = nodeStatus.unlocked && targetStatus.unlocked;

        lines.push(
          <line
            key={`${node.id}-${targetId}`}
            x1={nodePos.x}
            y1={nodePos.y}
            x2={targetPos.x}
            y2={targetPos.y}
            stroke={bothUnlocked ? '#FFD700' : '#444'}
            strokeWidth={bothUnlocked ? 2 : 1}
            strokeDasharray={bothUnlocked ? '0' : '5,5'}
            opacity={bothUnlocked ? 0.6 : 0.2}
            className={bothUnlocked ? 'connection-line-active' : 'connection-line-locked'}
          />
        );
      });
    });

    return lines;
  };

  // Render star nodes
  const renderNodes = () => {
    return nodes.map(node => {
      const pos = getNodePosition(node);
      const status = getNodeStatus(node.id);
      const isHovered = hoveredNode === node.id;

      // Calculate star size based on depth
      const baseSize = 20;
      const depthBonus = status.depth * 2;
      const starSize = baseSize + depthBonus;

      return (
        <g
          key={node.id}
          className="constellation-node-group"
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => status.unlocked && onNodeClick(node)}
          style={{ cursor: status.unlocked ? 'pointer' : 'not-allowed' }}
        >
          {/* Glow effect for unlocked nodes */}
          {status.unlocked && (
            <circle
              cx={pos.x}
              cy={pos.y}
              r={starSize + 10}
              fill="url(#starGlow)"
              opacity={isHovered ? 0.8 : 0.4}
              className="star-glow-effect"
            />
          )}

          {/* Star shape */}
          <StarShape
            cx={pos.x}
            cy={pos.y}
            size={isHovered ? starSize * 1.2 : starSize}
            fill={status.unlocked ? '#FFD700' : '#444'}
            unlocked={status.unlocked}
          />

          {/* Depth indicator */}
          {status.depth > 0 && (
            <text
              x={pos.x}
              y={pos.y + 5}
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="#000"
            >
              {status.depth}
            </text>
          )}

          {/* Emoji icon */}
          <text
            x={pos.x}
            y={pos.y - starSize - 5}
            textAnchor="middle"
            fontSize="24"
            className="node-emoji"
          >
            {node.emoji}
          </text>

          {/* Node name */}
          <text
            x={pos.x}
            y={pos.y + starSize + 20}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill={status.unlocked ? '#FFF' : '#666'}
            className="node-name"
          >
            {node.name}
          </text>

          {/* Lock icon for locked nodes */}
          {!status.unlocked && (
            <text
              x={pos.x}
              y={pos.y + 5}
              textAnchor="middle"
              fontSize="20"
            >
              🔒
            </text>
          )}
        </g>
      );
    });
  };

  return (
    <div className="knowledge-constellation-container">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="constellation-svg"
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, #1a1a3e 0%, #0a0a1e 100%)'
        }}
      >
        {/* Gradients and filters */}
        <defs>
          <radialGradient id="starGlow">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFA500" stopOpacity="0" />
          </radialGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background stars */}
        <BackgroundStars />

        {/* Connection lines */}
        {renderConnections()}

        {/* Star nodes */}
        {renderNodes()}
      </svg>

      {/* Legend */}
      <div className="constellation-legend">
        <div className="legend-item">
          <span className="legend-icon">⭐</span>
          <span>Unlocked</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">🔒</span>
          <span>Locked</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">📊</span>
          <span>Number = Depth Level</span>
        </div>
      </div>
    </div>
  );
};

// Star shape component
const StarShape: React.FC<{
  cx: number;
  cy: number;
  size: number;
  fill: string;
  unlocked: boolean;
}> = ({ cx, cy, size, fill, unlocked }) => {
  const points = [];
  const spikes = 5;
  const outerRadius = size;
  const innerRadius = size * 0.5;

  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }

  return (
    <polygon
      points={points.join(' ')}
      fill={fill}
      stroke={unlocked ? '#FFA500' : '#666'}
      strokeWidth="2"
      filter={unlocked ? 'url(#glow)' : 'none'}
      className={unlocked ? 'star-unlocked' : 'star-locked'}
    />
  );
};

// Background starfield
const BackgroundStars: React.FC = () => {
  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * 800,
    y: Math.random() * 600,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.5 + 0.3
  }));

  return (
    <g className="background-stars">
      {stars.map(star => (
        <circle
          key={star.id}
          cx={star.x}
          cy={star.y}
          r={star.size}
          fill="white"
          opacity={star.opacity}
          className="star"
          style={{
            '--duration': `${2 + Math.random() * 2}s`,
            '--delay': `${Math.random() * 2}s`
          } as React.CSSProperties}
        />
      ))}
    </g>
  );
};
