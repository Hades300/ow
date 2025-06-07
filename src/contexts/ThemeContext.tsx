import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, ThemeName } from '../types';

// 定义主题
const themes: Theme[] = [
  {
    name: 'dark',
    label: '暗黑主题',
    colors: {
      background: '#0D1117',
      cardBackground: '#161B22',
      cardBackgroundHover: '#21262D',
      text: '#ffffff',
      secondaryText: '#8B949E',
      primary: '#f99e1c',
      primaryTransparent: 'rgba(249, 158, 28, 0.2)',
      secondary: '#21262D',
      accent: '#ff9e1c',
      border: '#30363D',
      chartGrid: 'rgba(255, 255, 255, 0.1)',
      success: '#4ade80',
      warning: '#f99e1c',
      error: '#f87171',
      buttonBackground: '#21262D',
      buttonBackgroundHover: '#30363D',
      buttonText: '#ffffff',
      inputBackground: '#0D1117',
      inputBorder: '#30363D',
      inputText: '#ffffff',
      shadow: 'rgba(0, 0, 0, 0.3)'
    }
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeName: ThemeName) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'ow-dashboard-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  // 加载保存的主题
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      const theme = themes.find(t => t.name === savedTheme);
      if (theme) {
        setCurrentTheme(theme);
      }
    }
  }, []);

  const setTheme = (themeName: ThemeName) => {
    const theme = themes.find(t => t.name === themeName);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem(THEME_STORAGE_KEY, themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes: themes }}>
      <div className="theme-wrapper">
        {children}
        <style jsx global>{`
          :root {
            --background: ${currentTheme.colors.background};
            --card-background: ${currentTheme.colors.cardBackground};
            --card-background-hover: ${currentTheme.colors.cardBackgroundHover};
            --text: ${currentTheme.colors.text};
            --secondary-text: ${currentTheme.colors.secondaryText};
            --primary: ${currentTheme.colors.primary};
            --primary-transparent: ${currentTheme.colors.primaryTransparent};
            --secondary: ${currentTheme.colors.secondary};
            --accent: ${currentTheme.colors.accent};
            --border: ${currentTheme.colors.border};
            --chart-grid: ${currentTheme.colors.chartGrid};
            --success: ${currentTheme.colors.success};
            --warning: ${currentTheme.colors.warning};
            --error: ${currentTheme.colors.error};
            --button-background: ${currentTheme.colors.buttonBackground};
            --button-background-hover: ${currentTheme.colors.buttonBackgroundHover};
            --button-text: ${currentTheme.colors.buttonText};
            --input-background: ${currentTheme.colors.inputBackground};
            --input-border: ${currentTheme.colors.inputBorder};
            --input-text: ${currentTheme.colors.inputText};
            --shadow: ${currentTheme.colors.shadow};
          }

          body {
            background-color: var(--background);
            color: var(--text);
            transition: background-color 0.3s, color 0.3s;
          }

          button {
            background-color: var(--button-background);
            color: var(--button-text);
            border: 1px solid var(--border);
            transition: all 0.2s;
          }

          button:hover:not(:disabled) {
            background-color: var(--button-background-hover);
          }

          input {
            background-color: var(--input-background);
            color: var(--input-text);
            border: 1px solid var(--input-border);
          }

          input:focus {
            border-color: var(--primary);
            outline: none;
          }

          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          ::-webkit-scrollbar-track {
            background: var(--card-background);
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb {
            background: var(--border);
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: var(--secondary);
          }
        `}</style>
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 