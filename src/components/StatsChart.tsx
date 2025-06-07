import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import { HeroStat } from '../types';

// 使用更灵活的类型定义
interface StatsChartProps {
  data: { [date: string]: { h: HeroStat[] } };
  statType: 'w' | 's' | 'k';
  heroColors: Record<string, string>;
  heroNames: Record<string, string>;
  patchDates: string[];
  heroMeta?: any; // 使用 any 类型以避免类型不匹配问题
}

const StatsChart: React.FC<StatsChartProps> = ({
  data,
  statType,
  heroColors,
  heroNames,
  patchDates,
  heroMeta
}) => {
  const formatDate = (date: string) => {
    return dayjs(date).format('MM/DD');
  };

  const formatValue = (value: number) => {
    if (statType === 'k') return value.toFixed(2);
    // 胜率和选择率已经是百分比形式，不需要乘以100
    return `${value.toFixed(1)}%`;
  };

  // const getStatLabel = (type: 'w' | 's' | 'k') => {
  //   switch (type) {
  //     case 'w': return '胜率';
  //     case 's': return '选择率';
  //     case 'k': return '击杀数';
  //     default: return '';
  //   }
  // };

  const getYAxisDomain = () => {
    if (statType === 'k') return [0, 'auto'];
    
    // 为胜率和选择率设置合适的范围
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    if (Object.keys(data).length > 0) {
      Object.values(data).forEach(({ h }) => {
        h.forEach((stat) => {
          const value = stat[statType];
          if (value !== undefined && typeof value === 'number') {
            minValue = Math.min(minValue, value);
            maxValue = Math.max(maxValue, value);
          }
        });
      });
      
      if (minValue !== Infinity && maxValue !== -Infinity) {
        // 计算数值范围
        const range = maxValue - minValue;
        // 扩展范围以显示更多上下文
        minValue = Math.max(0, minValue - range * 0.1);
        maxValue = Math.min(100, maxValue + range * 0.1);
        
        // 如果范围太小，扩大显示范围以突出差异
        if (range < 5) {
          const mid = (minValue + maxValue) / 2;
          minValue = Math.max(0, mid - 2.5);
          maxValue = Math.min(100, mid + 2.5);
        }
      } else {
        minValue = 0;
        maxValue = 100;
      }
    }
    
    return [minValue, maxValue];
  };

  // const getStatIcon = (type: 'w' | 's' | 'k') => {
  //   switch (type) {
  //     case 'w':
  //       return (
  //         <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  //           <path d="M12 2L2 22h20L12 2zm0 4l6.5 13h-13L12 6z"/>
  //         </svg>
  //       );
  //     case 's':
  //       return (
  //         <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  //           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
  //         </svg>
  //       );
  //     case 'k':
  //       return (
  //         <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  //           <path d="M7 5h2v14H7V5zm14 14h-2v-6.63L15.5 8 12 12.37 8.5 8 5 12.37V19H3V5h2l5.5 6 3.5-4.37L19.5 11H21v8z"/>
  //         </svg>
  //       );
  //     default:
  //       return null;
  //   }
  // };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="custom-tooltip">
        <p className="tooltip-date">{formatDate(label)}</p>
        <div className="tooltip-content">
          {payload.map((entry: any) => (
            <div key={entry.name} className="tooltip-item">
              <span className="tooltip-bullet" style={{ backgroundColor: entry.color }}></span>
              <span className="tooltip-name">{heroNames[entry.name]}</span>
              <span className="tooltip-value">{formatValue(entry.value)}</span>
            </div>
          ))}
        </div>
        <style jsx>{`
          .custom-tooltip {
            background: var(--card-background);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 8px 12px;
            box-shadow: 0 4px 12px var(--shadow);
          }

          .tooltip-date {
            margin: 0 0 8px 0;
            color: var(--text);
            font-size: 12px;
          }

          .tooltip-content {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .tooltip-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .tooltip-bullet {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          .tooltip-name {
            color: var(--text);
            font-size: 14px;
          }

          .tooltip-value {
            color: var(--success);
            font-weight: 500;
            margin-left: auto;
          }
        `}</style>
      </div>
    );
  };

  const CustomizedDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isPatchDate = patchDates.includes(payload.date);

    if (!isPatchDate) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        stroke="#fff"
        strokeWidth={2}
        fill="#f97316"
      />
    );
  };

  const CustomizedAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="#999"
          fontSize={12}
        >
          {formatDate(payload.value)}
        </text>
      </g>
    );
  };

  const CustomizedLabel = (props: any) => {
    const { x, y, value, heroId } = props;
    const isLastPoint = props.index === Object.keys(data).length - 1;
    
    if (!isLastPoint) return null;

    return (
      <g>
        <image
          x={x + 10}
          y={y - 12}
          width={24}
          height={24}
          xlinkHref={heroMeta?.heroes.find((h: any) => h.hero_id === heroId)?.hero_icon}
          style={{ filter: 'drop-shadow(0px 0px 2px rgba(0,0,0,0.5))' }}
        />
        <text
          x={x + 40}
          y={y + 4}
          fill="#ffffff"
          fontSize={12}
          textAnchor="start"
          style={{
            filter: 'drop-shadow(0px 0px 3px rgba(0,0,0,0.9))',
            fontWeight: 500
          }}
        >
          {heroNames[heroId]} ({formatValue(value)})
        </text>
      </g>
    );
  };

  // 将对象数据转换为数组格式以适应 recharts
  const chartData = Object.entries(data).map(([date, { h }]) => ({
    date,
    ...h.reduce((acc, stat) => ({
      ...acc,
      [stat.i]: stat[statType]
    }), {})
  }));

  return (
    <div className="stats-chart">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 120,
            left: 20,
            bottom: 20
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(255, 255, 255, 0.1)"
          />
          <XAxis
            dataKey="date"
            tick={<CustomizedAxisTick />}
            stroke="#666"
          />
          <YAxis
            domain={getYAxisDomain() as any}
            tickFormatter={formatValue}
            stroke="#666"
            tick={{ fill: '#999', fontSize: 12 }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          {Object.keys(heroColors).map((heroId) => (
            <Line
              key={heroId}
              type="monotone"
              dataKey={heroId}
              name={heroId}
              stroke={heroColors[heroId]}
              strokeWidth={2}
              dot={<CustomizedDot />}
              activeDot={{ r: 6, fill: heroColors[heroId] }}
              label={<CustomizedLabel heroId={heroId} />}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <style jsx>{`
        .stats-chart {
          background: var(--card-background);
          border-radius: 12px;
          padding: 20px;
          height: 100%;
        }

        @media (max-width: 768px) {
          .stats-chart {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default StatsChart;