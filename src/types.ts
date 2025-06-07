export interface Hero {
  hero_id: string;
  hero_name: string;
  hero_role: 'tank' | 'damage' | 'support';
  hero_icon: string;
}

export interface HeroMetaData {
  heroes: Array<{
    hero_id: string;
    hero_name: string;
    hero_role: string;
    hero_difficulty: number;
  }>;
}

export interface HeroStat {
  i: string;  // hero_id
  w: number;  // win_rate
  s: number;  // selection_rate
  k: number;  // kill_rate
}

export interface HeroStatHistory {
  [date: string]: {
    h: HeroStat[];
  };
}

export interface PatchNote {
  date: string;
  hero: string[];
  content: string;
  patchType: 'buff' | 'nerf' | 'update';
}

export interface PatchNotes {
  patch_notes: PatchNote[];
}

export interface Season {
  season_id: number;
  start_date: string;
  end_date: string;
  name: string;
}

export type ThemeName = 'dark';

export interface ThemeColors {
  background: string;
  cardBackground: string;
  cardBackgroundHover: string;
  text: string;
  secondaryText: string;
  primary: string;
  primaryTransparent: string;
  secondary: string;
  accent: string;
  border: string;
  chartGrid: string;
  success: string;
  warning: string;
  error: string;
  buttonBackground: string;
  buttonBackgroundHover: string;
  buttonText: string;
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  shadow: string;
}

export interface Theme {
  name: ThemeName;
  label: string;
  colors: ThemeColors;
} 