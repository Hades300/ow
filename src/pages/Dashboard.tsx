import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

dayjs.extend(isSameOrBefore);

interface Hero {
  hero_id: string;
  hero_name: string;
  hero_icon: string;
  hero_role: string;
}

interface HeroData {
  hero_id: string;
  selection_ratio: number;
  win_ratio: number;
  kda: number;
  ds: string;
}

interface PatchNote {
  date: string;
  hero: string[];
  content: string;
  patchType: 'buff' | 'nerf' | 'balance' | 'update';
}

const Dashboard: React.FC = () => {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [selectedHero, setSelectedHero] = useState<string>();
  const [heroData, setHeroData] = useState<HeroData[]>([]);
  const [patchNotes, setPatchNotes] = useState<PatchNote[]>([]);
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [selectedStat, setSelectedStat] = useState<'win_ratio' | 'selection_ratio' | 'kda'>('win_ratio');

  useEffect(() => {
    // 获取英雄元数据
    fetch('/data/hero_meta.json')
      .then(res => res.json())
      .then(data => setHeroes(data.heroes));
  }, []);

  useEffect(() => {
    if (selectedHero && dateRange[0] && dateRange[1]) {
      // 从合并数据文件中获取英雄数据
      fetch('/data/merged_data.json')
        .then(res => res.json())
        .then(mergedData => {
          const startDate = dayjs(dateRange[0]);
          const endDate = dayjs(dateRange[1]);
          const filteredData = [];

          // 筛选日期范围内的数据
          Object.entries(mergedData).forEach(([date, dayData]) => {
            const currentDate = dayjs(date);
            if (currentDate.isSameOrAfter(startDate) && currentDate.isSameOrBefore(endDate)) {
              const heroData = dayData.data.filter(d => d.hero_id === selectedHero);
              filteredData.push(...heroData);
            }
          });

          setHeroData(filteredData);
        });"}]}}}

      // 获取补丁记录
      fetch('/data/patch_notes.json')
        .then(res => res.json())
        .then(data => {
          const filteredNotes = data.patches.filter(note => 
            note.hero.includes(selectedHero) && 
            note.date >= dateRange[0] && 
            note.date <= dateRange[1]
          );
          setPatchNotes(filteredNotes);
        });
    }
  }, [selectedHero, dateRange]);

  const chartData = {
    labels: heroData.map(d => d.ds),
    datasets: [
      {
        label: selectedStat === 'win_ratio' ? '胜率' : 
               selectedStat === 'selection_ratio' ? '选择率' : 'KDA',
        data: heroData.map(d => d[selectedStat]),
        borderColor: '#3b82f6',
        tension: 0.1,
        fill: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category' as const,
        display: true,
        title: {
          display: true,
          text: '日期'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: selectedStat === 'win_ratio' ? '胜率 (%)' : 
                selectedStat === 'selection_ratio' ? '选择率 (%)' : 'KDA'
        }
      }
    }
  };

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8 bg-gray-900 text-gray-100">
      <h1 className="text-3xl font-bold mb-6">英雄表现看板</h1>
      
      {/* 英雄选择区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg shadow-md md:col-span-2">
          <h2 className="text-lg font-semibold mb-3">选择英雄</h2>
          <div className="flex flex-wrap gap-3">
            {heroes.map(hero => (
              <div
                key={hero.hero_id}
                className={`hero-card flex flex-col items-center p-2 bg-gray-700 rounded-md border-2 cursor-pointer transition duration-150 ${
                  selectedHero === hero.hero_id ? 'border-blue-500' : 'border-gray-600'
                }`}
                onClick={() => setSelectedHero(hero.hero_id)}
              >
                <img
                  src={hero.hero_icon}
                  alt={hero.hero_name}
                  className="w-10 h-10 rounded-full mb-1"
                />
                <span className="text-xs font-medium">{hero.hero_name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 时间范围选择 */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">时间范围</h2>
          <div className="space-y-3">
            <input
              type="date"
              value={dateRange[0]}
              onChange={e => setDateRange([e.target.value, dateRange[1]])}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
            />
            <input
              type="date"
              value={dateRange[1]}
              onChange={e => setDateRange([dateRange[0], e.target.value])}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* 数据展示区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">数据趋势</h2>
            <div className="flex space-x-2">
              {[
                { key: 'win_ratio', label: '胜率' },
                { key: 'selection_ratio', label: '选择率' },
                { key: 'kda', label: 'KDA' }
              ].map(stat => (
                <button
                  key={stat.key}
                  className={`text-xs px-3 py-1 rounded-md transition duration-150 ${
                    selectedStat === stat.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  onClick={() => setSelectedStat(stat.key as typeof selectedStat)}
                >
                  {stat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} redraw={true} />
          </div>
        </div>

        {/* 补丁记录 */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">补丁记录</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {patchNotes.map((note, index) => (
              <div
                key={index}
                className={`p-3 bg-gray-700 rounded-md border-l-4 ${
                  note.patchType === 'buff'
                    ? 'border-green-500'
                    : note.patchType === 'nerf'
                    ? 'border-red-500'
                    : 'border-yellow-500'
                }`}
              >
                <p className="font-semibold text-sm mb-1">
                  {dayjs(note.date).format('YYYY-MM-DD')}
                  {' - '}
                  {note.patchType === 'buff' ? '增强' :
                   note.patchType === 'nerf' ? '削弱' :
                   note.patchType === 'balance' ? '平衡性调整' : '更新'}
                </p>
                <p className="text-sm">{note.content}</p>
              </div>
            ))}
            {patchNotes.length === 0 && (
              <p className="text-sm text-gray-500 italic">所选时间范围内无补丁记录</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;