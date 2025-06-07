import React, { useState, useMemo } from 'react';
import { Hero, HeroStat, PatchNote } from '../types';
import PatchNotePopover from './PatchNotePopover';

interface HeroSelectorProps {
  heroes: Hero[];
  selectedHeroes: string[];
  latestStats: Record<string, HeroStat>;
  patches?: PatchNote[];
  onHeroToggle: (heroId: string) => void;
  onClearSelection: () => void;
}

const HEROES_PER_PAGE = 12;

const HeroSelector: React.FC<HeroSelectorProps> = ({
  heroes,
  selectedHeroes,
  latestStats,
  patches = [],
  onHeroToggle,
  onClearSelection
}) => {
  console.log(patches);
  

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'tank' | 'damage' | 'support'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatchHero, setSelectedPatchHero] = useState<string | null>(null);

  const filteredHeroes = useMemo(() => {
    return heroes.filter(hero => {
      const matchesSearch = hero.hero_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || hero.hero_role.toLowerCase() === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [heroes, searchTerm, selectedRole]);

  const totalPages = Math.ceil(filteredHeroes.length / HEROES_PER_PAGE);
  const paginatedHeroes = filteredHeroes.slice(
    (currentPage - 1) * HEROES_PER_PAGE,
    currentPage * HEROES_PER_PAGE
  );

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole]);

  // 获取最近更新的英雄
  const recentlyUpdatedHeroes = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    return patches
      .filter(patch => {
        const patchDate = new Date(patch.date);
        return patchDate >= thirtyDaysAgo;
      })
      .reduce((acc, patch) => {
        patch.hero.forEach(heroId => acc.add(heroId));
        return acc;
      }, new Set<string>());
  }, [patches]);

  return (
    <div className="hero-selector">
      <div className="hero-selector-header">
        <h2 className="section-title">英雄选择</h2>
        <div className="search-bar">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索英雄..."
            className="search-input"
          />
          <button onClick={onClearSelection} className="clear-button">
            清除选择
          </button>
        </div>
        <div className="role-filters">
          <button
            className={`role-button ${selectedRole === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedRole('all')}
          >
            全部
          </button>
          <button
            className={`role-button ${selectedRole === 'tank' ? 'active' : ''}`}
            onClick={() => setSelectedRole('tank')}
          >
            坦克
          </button>
          <button
            className={`role-button ${selectedRole === 'damage' ? 'active' : ''}`}
            onClick={() => setSelectedRole('damage')}
          >
            输出
          </button>
          <button
            className={`role-button ${selectedRole === 'support' ? 'active' : ''}`}
            onClick={() => setSelectedRole('support')}
          >
            支援
          </button>
        </div>
      </div>

      <div className="heroes-grid">
        {paginatedHeroes.map((hero) => {
          const isSelected = selectedHeroes.includes(hero.hero_id);
          const stats = latestStats[hero.hero_id];
          const hasRecentUpdate = recentlyUpdatedHeroes.has(hero.hero_id);
          
          return (
            <div
              key={hero.hero_id}
              className={`hero-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onHeroToggle(hero.hero_id)}
            >
              <div className="hero-image-container">
                <img
                  src={hero.hero_icon}
                  alt={hero.hero_name}
                  className="hero-image"
                />
                <div className="hero-role-icon">
                  <span className={`role-icon ${hero.hero_role.toLowerCase()}`} />
                </div>
                {hasRecentUpdate && (
                  <button 
                    className="patch-note-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPatchHero(hero.hero_id);
                    }}
                  >
                    <span className="patch-icon">★</span>
                  </button>
                )}
              </div>
              <div className="hero-info">
                <div className="hero-name">{hero.hero_name}</div>
                {stats && (
                  <div className="hero-stats">
                    <span className="stat">胜率: {(stats.w).toFixed(1)}%</span>
                    <span className="stat">选率: {(stats.s).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            上一页
          </button>
          <span className="page-info">
            {currentPage} / {totalPages}
          </span>
          <button
            className="page-button"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            下一页
          </button>
        </div>
      )}

      {selectedPatchHero && (
        <PatchNotePopover
          patches={patches}
          heroId={selectedPatchHero}
          onClose={() => setSelectedPatchHero(null)}
        />
      )}

      <style jsx>{`
        .hero-selector {
          background: var(--card-background);
          border-radius: 12px;
          padding: 16px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          font-family: "BigNoodleTooOblique", "Koverwatch", sans-serif;
        }

        .hero-selector-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 500;
          color: var(--text);
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .search-bar {
          position: relative;
          width: 100%;
        }

        .search-input {
          width: 100%;
          padding: 8px 36px 8px 12px;
          border-radius: 4px;
          background: var(--input-background);
          border: 1px solid var(--input-border);
          color: var(--input-text);
          font-size: 14px;
          transition: all 0.2s;
          font-family: "Koverwatch", sans-serif;
        }

        .search-input:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 2px var(--primary-transparent);
        }

        .clear-button {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--secondary-text);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          font-size: 12px;
          transition: all 0.2s;
          font-family: "Koverwatch", sans-serif;
        }

        .clear-button:hover {
          color: var(--text);
          background: var(--secondary);
        }

        .role-filters {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: var(--secondary);
          border-radius: 4px;
        }

        .role-button {
          flex: 1;
          padding: 6px 8px;
          border-radius: 4px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--button-text);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-family: "BigNoodleTooOblique", "Koverwatch", sans-serif;
        }

        .role-button:hover {
          background: var(--button-background-hover);
        }

        .role-button.active {
          background: var(--primary);
          border-color: var(--primary);
          box-shadow: 0 0 12px var(--primary-transparent);
        }

        .heroes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding: 8px;
          overflow-y: auto;
          flex: 1;
          min-height: 0;
          grid-auto-rows: 1fr;
        }

        .hero-card {
          position: relative;
          aspect-ratio: 1;
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: var(--secondary);
          border: 1px solid var(--border);
          width: 100%;
          height: 100%;
        }

        .hero-card:hover {
          transform: translateY(-2px);
          border-color: var(--primary);
          box-shadow: 0 4px 12px var(--shadow);
        }

        .hero-card.selected {
          border-color: var(--primary);
          box-shadow: 0 0 16px var(--primary-transparent);
        }

        .hero-image-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
          filter: brightness(1.1) contrast(1.1);
        }

        .hero-card:hover .hero-image {
          transform: scale(1.05);
        }

        .hero-role-icon {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 16px;
          height: 16px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .role-icon {
          width: 12px;
          height: 12px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }

        .role-icon.tank {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f99e1c"><path d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3zm0 4c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z"/></svg>');
        }

        .role-icon.damage {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f99e1c"><path d="M12 2L2 12l10 10 10-10L12 2zm-1 12H7v-2h4V8h2v4h4v2h-4v4h-2v-4z"/></svg>');
        }

        .role-icon.support {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f99e1c"><path d="M12 2L2 7l2 11h16l2-11L12 2zm0 4c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z"/></svg>');
        }

        .hero-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 8px;
          background: linear-gradient(to top, 
            rgba(0, 0, 0, 0.95) 0%,
            rgba(0, 0, 0, 0.85) 30%,
            rgba(0, 0, 0, 0.6) 60%,
            rgba(0, 0, 0, 0.2) 80%,
            rgba(0, 0, 0, 0) 100%
          );
          color: var(--text);
          font-family: "BigNoodleTooOblique", "Koverwatch", sans-serif;
        }

        .hero-name {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 1);
          color: #fff;
        }

        .hero-stats {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 1);
        }

        .stat {
          display: inline-block;
          background: rgba(0, 0, 0, 0.4);
          padding: 1px 4px;
          border-radius: 2px;
          font-size: 11px;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0 4px;
          border-top: 1px solid var(--border);
          margin-top: 8px;
        }

        .page-button {
          padding: 4px 12px;
          border-radius: 4px;
          background: var(--button-background);
          border: 1px solid var(--border);
          color: var(--button-text);
          font-size: 12px;
          transition: all 0.2s;
        }

        .page-button:hover:not(:disabled) {
          background: var(--button-background-hover);
          transform: translateY(-1px);
        }

        .page-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 12px;
          color: var(--secondary-text);
        }

        @media (max-width: 1200px) {
          .hero-selector {
            height: auto;
            max-height: none;
          }

          .heroes-grid {
            grid-template-columns: repeat(6, 1fr);
            gap: 16px;
            padding: 8px;
          }
        }

        @media (max-width: 768px) {
          .heroes-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            padding: 6px;
          }

          .hero-selector h2 {
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .heroes-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            padding: 4px;
          }

          .role-filters {
            flex-wrap: wrap;
          }

          .role-button {
            flex: 1 1 calc(50% - 4px);
            font-size: 12px;
          }

          .hero-selector h2 {
            font-size: 18px;
          }

          .hero-name {
            font-size: 12px;
          }

          .hero-stats {
            font-size: 10px;
          }
        }

        .patch-note-button {
          position: absolute;
          top: 4px;
          left: 4px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--primary);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          color: #fff;
          font-size: 14px;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          z-index: 2;
        }

        .patch-note-button:hover {
          transform: scale(1.1);
          background: var(--accent);
        }

        .patch-icon {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSelector; 