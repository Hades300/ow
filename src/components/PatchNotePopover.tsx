import React, { useEffect } from 'react';
import { PatchNote } from '../types';
import { createPortal } from 'react-dom';

interface PatchNotePopoverProps {
  patches: PatchNote[];
  heroId: string;
  onClose: () => void;
}

const PatchNotePopover: React.FC<PatchNotePopoverProps> = ({ patches, heroId, onClose }) => {
  const heroPatches = patches.filter(patch => patch.hero.includes(heroId));

  // 在组件挂载时阻止背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // 按日期分组并排序
  const groupedPatches = React.useMemo(() => {
    const grouped: Record<string, PatchNote[]> = {};
    
    heroPatches.forEach(patch => {
      if (!grouped[patch.date]) {
        grouped[patch.date] = [];
      }
      grouped[patch.date].push(patch);
    });
    
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([date, patches]) => ({ date, patches }));
  }, [heroPatches]);

  // 使用 Portal 将弹出层渲染到 body 的最后
  return createPortal(
    <div className="patch-note-root">
      <div className="patch-note-overlay" onClick={onClose}>
        <div className="patch-note-popover" onClick={e => e.stopPropagation()}>
          <div className="patch-note-header">
            <h3>更新历史</h3>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="patch-note-content">
            {heroPatches.length > 0 ? (
              <div className="patch-list">
                {groupedPatches.map(({ date, patches }) => (
                  <div key={date} className="patch-date-group">
                    <div className="patch-date-header">{date}</div>
                    <div className="patch-items">
                      {patches.map((patch, index) => (
                        <div key={index} className={`patch-item ${patch.patchType}`}>
                          <div className="patch-type-indicator">
                            <div className="patch-type-badge">
                              {patch.patchType === 'buff' ? '增强' : 
                               patch.patchType === 'nerf' ? '削弱' : '更新'}
                            </div>
                          </div>
                          <div className="patch-content">{patch.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-patches">暂无更新记录</div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .patch-note-root {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 999999;
        }

        .patch-note-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: all;
        }

        .patch-note-popover {
          background-color: #1A1A1D;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
          border: 1px solid #333;
          overflow: hidden;
          animation: slideIn 0.2s ease-out;
          color: #fff;
          position: relative;
        }

        .patch-note-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #333;
          background-color: #111113;
          position: sticky;
          top: 0;
        }

        .patch-note-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
          color: #F0A500;
        }

        .close-button {
          background: none;
          border: none;
          color: #999;
          font-size: 22px;
          cursor: pointer;
          padding: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .close-button:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        .patch-note-content {
          padding: 0;
          overflow-y: auto;
          max-height: calc(80vh - 50px);
          background-color: #1A1A1D;
        }

        .patch-list {
          display: flex;
          flex-direction: column;
          background-color: #1A1A1D;
        }

        .patch-date-group {
          display: flex;
          flex-direction: column;
          background-color: #1A1A1D;
        }

        .patch-date-header {
          font-size: 16px;
          font-weight: 600;
          color: #F0A500;
          padding: 12px 16px;
          background-color: #1A1A1D;
          position: sticky;
          top: 0;
        }

        .patch-items {
          display: flex;
          flex-direction: column;
          background-color: #1A1A1D;
        }

        .patch-item {
          padding: 12px 16px;
          position: relative;
          border-left: 4px solid transparent;
          border-bottom: 1px solid #333;
          background-color: #1A1A1D;
        }

        .patch-item:last-child {
          border-bottom: none;
        }

        .patch-item.buff {
          border-left-color: #28A745;
        }

        .patch-item.nerf {
          border-left-color: #DC3545;
        }

        .patch-item.update {
          border-left-color: #F0A500;
        }

        .patch-type-indicator {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }

        .patch-type-badge {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: normal;
          display: inline-block;
        }

        .buff .patch-type-badge {
          background: rgba(40, 167, 69, 0.2);
          color: #28A745;
        }

        .nerf .patch-type-badge {
          background: rgba(220, 53, 69, 0.2);
          color: #DC3545;
        }

        .update .patch-type-badge {
          background: rgba(240, 165, 0, 0.2);
          color: #F0A500;
        }

        .patch-content {
          font-size: 14px;
          line-height: 1.5;
          color: #CCC;
          white-space: pre-line;
        }

        .no-patches {
          text-align: center;
          color: #999;
          padding: 32px;
          font-size: 14px;
        }

        @keyframes slideIn {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default PatchNotePopover; 