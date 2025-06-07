export interface Hero {
  hero_id: string;
  hero_name: string;
  hero_icon: string;
  hero_role: 'tank' | 'damage' | 'support';
}

export interface HeroMetaData {
  heroes: Hero[];
}

export interface HeroStat {
  i: string; // hero_id
  t: string; // type/role (1: damage, 2: tank, 3: support)
  s: number; // pick rate
  w: number; // win rate
  k: number; // kill per 10 min
  d: string; // date
}

export interface DailyData {
  s: string; // season
  h: HeroStat[]; // heroes stats
}

export interface MergedData {
  [date: string]: DailyData;
}

export interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

export interface SeasonsData {
  seasons: Season[];
}

export interface PatchNote {
  date: string;
  hero: string[];
  content: string;
  patchType: 'buff' | 'nerf' | 'update';
}

export interface PatchNotesData {
  patches: PatchNote[];
}

export interface HeroStatHistory {
  date: string;
  stats: Record<string, {
    w: number;
    s: number;
    k: number;
  }>;
} 