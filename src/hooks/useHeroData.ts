import { useState, useEffect, useCallback, useMemo } from 'react';
import { Hero, HeroStat } from '../types';

interface HeroMetaData {
  heroes: Hero[];
}

interface MergedData {
  [date: string]: {
    h: HeroStat[];
  };
}

interface PatchNotes {
  patches: Array<{
    date: string;
    hero: string[];
    content: string;
    patchType: 'buff' | 'nerf' | 'update';
  }>;
}

export function useHeroData() {
  const [heroMeta, setHeroMeta] = useState<HeroMetaData | null>(null);
  const [mergedData, setMergedData] = useState<MergedData | null>(null);
  const [patchNotes, setPatchNotes] = useState<PatchNotes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);

  // 获取所有可用日期
  const availableDates = useMemo(() => {
    if (!mergedData) return [];
    return Object.keys(mergedData).sort();
  }, [mergedData]);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [heroMetaResponse, mergedDataResponse, patchNotesResponse] = await Promise.all([
          fetch('/data/hero_meta.json'),
          fetch('/data/merged_data.json'),
          fetch('/data/patch_notes.json')
        ]);

        const [heroMetaData, mergedDataJson, patchNotesData] = await Promise.all([
          heroMetaResponse.json(),
          mergedDataResponse.json(),
          patchNotesResponse.json()
        ]);

        setHeroMeta(heroMetaData);
        setMergedData(mergedDataJson);
        setPatchNotes(patchNotesData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  

  // 根据ID获取英雄信息
  const getHeroById = useCallback((heroId: string) => {
    return heroMeta?.heroes.find(hero => hero.hero_id === heroId);
  }, [heroMeta]);

  // 切换英雄选择
  const toggleHeroSelection = useCallback((heroId: string) => {
    setSelectedHeroes(prev => {
      if (prev.includes(heroId)) {
        return prev.filter(id => id !== heroId);
      }
      if (prev.length >= 10) {
        return prev;
      }
      return [...prev, heroId];
    });
  }, []);

  // 清除所有选择
  const clearHeroSelection = useCallback(() => {
    setSelectedHeroes([]);
  }, []);

  // 获取选中英雄的历史数据
  const getHeroStatHistoryForSelectedHeroes = useCallback((): { [date: string]: { h: HeroStat[] } } => {
    if (!mergedData || !selectedHeroes.length) return {};

    const result: { [date: string]: { h: HeroStat[] } } = {};
    
    Object.entries(mergedData)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .forEach(([date, data]) => {
        const heroStats = selectedHeroes.map(heroId => {
          const stat = data.h.find(s => s.i === heroId);
          if (stat) {
            return {
              i: heroId,
              w: stat.w,
              s: stat.s,
              k: stat.k
            };
          }
          return {
            i: heroId,
            w: 0,
            s: 0,
            k: 0
          };
        });
        
        result[date] = { h: heroStats };
      });

    return result;
  }, [mergedData, selectedHeroes]);

  return {
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
  };
} 