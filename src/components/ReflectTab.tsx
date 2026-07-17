import React, { useState, useEffect } from 'react';
import { PenTool, ArrowLeft, Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { LottieEmoji } from './LottieEmoji';
import { MOODS, PROMPTS } from '../lib/constants';
import { MoodType, JournalEntry } from '../types';

interface ReflectTabProps {
  selectedPromptText: string | null;
  onClearPromptText: () => void;
  onSaveEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => Promise<JournalEntry>;
}

export const ReflectTab: React.FC<ReflectTabProps> = ({
  selectedPromptText,
  onClearPromptText,
  onSaveEntry,
}) => {
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('calm');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedReflection, setSavedReflection] = useState<string | null>(null);
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{ mood: MoodType; tags: string[] } | null>(null);

  // If a prompt was clicked from the dashboard, auto-select it
  useEffect(() => {
    if (selectedPromptText) {
      setActivePrompt(selectedPromptText);
    }
  }, [selectedPromptText]);

  // Perform AI mood/tag prediction based on journal content
  const handleAnalyzeMood = async () => {
    if (!journalText.trim() || journalText.length < 5) return;
    setIsAnalyzingMood(true);
    try {
      const response = await fetch('/api/gemini/analyze-mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: journalText }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiAnalysisResult({ mood: data.mood as MoodType, tags: data.tags });
        setSelectedMood(data.mood as MoodType);
      }
    } catch (err) {
      console.error('Mood analysis error:', err);
    } finally {
      setIsAnalyzingMood(false);
    }
  };

  const handleSave = async () => {
    if (!journalText.trim() || !activePrompt) return;
    setIsSubmitting(true);
    setSavedReflection(null);

    const finalTags = aiAnalysisResult?.tags || ['Reflection'];

    try {
      // Step 1: Save the entry & let App/Server generate the reflection
      const result = await onSaveEntry({
        mood: selectedMood,
        prompt: activePrompt,
        text: journalText,
        tags: finalTags,
      });

      // Show the generated AI reflection
      if (result.aiReflection) {
        setSavedReflection(result.aiReflection);
      }
    } catch (err) {
      console.error('Failed to submit reflection:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setJournalText('');
    setSelectedMood('calm');
    setSavedReflection(null);
    setAiAnalysisResult(null);
    setActivePrompt(null);
    onClearPromptText();
  };

  if (activePrompt) {
    return (
      <div className="space-y-5 pb-20 animate-fade-in px-4">
        {/* Header Back Button */}
        <div className="flex items-center gap-3 pt-6">
          <button
            onClick={() => {
              setActivePrompt(null);
              onClearPromptText();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 text-gray-500 hover:bg-rose-50/50"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-800">New Reflection Entry</h1>
            <p className="text-[10px] text-gray-400 font-mono">JOURNAL WORKBENCH</p>
          </div>
        </div>

        {/* Prompt Card Display */}
        <div className="rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 p-5 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <PenTool size={100} />
          </div>
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-bold text-rose-100 uppercase tracking-wide">SELECTED PROMPT</span>
            <p className="text-base font-bold leading-relaxed">"{activePrompt}"</p>
          </div>
        </div>

        {/* AI Reflection Result Banner if saved */}
        {savedReflection && (
          <div className="rounded-2xl bg-gradient-to-r from-rose-50 to-purple-50 p-5 border border-rose-100 shadow-sm space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500 text-white">
                <Sparkles size={12} className="animate-pulse" />
              </div>
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">DearDiary AI Reflection</h4>
            </div>
            <p className="text-xs text-gray-700 italic leading-relaxed">"{savedReflection}"</p>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 pt-1"
            >
              Write another entry
              <ArrowLeft size={12} className="rotate-180" />
            </button>
          </div>
        )}

        {!savedReflection && (
          <div className="space-y-4">
            {/* Journal Textarea */}
            <div className="space-y-1">
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="Pour your heart out here... Let the words flow naturally."
                disabled={isSubmitting}
                className="w-full min-h-[160px] text-sm rounded-2xl border border-rose-100/60 p-4 focus:border-rose-400 focus:outline-none bg-white placeholder-gray-400 shadow-sm leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono px-1">
                <span>{journalText.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span>{journalText.length} characters</span>
              </div>
            </div>

            {/* Smart AI Actions helper */}
            {journalText.trim().length >= 10 && (
              <div className="flex items-center justify-between rounded-xl bg-rose-50/20 p-2.5 border border-rose-100/50">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-rose-400 animate-pulse" />
                  <span className="text-[11px] font-medium text-gray-600">Want AI to guess mood and tags?</span>
                </div>
                <button
                  type="button"
                  disabled={isAnalyzingMood}
                  onClick={handleAnalyzeMood}
                  className="flex items-center gap-1 rounded-lg bg-white border border-rose-200 px-2.5 py-1 text-[10px] font-bold text-rose-500 hover:bg-rose-50 active:scale-95 transition"
                >
                  {isAnalyzingMood ? (
                    <>
                      <RefreshCw size={10} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'AI Guess ✨'
                  )}
                </button>
              </div>
            )}

            {/* Mood selector (either pre-selected or AI suggested) */}
            <div className="rounded-2xl bg-white p-4 border border-rose-50 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">How did writing this feel?</span>
                {aiAnalysisResult && (
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    AI SUGGESTED
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(MOODS) as MoodType[]).map((m) => {
                  const config = MOODS[m];
                  const isSelected = selectedMood === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setSelectedMood(m)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? `${config.borderColor} ${config.bgLight} ${config.color} border-2`
                          : 'border-gray-100 hover:border-rose-100 text-gray-600 bg-white'
                      }`}
                    >
                      <LottieEmoji mood={m} size={20} />
                      {config.label}
                    </button>
                  );
                })}
              </div>
              {aiAnalysisResult && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                  <span className="text-[10px] text-gray-400 font-mono">Suggested tags:</span>
                  {aiAnalysisResult.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-semibold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSubmitting || !journalText.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-500 text-white rounded-2xl text-xs font-bold transition hover:bg-rose-600 disabled:opacity-50 shadow-lg shadow-rose-900/10 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating AI Reflection...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Save Reflection & AI Reflect
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20 animate-fade-in px-4">
      {/* Tab Header */}
      <div className="pt-6">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">REFLECT</h1>
        <p className="text-xs text-gray-500 font-medium">Slow down, write, and check in with yourself.</p>
      </div>

      {/* Grid of Prompts mapping with images */}
      <div className="space-y-4">
        {PROMPTS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePrompt(p.prompt)}
            className="w-full text-left relative overflow-hidden rounded-2xl bg-slate-900 text-white p-5 min-h-[110px] flex flex-col justify-between shadow-sm group hover:scale-[1.01] transition-all border border-rose-50 active:scale-[0.99]"
          >
            {/* Cover photo representing category */}
            <div
              className="absolute inset-0 opacity-25 bg-cover bg-center transition-all duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url('${p.cardImage}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-rose-950/40 to-slate-900/80" />

            <div className="relative z-10">
              <span className="text-[9px] font-bold text-rose-200 uppercase tracking-widest">{p.title}</span>
              <p className="text-sm font-semibold tracking-tight leading-snug mt-1 max-w-[85%] text-gray-100">
                {p.prompt}
              </p>
            </div>
            <div className="relative z-10 flex items-center justify-end text-[11px] font-bold text-rose-300 gap-1 mt-3">
              Tap to reflect
              <ArrowLeft size={11} className="rotate-180 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
