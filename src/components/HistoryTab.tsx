import React, { useState } from 'react';
import { Search, Calendar as CalendarIcon, List, Tag, Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { LottieEmoji } from './LottieEmoji';
import { MOODS } from '../lib/constants';
import { MoodType, JournalEntry } from '../types';

interface HistoryTabProps {
  entries: JournalEntry[];
  onDeleteEntry: (id: string) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ entries, onDeleteEntry }) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [expandedReflectionId, setExpandedReflectionId] = useState<string | null>(null);

  // Helper: format standard date string
  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Helper: format time string
  const formatTime = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Filter entries based on search term and mood
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMood =
      selectedMoodFilter === 'all' || entry.mood === selectedMoodFilter;

    return matchesSearch && matchesMood;
  });

  // Calendar logic helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = today.toLocaleString('default', { month: 'long' });

  // Calendar dates generator
  const calendarDays = [];
  // Empty slots for offset
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({ dayNum: i, dateStr });
  }

  // Find entries on selected calendar date
  const entriesForCalendarDate = entries.filter((entry) => {
    const entryDateOnly = entry.date.split('T')[0];
    return entryDateOnly === selectedCalendarDate;
  });

  return (
    <div className="space-y-5 pb-20 animate-fade-in px-4">
      {/* Tab Header */}
      <div className="flex items-center justify-between pt-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">YOUR JOURNAL</h1>
          <p className="text-xs text-gray-500 font-medium">Revisit and explore your reflections</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-xl bg-rose-50/50 border border-rose-100 p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex h-8 w-10 items-center justify-center rounded-lg transition ${
              viewMode === 'list'
                ? 'bg-white text-rose-500 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex h-8 w-10 items-center justify-center rounded-lg transition ${
              viewMode === 'calendar'
                ? 'bg-white text-rose-500 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <CalendarIcon size={16} />
          </button>
        </div>
      </div>

      {viewMode === 'list' && (
        <>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search entries, tags, prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded-2xl border border-rose-50 px-10 py-3 focus:border-rose-300 focus:outline-none bg-white placeholder-gray-400 shadow-sm"
            />
          </div>

          {/* Horizontal Mood Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            <button
              onClick={() => setSelectedMoodFilter('all')}
              className={`flex-none text-[11px] font-semibold px-4 py-2 rounded-xl border transition ${
                selectedMoodFilter === 'all'
                  ? 'border-rose-400 bg-rose-500 text-white shadow-sm'
                  : 'border-gray-100 bg-white text-gray-500 hover:border-rose-100'
              }`}
            >
              All Moods
            </button>
            {(Object.keys(MOODS) as MoodType[]).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMoodFilter(m)}
                className={`flex-none flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-xl border transition ${
                  selectedMoodFilter === m
                    ? `${MOODS[m].borderColor} ${MOODS[m].bgColor} text-white shadow-sm`
                    : 'border-gray-100 bg-white text-gray-500 hover:border-rose-100'
                }`}
              >
                <span>{MOODS[m].emoji}</span>
                {MOODS[m].label}
              </button>
            ))}
          </div>

          {/* Reflection Entries List */}
          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                <Search size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-semibold text-gray-500">No reflections found</p>
                <p className="text-[10px] text-gray-400 mt-1">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const config = MOODS[entry.mood];
                const isExpanded = expandedReflectionId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className="rounded-2xl bg-white border border-rose-50 shadow-sm overflow-hidden flex flex-col transition hover:scale-[1.005]"
                  >
                    {/* Header bar of entry */}
                    <div className="flex items-center justify-between p-4 border-b border-rose-50/50 bg-rose-50/10">
                      <div className="flex items-center gap-2.5">
                        <LottieEmoji mood={entry.mood} size={30} />
                        <div>
                          <span className="text-[11px] font-bold text-gray-800">
                            {formatDate(entry.date)}
                          </span>
                          <p className="text-[9px] text-gray-400 font-mono">
                            {formatTime(entry.date)} • Feeling {config.label}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="text-[10px] font-bold text-gray-400 hover:text-rose-500 p-1"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Entry content body */}
                    <div className="p-4 space-y-3">
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-rose-400 font-mono uppercase tracking-wider">
                          Prompt Question:
                        </p>
                        <h4 className="text-xs font-bold text-gray-800 italic">
                          "{entry.prompt}"
                        </h4>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed font-normal whitespace-pre-wrap">
                        {entry.text}
                      </p>

                      {/* Expandable AI insight drawer */}
                      {entry.aiReflection && (
                        <div className="pt-2">
                          {isExpanded ? (
                            <div className="rounded-xl bg-rose-50/30 border border-rose-100 p-3.5 space-y-2 animate-slide-up">
                              <div className="flex items-center gap-1.5">
                                <Sparkles size={11} className="text-rose-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest">
                                  DearDiary AI Insight
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-600 italic leading-relaxed">
                                "{entry.aiReflection}"
                              </p>
                            </div>
                          ) : (
                            <button
                              onClick={() => setExpandedReflectionId(entry.id)}
                              className="flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-600"
                            >
                              <Sparkles size={11} />
                              Reveal AI Reflection Insight
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Tags row */}
                    {entry.tags.length > 0 && (
                      <div className="px-4 pb-4 flex flex-wrap gap-1">
                        {entry.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg"
                          >
                            <Tag size={8} />
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {viewMode === 'calendar' && (
        <div className="space-y-4 animate-fade-in">
          {/* Calendar Widget Card */}
          <div className="rounded-2xl bg-white p-4 border border-rose-50 shadow-sm space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-bold text-gray-800">
                {monthName} {currentYear}
              </h3>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">HIGHLIGHTING REFLECTION DAYS</p>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <span key={day} className="text-[10px] font-bold text-gray-400 font-mono">
                  {day}
                </span>
              ))}

              {calendarDays.map((cd, index) => {
                if (!cd) {
                  return <div key={`empty-${index}`} />;
                }

                // Check if date has entries
                const dateEntries = entries.filter((e) => e.date.split('T')[0] === cd.dateStr);
                const hasEntries = dateEntries.length > 0;
                const isSelected = selectedCalendarDate === cd.dateStr;

                return (
                  <button
                    key={cd.dateStr}
                    onClick={() => setSelectedCalendarDate(cd.dateStr)}
                    className={`h-9 w-9 mx-auto rounded-xl flex items-center justify-center text-xs font-semibold relative transition ${
                      isSelected
                        ? 'bg-rose-500 text-white shadow-sm ring-2 ring-offset-1 ring-rose-300'
                        : hasEntries
                        ? 'bg-rose-50 border border-rose-200 text-rose-600'
                        : 'hover:bg-rose-50/40 text-gray-600'
                    }`}
                  >
                    {cd.dayNum}
                    {hasEntries && !isSelected && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-rose-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Reflections list for the selected calendar day */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 font-mono uppercase tracking-wider px-1">
              Reflections on {new Date(selectedCalendarDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}:
            </h3>

            {entriesForCalendarDate.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center">
                <p className="text-[11px] text-gray-400 font-medium">No reflections recorded on this date.</p>
              </div>
            ) : (
              entriesForCalendarDate.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl bg-white border border-rose-50 shadow-sm p-4 space-y-3.5 transition"
                >
                  <div className="flex items-center gap-2">
                    <LottieEmoji mood={entry.mood} size={28} />
                    <div>
                      <p className="text-xs font-bold text-gray-800">Prompt: "{entry.prompt}"</p>
                      <p className="text-[9px] text-gray-400 font-mono">Logged today at {formatTime(entry.date)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {entry.text}
                  </p>
                  {entry.aiReflection && (
                    <div className="rounded-xl bg-purple-50/30 border border-purple-100 p-3 space-y-1.5">
                      <div className="flex items-center gap-1">
                        <Sparkles size={10} className="text-purple-500" />
                        <span className="text-[9px] font-bold text-purple-800 uppercase tracking-wider">AI Reflection</span>
                      </div>
                      <p className="text-[11px] text-gray-600 italic">"{entry.aiReflection}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
