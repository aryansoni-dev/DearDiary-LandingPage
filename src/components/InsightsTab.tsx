import React, { useState } from 'react';
import { Sparkles, ArrowLeftRight, TrendingUp, Calendar, Heart, ShieldAlert, BookOpen } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { MOODS } from '../lib/constants';
import { MoodType, JournalEntry, MoodLog } from '../types';

interface InsightsTabProps {
  entries: JournalEntry[];
  moodLogs: MoodLog[];
}

export const InsightsTab: React.FC<InsightsTabProps> = ({ entries, moodLogs }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  // Convert mood types to numeric values for recharts plotting
  const moodValues: Record<MoodType, number> = {
    sad: 1,
    anxious: 2,
    calm: 3,
    grateful: 4,
    motivated: 5,
    happy: 6,
  };

  const getEmojiForValue = (val: number) => {
    if (val <= 1) return '😢';
    if (val <= 2) return '🥺';
    if (val <= 3) return '😌';
    if (val <= 4) return '🙏';
    if (val <= 5) return '✨';
    return '😊';
  };

  // 1. Calculate general stats
  const totalEntries = entries.length;

  // Active days count
  const uniqueDays = new Set([
    ...entries.map((e) => e.date.split('T')[0]),
    ...moodLogs.map((l) => l.date),
  ]);
  const activeDays = uniqueDays.size;

  // Calculate top mood
  const moodCounts: Record<MoodType, number> = {
    happy: 0,
    calm: 0,
    grateful: 0,
    anxious: 0,
    sad: 0,
    motivated: 0,
  };

  entries.forEach((e) => {
    moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });
  moodLogs.forEach((l) => {
    moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1;
  });

  let topMood: MoodType = 'calm';
  let maxCount = -1;
  (Object.keys(moodCounts) as MoodType[]).forEach((m) => {
    if (moodCounts[m] > maxCount) {
      maxCount = moodCounts[m];
      topMood = m;
    }
  });

  // 2. Generate chart data (Mood Journey)
  // Mock last 7 days of the current week for visual mockup similarity
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartData = weekdays.map((day, idx) => {
    // Find logs/entries on this corresponding offset day
    // We can distribute logs for a realistic week view
    const moodsForDay = [
      ...entries.map((e) => ({ date: e.date.split('T')[0], mood: e.mood })),
      ...moodLogs.map((l) => ({ date: l.date, mood: l.mood })),
    ];

    // Find the mood or default to a comfortable baseline
    const matched = moodsForDay[idx % moodsForDay.length];
    const mood = matched ? matched.mood : ('calm' as MoodType);

    return {
      name: day,
      value: moodValues[mood],
      moodName: MOODS[mood].label,
      emoji: MOODS[mood].emoji,
    };
  });

  // 3. Distribution data for bar chart
  const distributionData = (Object.keys(MOODS) as MoodType[]).map((m) => {
    const totalCount = moodCounts[m];
    const percentage = totalEntries + moodLogs.length > 0 
      ? Math.round((totalCount / (totalEntries + moodLogs.length)) * 100) 
      : 0;

    return {
      name: MOODS[m].label,
      count: totalCount,
      percentage,
      color: MOODS[m].bgColor,
      emoji: MOODS[m].emoji,
    };
  });

  return (
    <div className="space-y-5 pb-20 animate-fade-in px-4">
      {/* Header */}
      <div className="pt-6">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">YOUR INSIGHTS</h1>
        <p className="text-xs text-gray-500 font-medium">Powered by your journal and mood check-ins</p>
      </div>

      {/* Time Range Toggle */}
      <div className="flex rounded-xl bg-rose-50/40 p-1 border border-rose-100">
        <button
          onClick={() => setTimeRange('week')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
            timeRange === 'week' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
            timeRange === 'month' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Month
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-4 border border-rose-50 text-center shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider block">Entries</span>
          <p className="text-lg font-black text-gray-800 mt-1">{totalEntries}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-rose-50 text-center shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider block">Active Days</span>
          <p className="text-lg font-black text-rose-500 mt-1">{activeDays}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-rose-50 text-center shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider block">Top Mood</span>
          <p className="text-xs font-bold text-gray-800 mt-2 flex items-center justify-center gap-1">
            <span>{MOODS[topMood].emoji}</span>
            {MOODS[topMood].label}
          </p>
        </div>
      </div>

      {/* Mood Journey Line Chart */}
      <div className="rounded-2xl bg-white p-5 border border-rose-50 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-bold text-gray-800 font-mono uppercase tracking-wider">Mood Journey</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Tracking your emotional trajectory</p>
        </div>

        <div className="h-[180px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fef2f2" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
              <YAxis
                domain={[1, 6]}
                ticks={[1, 2, 3, 4, 5, 6]}
                tickFormatter={getEmojiForValue}
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-rose-100 bg-white p-2 text-xs shadow-md">
                        <span className="font-bold text-gray-700">{data.name}:</span>{' '}
                        <span className="font-semibold text-rose-500">{data.emoji} {data.moodName}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#f43f5e' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mood Distribution Bar Lists */}
      <div className="rounded-2xl bg-white p-5 border border-rose-50 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-bold text-gray-800 font-mono uppercase tracking-wider">Mood Distribution</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Summary of all mood states logged</p>
        </div>

        <div className="space-y-3">
          {distributionData.map((m, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700 flex items-center gap-1.5">
                  <span>{m.emoji}</span>
                  {m.name}
                </span>
                <span className="font-mono text-gray-400 text-[10px]">
                  {m.count} logs ({m.percentage}%)
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-gray-50 overflow-hidden border border-gray-100/55">
                <div
                  className={`h-full rounded-full transition-all duration-500`}
                  style={{
                    width: `${m.percentage}%`,
                    backgroundColor: m.name === 'Happy' ? '#f59e0b' :
                                    m.name === 'Calm' ? '#0d9488' :
                                    m.name === 'Grateful' ? '#ec4899' :
                                    m.name === 'Anxious' ? '#a855f7' :
                                    m.name === 'Sad' ? '#3b82f6' : '#f43f5e'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
