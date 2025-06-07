import React from 'react';
import { Hero, HeroStat } from '../types';

interface HeroCardProps {
  hero: Hero;
  stats?: HeroStat;
  isSelected: boolean;
  onClick: () => void;
}

const HeroCard: React.FC<HeroCardProps> = ({ hero, stats, isSelected, onClick }) => {
  const roleColors = {
    tank: '#4B9CD3',
    damage: '#E61B23',
    support: '#13A549'
  };

  return (
    <div 
      onClick={onClick}
      style={{
        border: `2px solid ${isSelected ? '#FFD700' : 'transparent'}`,
        borderRadius: '8px',
        padding: '12px',
        cursor: 'pointer',
        backgroundColor: isSelected ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'all 0.2s ease',
        width: '100%',
        maxWidth: '120px',
        boxShadow: isSelected ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none'
      }}
    >
      <div 
        style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          overflow: 'hidden',
          border: `2px solid ${roleColors[hero.hero_role]}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '8px',
          backgroundColor: '#222'
        }}
      >
        <img 
          src={hero.hero_icon} 
          alt={hero.hero_name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.png';
          }}
        />
      </div>
      <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>{hero.hero_name}</div>
      
      {stats && (
        <div style={{ fontSize: '12px', textAlign: 'center' }}>
          <div>胜率: {stats.w.toFixed(1)}%</div>
          <div>选择率: {stats.s.toFixed(1)}%</div>
          <div>击杀: {stats.k.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
};

export default HeroCard; 