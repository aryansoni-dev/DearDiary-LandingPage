import React, { useState } from 'react';
import { Sparkles, Flame, CheckCircle, Smile, ArrowRight } from 'lucide-react';
import { LottieEmoji } from './LottieEmoji';
import { MOODS, PROMPTS } from '../lib/constants';
import { MoodType, UserProfile, MoodLog } from '../types';

interface TodayTabProps {
  profile: UserProfile;
  moodLogs: MoodLog[];
  onAddMoodLog: (mood: MoodType, note?: string) => void;
  onSelectPrompt: (promptText: string) => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  profile,
  moodLogs,
  onAddMoodLog,
  onSelectPrompt,
}) => {
  const [selectedQuickMood, setSelectedQuickMood] = useState<MoodType | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [loggedToday, setLoggedToday] = useState(false);

  // Determine greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get today's logged mood if any
  const getLatestMoodLogToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysLogs = moodLogs.filter((log) => log.date === todayStr);
    return todaysLogs.length > 0 ? todaysLogs[todaysLogs.length - 1] : null;
  };

  const latestLog = getLatestMoodLogToday();

  // Get active prompt matching current time of day
  const getActivePrompt = () => {
    const hour = new Date().getHours();
    if (hour < 12) return PROMPTS.find((p) => p.category === 'morning') || PROMPTS[0];
    if (hour < 17) return PROMPTS.find((p) => p.category === 'noon') || PROMPTS[1];
    return PROMPTS.find((p) => p.category === 'evening') || PROMPTS[2];
  };

  const currentPrompt = getActivePrompt();

  const handleLogMood = () => {
    if (selectedQuickMood) {
      onAddMoodLog(selectedQuickMood, moodNote);
      setLoggedToday(true);
      setSelectedQuickMood(null);
      setMoodNote('');
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in px-4">
      {/* Profile Header */}
      <div className="flex items-center justify-between pt-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
            {getGreeting()}, <span className="text-rose-500">{profile.name}</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Let's check in with yourself today.</p>
        </div>
        <div className="relative">
          <img
            src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80'}
            alt="Profile Avatar"
            className="h-11 w-11 rounded-full object-cover ring-2 ring-rose-100 bg-brand-primary-soft/15"
            referrerPolicy="no-referrer"
            loading="eager"
            width={44}
            height={44}
          />
          <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* Streak Banner */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-orange-50 to-rose-50 p-4 border border-rose-100/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-sm">
            <Flame className="h-5 w-5 fill-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              {profile.streakCount} Days Reflection Streak
            </h3>
            <p className="text-xs text-gray-500">Keep the momentum going!</p>
          </div>
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-rose-500 shadow-sm border border-rose-50">
          STREAK
        </div>
      </div>

      {/* Dynamic AI Reflection Prompt Card */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-xl min-h-[180px] flex flex-col justify-between p-6">
        {/* Subtle background image/gradient mapping */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url('${currentPrompt.cardImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-rose-900/40 via-purple-900/30 to-slate-900" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-200">
            <Sparkles className="h-3 w-3 text-rose-300" />
            AI Reflection Prompt
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white leading-snug">
            "{currentPrompt.prompt}"
          </h2>
        </div>

        <div className="relative z-10 flex items-center justify-between pt-4">
          <p className="text-[11px] text-gray-300 font-mono">Suggested category: {currentPrompt.title}</p>
          <button
            onClick={() => onSelectPrompt(currentPrompt.prompt)}
            className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-rose-600 shadow-lg shadow-rose-950/25 active:scale-95"
          >
            Start Writing
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Mood Check-In Card */}
      <div className="rounded-2xl bg-white p-5 border border-rose-50 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <Smile className="h-4 w-4 text-rose-400" />
            How are you feeling right now?
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Take a quiet moment to check in with yourself.</p>
        </div>

        {latestLog ? (
          <div className="flex items-center gap-3 rounded-xl bg-teal-50/50 p-3.5 border border-teal-100/50">
            <LottieEmoji mood={latestLog.mood} size={44} />
            <div>
              <p className="text-xs font-semibold text-teal-800">
                Feeling {MOODS[latestLog.mood].label} logged
              </p>
              <p className="text-[10px] text-teal-600 font-mono">
                Logged today at {latestLog.time} {latestLog.note ? `• "${latestLog.note}"` : ''}
              </p>
            </div>
            <div className="ml-auto rounded-full bg-white p-1 text-teal-600 shadow-sm border border-teal-50">
              <CheckCircle size={16} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Horizontal Mood Selector */}
            <div className="grid grid-cols-6 gap-2">
              {(Object.keys(MOODS) as MoodType[]).map((m) => {
                const config = MOODS[m];
                const isSelected = selectedQuickMood === m;
                return (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedQuickMood(m);
                      setLoggedToday(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-300 ${
                      isSelected
                        ? `${config.borderColor} ${config.bgLight} scale-105 ring-2 ring-offset-1 ring-rose-300`
                        : 'border-gray-100 hover:border-rose-100 bg-white'
                    }`}
                  >
                    <LottieEmoji mood={m} size={32} />
                    <span className="text-[9px] font-semibold text-gray-500 mt-1">{config.label}</span>
                  </button>
                );
              })}
            </div>

            {selectedQuickMood && (
              <div className="space-y-2 animate-fade-in">
                <input
                  type="text"
                  placeholder="Optional: What is making you feel this way?"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  className="w-full text-xs rounded-xl border border-rose-100 px-3.5 py-2.5 focus:border-rose-400 focus:outline-none bg-rose-50/10 placeholder-gray-400"
                />
                <button
                  onClick={handleLogMood}
                  className="w-full py-2 bg-rose-500 text-white rounded-xl text-xs font-bold transition hover:bg-rose-600"
                >
                  Confirm Feeling Check-in
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
