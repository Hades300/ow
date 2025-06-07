import React, { useState, useMemo } from 'react';
import { useHeroData } from '../hooks/useHeroData';
import HeroSelector from './HeroSelector';
import StatsChart from './StatsChart';
import ThemeSwitcher from './ThemeSwitcher';
// import { useTheme } from '../contexts/ThemeContext';
import { HeroStat } from '../types';

const Dashboard: React.FC = () => {
  // const { currentTheme } = useTheme();
  const { 
    heroMeta, 
    mergedData, 
    patchNotes,
    loading, 
    error, 
    selectedHeroes,
    availableDates,
    getHeroById,
    getHeroStatHistoryForSelectedHeroes,
    toggleHeroSelection,
    clearHeroSelection
  } = useHeroData();

  const [activeStatType, setActiveStatType] = useState<'w' | 's' | 'k'>('w');

  // Get the latest date from the data
  const latestDate = useMemo(() => {
    if (!availableDates.length) return '';
    return availableDates[availableDates.length - 1];
  }, [availableDates]);

  // Get the latest stats for all heroes
  const latestStats = useMemo(() => {
    if (!mergedData || !latestDate) return {};
    
    const result: Record<string, HeroStat> = {};
    
    mergedData[latestDate]?.h.forEach(stat => {
      result[stat.i] = stat;
    });
    
    return result;
  }, [mergedData, latestDate]);

  // Get hero stat history for selected heroes
  const heroStatHistory = useMemo(() => {
    const history = getHeroStatHistoryForSelectedHeroes();
    return history || {};
  }, [getHeroStatHistoryForSelectedHeroes, selectedHeroes]);

  // Generate colors for each hero
  const heroColors = useMemo(() => {
    const colors: Record<string, string> = {};
    const baseColors = [
      '#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#33FFF5', 
      '#FF8C33', '#8CFF33', '#338CFF', '#FF33D1', '#33FFD1'
    ];
    
    selectedHeroes.forEach((heroId, index) => {
      colors[heroId] = baseColors[index % baseColors.length];
    });
    
    return colors;
  }, [selectedHeroes]);

  // Generate hero names mapping
  const heroNames = useMemo(() => {
    const names: Record<string, string> = {};
    
    if (heroMeta) {
      heroMeta.heroes.forEach(hero => {
        names[hero.hero_id] = hero.hero_name;
      });
    }
    
    return names;
  }, [heroMeta]);

  // Get patch dates
  const patchDates = useMemo(() => {
    if (!patchNotes) return [];
    return patchNotes.patches?.map(note => note.date) || [];
  }, [patchNotes]);

  // 将 patchNotes 转换为 HeroSelector 需要的格式
  const heroPatches = useMemo(() => {
    if (!patchNotes || !patchNotes.patches) return [];
    return patchNotes.patches;
  }, [patchNotes]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <div className="error-message">错误: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>守望先锋英雄数据分析</h1>
          <ThemeSwitcher />
        </div>
      </header>

      <div className="dashboard-content">
        <div className="sidebar">
          <div className="hero-selector-container">
            {heroMeta && (
              <HeroSelector
                heroes={heroMeta.heroes}
                latestStats={latestStats}
                selectedHeroes={selectedHeroes}
                patches={heroPatches}
                onHeroToggle={toggleHeroSelection}
                onClearSelection={clearHeroSelection}
              />
            )}
          </div>
        </div>

        <div className="main-content">
          <div className="stats-container">
            <div className="stats-header">
              <h2>英雄数据趋势</h2>
              <div className="stat-type-buttons">
                <button
                  onClick={() => setActiveStatType('w')}
                  className={`stat-button ${activeStatType === 'w' ? 'active' : ''}`}
                >
                  胜率
                </button>
                <button
                  onClick={() => setActiveStatType('s')}
                  className={`stat-button ${activeStatType === 's' ? 'active' : ''}`}
                >
                  选择率
                </button>
                <button
                  onClick={() => setActiveStatType('k')}
                  className={`stat-button ${activeStatType === 'k' ? 'active' : ''}`}
                >
                  击杀数
                </button>
              </div>
            </div>

            {selectedHeroes.length > 0 ? (
              <StatsChart
                data={heroStatHistory}
                statType={activeStatType}
                heroColors={heroColors}
                heroNames={heroNames}
                patchDates={patchDates}
                heroMeta={heroMeta}
              />
            ) : (
              <div className="empty-chart">
                <p>请选择至少一个英雄来查看数据</p>
              </div>
            )}
          </div>

          {/* Patch Notes Section */}
          {patchNotes && patchNotes.patches && patchNotes.patches.length > 0 && (
            <div className="patch-notes">
              <h2>更新日志</h2>
              <div className="patch-notes-list">
                {/* 按日期分组显示补丁 */}
                {(() => {
                  // 获取唯一日期并按降序排序
                  const uniqueDates = [...new Set(patchNotes.patches.map(patch => patch.date))].sort().reverse();
                  
                  return uniqueDates.map(date => {
                    // 获取当前日期的所有补丁
                    const patchesForDate = patchNotes.patches.filter(patch => patch.date === date);
                    
                    return (
                      <div key={date} className="patch-date-group">
                        <div className="patch-date-header">{date}</div>
                        <div className="patch-heroes-list">
                          {patchesForDate.map((patch, index) => {
                            const hero = getHeroById(patch.hero[0]);
                            const patchTypeClass = `patch-type-${patch.patchType}`;
                            
                            return (
                              <div key={index} className={`patch-hero-card ${patchTypeClass}`}>
                                <div className="patch-hero-header">
                                  <div className="patch-hero-icon">
                                    {hero && (
                                      <img 
                                        src={hero.hero_icon} 
                                        alt={hero.hero_name} 
                                        className="hero-icon"
                                      />
                                    )}
                                  </div>
                                  <div className="patch-hero-name">
                                    {hero?.hero_name || patch.hero[0]}
                                    <div className={`patch-type-badge ${patch.patchType}`}>
                                      {patch.patchType === 'buff' ? '增强' : 
                                       patch.patchType === 'nerf' ? '削弱' : '更新'}
                                    </div>
                                  </div>
                                </div>
                                <div className="patch-content">
                                  {patch.content}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          padding: 24px;
          max-width: 1440px;
          margin: 0 auto;
          min-height: 100vh;
          background: var(--background);
          transition: all 0.3s;
        }

        .dashboard-header {
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .dashboard-header h1 {
          font-size: 32px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 24px;
        }

        .sidebar {
          position: relative;
        }

        .hero-selector-container {
          position: sticky;
          top: 24px;
          height: calc(100vh - 100px);
          min-height: 600px;
          max-height: 800px;
          overflow-y: auto;
        }

        .main-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 0; /* 防止内容溢出 */
        }

        .stats-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stats-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .stat-type-buttons {
          display: flex;
          gap: 8px;
        }

        .stat-button {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--button-background);
          color: var(--button-text);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .stat-button:hover {
          background: var(--button-background-hover);
        }

        .stat-button.active {
          background: var(--primary);
          border-color: var(--primary);
          color: var(--button-text);
        }

        .empty-chart {
          height: 400px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: var(--card-background);
          border-radius: 12px;
          color: var(--secondary-text);
          font-size: 16px;
        }

        .patch-notes {
          background: #1A1A1D;
          border-radius: 8px;
          padding: 0;
          margin-top: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          border: 1px solid #333;
          overflow: hidden;
        }

        .patch-notes h2 {
          font-size: 18px;
          font-weight: 500;
          color: #F0A500;
          margin: 0;
          padding: 12px 16px;
          border-bottom: 1px solid #333;
          background: #111113;
        }

        .patch-notes-list {
          display: flex;
          flex-direction: column;
          max-height: 600px;
          overflow-y: auto;
          padding: 0;
        }

        .patch-date-group {
          display: flex;
          flex-direction: column;
        }

        .patch-date-header {
          font-size: 16px;
          font-weight: 600;
          color: #F0A500;
          padding: 12px 16px;
          background: #1A1A1D;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .patch-heroes-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1px;
          background: #222;
        }

        .patch-hero-card {
          background: #1A1A1D;
          padding: 12px 16px;
          border-left: 4px solid transparent;
          transition: all 0.2s;
        }

        .patch-hero-card:hover {
          background: #222;
        }

        .patch-hero-card.patch-type-buff {
          border-left-color: #28A745;
        }

        .patch-hero-card.patch-type-nerf {
          border-left-color: #DC3545;
        }

        .patch-hero-card.patch-type-update {
          border-left-color: #F0A500;
        }

        .patch-hero-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .patch-hero-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background: #333;
          flex-shrink: 0;
        }

        .hero-icon {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .patch-hero-name {
          font-weight: 500;
          color: #FFF;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .patch-type-badge {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: normal;
          display: inline-block;
        }

        .patch-type-badge.buff {
          background: rgba(40, 167, 69, 0.2);
          color: #28A745;
        }

        .patch-type-badge.nerf {
          background: rgba(220, 53, 69, 0.2);
          color: #DC3545;
        }

        .patch-type-badge.update {
          background: rgba(240, 165, 0, 0.2);
          color: #F0A500;
        }

        .patch-content {
          font-size: 14px;
          line-height: 1.5;
          color: #CCC;
          white-space: pre-line;
          max-height: 300px;
          overflow-y: auto;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 16px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--secondary);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          color: var(--secondary-text);
          font-size: 16px;
        }

        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 16px;
        }

        .error-icon {
          font-size: 48px;
        }

        .error-message {
          color: var(--error);
          font-size: 16px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1200px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }

          .hero-selector-container {
            position: static;
            height: auto;
            min-height: auto;
            max-height: none;
            margin-bottom: 24px;
          }
        }

        @media (max-width: 768px) {
          .dashboard {
            padding: 16px;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .dashboard-header h1 {
            font-size: 24px;
          }

          .stats-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .stat-type-buttons {
            width: 100%;
          }

          .stat-button {
            flex: 1;
            text-align: center;
          }

          .patch-heroes-list {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .dashboard-header h1 {
            font-size: 20px;
          }

          .stats-header h2 {
            font-size: 20px;
          }

          .patch-notes h2 {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard; 