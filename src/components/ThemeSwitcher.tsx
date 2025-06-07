import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { currentTheme } = useTheme();

  return (
    <div className="theme-switcher">
      <div className="theme-label">
        {currentTheme.label}
      </div>

      <style jsx>{`
        .theme-switcher {
          position: relative;
        }

        .theme-label {
          padding: 8px 16px;
          border-radius: 4px;
          background: var(--button-background);
          border: 1px solid var(--border);
          color: var(--button-text);
          font-size: 14px;
          font-family: "BigNoodleTooOblique", "Koverwatch", sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
};

export default ThemeSwitcher; 