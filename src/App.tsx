import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Heart, Shield, Lock, Eye, BookOpen, Flame, Zap, 
  ArrowRight, CheckCircle2, MessageCircle, BarChart2, Star, Calendar, Smile,
  FileText, Puzzle, Feather, Fingerprint, Key, Download, Moon, Search, ChevronDown,
  Twitter, Instagram, Github, ArrowUp
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Pill } from './components/Pill';
import { SectionWrapper } from './components/SectionWrapper';

// App tabs
import { TodayTab } from './components/TodayTab';
import { ReflectTab } from './components/ReflectTab';
import { HistoryTab } from './components/HistoryTab';
import { InsightsTab } from './components/InsightsTab';
import { ChatTab } from './components/ChatTab';
import { BottomNav, TabId } from './components/BottomNav';
import { LottieEmoji } from './components/LottieEmoji';

import { MoodType, JournalEntry, MoodLog, ChatMessage, UserProfile } from './types';
import { INITIAL_REFLECTIONS } from './lib/constants';

const FAQ_ITEMS = [
  {
    question: "Is DearDiary private?",
    answer: "Yes. DearDiary is built local-first with end-to-end encryption, so your entries stay yours."
  },
  {
    question: "Does AI read all my journal entries?",
    answer: "The AI only processes what's needed to generate reflections and insights you've asked for — it's not used to profile or advertise to you."
  },
  {
    question: "Can I use DearDiary without AI?",
    answer: "Yes, you can journal freely without ever using the AI reflection or chat features."
  },
  {
    question: "Can I export my journal?",
    answer: "Yes, you can export your journal data at any time."
  },
  {
    question: "Is there a free plan?",
    answer: "Yes, DearDiary offers a free tier alongside optional premium features."
  },
  {
    question: "Which platforms are supported?",
    answer: "DearDiary is available on mobile, with more platforms planned."
  },
  {
    question: "How does mood tracking work?",
    answer: "You log a quick mood check-in daily, and DearDiary visualizes patterns over time in your calendar and insights."
  }
];

export default function App() {
  // Navigation & View State
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [selectedPromptText, setSelectedPromptText] = useState<string | null>(null);

  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Waitlist State
  const [waitlistName, setWaitlistName] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  // Scroll Progress State
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      } else {
        setScrollProgress(0);
      }
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  // AI Section Scroll View State
  const aiSectionRef = useRef<HTMLDivElement>(null);
  const [aiSectionVisible, setAiSectionVisible] = useState(false);

  // Screens Gallery Carousel State
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAiSectionVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (aiSectionRef.current) {
      observer.observe(aiSectionRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  // Journal App States
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Mindful Journaler',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256',
    streakCount: 3,
  });

  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    // Attempt load from localStorage, otherwise use initial reflections
    const local = localStorage.getItem('deardiary_entries');
    return local ? JSON.parse(local) : INITIAL_REFLECTIONS;
  });

  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(() => {
    const local = localStorage.getItem('deardiary_mood_logs');
    if (local) return JSON.parse(local);

    // Initial mock mood logs over the past week to make graphs beautiful
    const today = new Date();
    const mockLogs: MoodLog[] = [];
    const moodsList: MoodType[] = ['happy', 'calm', 'grateful', 'anxious', 'sad', 'motivated'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      mockLogs.push({
        id: `mock-log-${i}`,
        date: dateStr,
        time: '12:00',
        mood: moodsList[Math.floor(Math.random() * moodsList.length)],
        note: i === 0 ? 'Felt good logging my mood today' : undefined
      });
    }
    return mockLogs;
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const local = localStorage.getItem('deardiary_chat_history');
    if (local) return JSON.parse(local);
    return [
      {
        id: 'welcome-msg',
        sender: 'ai',
        text: 'Hi there, I am your DearDiary AI companion. ✨ I am here to hold a compassionate, non-judgmental space for you. How are you feeling today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ];
  });

  const [isAiTyping, setIsAiTyping] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('deardiary_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('deardiary_mood_logs', JSON.stringify(moodLogs));
  }, [moodLogs]);

  useEffect(() => {
    localStorage.setItem('deardiary_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Waitlist handler
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!waitlistName.trim()) {
      setWaitlistError('Name is required.');
      return;
    }
    if (!waitlistEmail) {
      setWaitlistError('Email is required.');
      return;
    }
    if (!emailRegex.test(waitlistEmail)) {
      setWaitlistError('Please enter a valid email address.');
      return;
    }

    setWaitlistError(null);
    setWaitlistStatus('submitting');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: waitlistName,
          email: waitlistEmail,
        }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        setWaitlistStatus('submitted');
        setWaitlistEmail('');
        setWaitlistName('');
      } else {
        const errorMsg = responseData.error || 'Something went wrong. Please check your form details and try again.';
        setWaitlistError(errorMsg);
        setWaitlistStatus('idle');
      }
    } catch (err) {
      setWaitlistError('Connection error. Please try again later.');
      setWaitlistStatus('idle');
    }
  };



  // Journal App functions
  const handleAddMoodLog = (mood: MoodType, note?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const newLog: MoodLog = {
      id: `log-${Date.now()}`,
      date: todayStr,
      time: timeStr,
      mood,
      note,
    };

    setMoodLogs((prev) => [...prev, newLog]);
  };

  const handleSelectPrompt = (promptText: string) => {
    setSelectedPromptText(promptText);
    setActiveTab('reflect');
  };

  const handleSaveEntry = async (entryData: Omit<JournalEntry, 'id' | 'date'>): Promise<JournalEntry> => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: `entry-${Date.now()}`,
      date: new Date().toISOString(),
    };

    // Optimistically add entry
    setEntries((prev) => [newEntry, ...prev]);

    // Increment streak count
    setProfile(prev => ({
      ...prev,
      streakCount: prev.streakCount + 1
    }));

    // Switch to history tab
    setActiveTab('history');

    return newEntry;
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSendMessage = async (text: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp,
    };

    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedHistory }),
      });
      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: data.reply || 'I am always listening to you with empathy.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatHistory((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: "I am feeling a little quiet right now, but I'm here. Let's keep writing together.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleClearChatHistory = () => {
    setChatHistory([
      {
        id: 'welcome-msg',
        sender: 'ai',
        text: 'Hi there, I am your DearDiary AI companion. ✨ Let\'s start fresh. How are you feeling right now?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  // Scroll to a specific element helper
  const scrollToSection = (id: string) => {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-page-blush text-text-primary selection:bg-brand-primary-soft selection:text-brand-primary-hover scroll-smooth overflow-x-hidden">
      
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-brand-primary-soft/30 z-[100] pointer-events-none">
        <div 
          className="h-full bg-brand-primary transition-all duration-75 ease-out" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Sticky top navigation bar */}
      <Navbar 
        onJoinWaitlistClick={() => scrollToSection('early-access')}
        onEnterAppClick={() => setView(view === 'landing' ? 'app' : 'landing')}
        isShowingApp={view === 'app'}
      />

      {view === 'landing' ? (
        <div className="pt-[84px]">
          
          {/* Hero Section */}
          <section id="hero" className="relative overflow-hidden pt-8 md:pt-14 lg:pt-16 pb-16 md:pb-28 lg:pb-36 bg-image-hero-gradient border-b border-brand-primary-soft/10">
            {/* Ambient decorative blobs */}
            <div className="absolute top-1/4 left-1/10 w-72 h-72 rounded-full bg-brand-primary/5 blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-lavender-accent/5 blur-3xl -z-10 animate-pulse delay-700" />

            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                
                {/* Left Column: Text Content */}
                <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
                  <Pill className="mb-6 animate-fade-in">
                    Private by design · Built for mindful reflection
                  </Pill>
                  
                  <h1 className="font-display font-bold text-[34px] sm:text-[40px] md:text-[56px] lg:text-[64px] text-heading leading-[1.1] tracking-tight mb-6 max-w-xl">
                    Journal with more <span className="text-brand-primary">clarity</span>, <span className="text-brand-primary underline decoration-brand-primary-soft decoration-wavy">not more pressure</span>.
                  </h1>
                  
                  <p className="text-base sm:text-lg text-text-secondary max-w-[480px] leading-relaxed mb-8 font-sans">
                    DearDiary helps you capture your thoughts, understand your moods, and reflect with gentle AI guidance — all in a calm and private journaling experience.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <Button 
                      onClick={() => scrollToSection('early-access')}
                      className="w-full sm:w-auto shadow-lg shadow-brand-primary/10 hover:shadow-brand-primary/20"
                    >
                      Join the Waitlist <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => scrollToSection('how-it-works')}
                      className="w-full sm:w-auto border border-brand-primary/15 hover:bg-brand-primary-soft/20 text-brand-primary font-semibold"
                    >
                      See How It Works
                    </Button>
                  </div>
                </div>

                {/* Right Column: Interactive Phone Mockup Cluster */}
                <div className="lg:col-span-6 flex items-center justify-center relative w-full h-[400px] sm:h-[480px] md:h-[550px] lg:h-[600px] mt-8 lg:mt-0 select-none overflow-visible">
                  
                  {/* Ambient background glow blobs (positioned behind the phones) */}
                  <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-brand-primary/15 blur-[90px] -z-10 pointer-events-none" />
                  <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-lavender-accent/15 blur-[90px] -z-10 pointer-events-none" />
                  <div className="absolute left-[20%] top-[30%] w-72 h-72 rounded-full bg-brand-primary-soft/20 blur-[100px] -z-10 pointer-events-none" />

                  {/* Left Layered Phone Mockup (Behind) - Hidden on Mobile */}
                  <div className="hidden md:block absolute left-[10%] xl:left-[15%] top-[12%] z-10 w-[210px] lg:w-[240px] aspect-[1125/2436] rounded-[32px] bg-brand-primary-soft/20 shadow-[0_12px_36px_rgba(0,0,0,0.06)] -rotate-[10deg] transition-all duration-500 hover:scale-[1.03] hover:z-30 overflow-hidden border-4 border-white/90">
                    <img 
                      src="https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934357/reflect-tab-mockup_qdjdgq.png" 
                      alt="DearDiary guided reflection screen mockup showing customized prompt questions and peaceful writing space" 
                      className="w-full h-full object-cover rounded-[28px] bg-white"
                      referrerPolicy="no-referrer"
                      loading="eager"
                      width={240}
                      height={519}
                    />
                  </div>

                  {/* Right Layered Phone Mockup (Behind) - Hidden on Mobile */}
                  <div className="hidden md:block absolute right-[10%] xl:right-[15%] top-[15%] z-10 w-[210px] lg:w-[240px] aspect-[1125/2436] rounded-[32px] bg-brand-primary-soft/20 shadow-[0_12px_36px_rgba(0,0,0,0.06)] rotate-[8deg] transition-all duration-500 hover:scale-[1.03] hover:z-30 overflow-hidden border-4 border-white/90">
                    <img 
                      src="https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934354/AI-chat-mockup_iwasx7.png" 
                      alt="DearDiary AI Chat screen mockup displaying natural conversation flow with personal diary entry history" 
                      className="w-full h-full object-cover rounded-[28px] bg-white"
                      referrerPolicy="no-referrer"
                      loading="eager"
                      width={240}
                      height={519}
                    />
                  </div>

                  {/* Center Main Phone Mockup */}
                  <div className="absolute z-20 w-[240px] sm:w-[270px] md:w-[280px] lg:w-[310px] aspect-[1125/2436] rounded-[40px] bg-brand-primary-soft/20 shadow-[0_24px_64px_rgba(255,32,86,0.14)] transition-transform duration-500 hover:scale-[1.01] overflow-hidden border-6 border-white">
                    <img 
                      src="https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934357/home-tab-mockup_ocyq8s.png" 
                      alt="DearDiary Home dashboard mockup displaying morning greeting, daily streak, and emotional mood logger" 
                      className="w-full h-full object-cover rounded-[34px] bg-white"
                      referrerPolicy="no-referrer"
                      loading="eager"
                      width={310}
                      height={671}
                    />
                  </div>

                  {/* Sparkle animations positioned OUTSIDE phone silhouettes */}
                  <div className="absolute left-1.5 sm:left-4 top-10 z-30 text-brand-primary animate-twinkle-1 pointer-events-none">
                    <Sparkles size={24} className="opacity-80" />
                  </div>
                  <div className="absolute right-1.5 sm:right-4 top-24 z-30 text-lavender-accent animate-twinkle-2 pointer-events-none">
                    <Sparkles size={20} className="opacity-75" />
                  </div>
                  <div className="absolute left-3 sm:left-8 bottom-12 z-30 text-brand-primary animate-twinkle-2 pointer-events-none">
                    <Sparkles size={20} className="opacity-75" />
                  </div>
                  <div className="absolute right-3 sm:right-8 bottom-16 z-30 text-lavender-accent animate-twinkle-1 pointer-events-none">
                    <Sparkles size={22} className="opacity-80" />
                  </div>

                  {/* One small floating heart pill badge positioned at an outer corner (not overlapping phones) */}
                  <div className="hidden md:block absolute left-[-15px] lg:left-[2%] top-[38%] z-30 w-[64px] h-[64px] aspect-square rounded-2xl bg-white/95 p-1.5 shadow-[0_10px_25px_rgba(255,32,86,0.12)] border border-brand-primary-soft/40 animate-float-slow pointer-events-none transition-transform duration-300 hover:scale-110">
                    <img 
                      src="https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934358/mood_card_heart_faiodc.png" 
                      alt="Decorative heart icon indicating positive emotional logs" 
                      className="w-full h-full object-contain rounded-xl bg-white"
                      referrerPolicy="no-referrer"
                      loading="eager"
                      width={64}
                      height={64}
                    />
                  </div>

                </div>

              </div>
            </div>
          </section>

          {/* Problem & Promise Section */}
          <SectionWrapper id="problem" className="bg-warm-ivory border-b border-brand-primary-soft/10 relative overflow-hidden">
            {/* Subtle background image */}
            <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none">
              <img 
                src="https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934355/onboarding-reflect_i7hm6n.jpg"
                alt="Subtle peaceful desk background with writing materials"
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <Pill className="mb-4">Why journaling feels hard</Pill>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-heading mb-4">
                  <span className="text-brand-primary">Reflection</span> shouldn't feel like homework.
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 stagger-container">
                
                <Card className="stagger-item md:hover:translate-y-[-4px] md:hover:shadow-md hover:shadow-sm transition-all duration-300 flex flex-col justify-between bg-white border border-brand-primary-soft/10">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-soft-blue text-blue-accent flex items-center justify-center mb-6">
                      <FileText size={24} />
                    </div>
                    <h3 className="font-display font-semibold text-xl text-heading mb-3">The blank page</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      Staring at an empty page with no idea what to write.
                    </p>
                  </div>
                </Card>

                <Card className="stagger-item md:hover:translate-y-[-4px] md:hover:shadow-md hover:shadow-sm transition-all duration-300 flex flex-col justify-between bg-white border border-brand-primary-soft/10">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-soft-green text-green-accent flex items-center justify-center mb-6">
                      <Puzzle size={24} />
                    </div>
                    <h3 className="font-display font-semibold text-xl text-heading mb-3">Invisible patterns</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      Your emotional patterns are hard to see day to day.
                    </p>
                  </div>
                </Card>

                <Card className="stagger-item md:hover:translate-y-[-4px] md:hover:shadow-md hover:shadow-sm transition-all duration-300 flex flex-col justify-between bg-white border border-brand-primary-soft/10">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-soft-lavender text-lavender-accent flex items-center justify-center mb-6">
                      <Calendar size={24} />
                    </div>
                    <h3 className="font-display font-semibold text-xl text-heading mb-3">Habits that fade</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      Good intentions to journal rarely last past week two.
                    </p>
                  </div>
                </Card>

              </div>

              <div className="text-center max-w-2xl mx-auto">
                <p className="text-xl md:text-2xl font-medium text-heading leading-relaxed">
                  DearDiary makes journaling easier with guided prompts, mood tracking, and AI insights that help you understand yourself over time.
                </p>
              </div>
            </div>
          </SectionWrapper>

          {/* Features Section */}
          <SectionWrapper id="features">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-heading mb-4">
                Everything you need to reflect, <span className="text-brand-primary">consistently</span>
              </h2>
              <p className="text-text-secondary text-base md:text-lg max-w-xl mx-auto">
                A calm toolkit for writing, tracking, and understanding your emotional world.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-container">
              
              <Card className="stagger-item rounded-2xl shadow-sm md:hover:translate-y-[-4px] md:hover:shadow-md hover:shadow-sm transition-all duration-300 flex flex-col justify-between bg-white border border-brand-primary-soft/10">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-soft-blue text-blue-accent flex items-center justify-center mb-6">
                    <FileText size={24} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-heading mb-2">Smart Journaling</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Write entries, add moods, tags, and revisit your history anytime.
                  </p>
                </div>
              </Card>

              <Card className="stagger-item rounded-2xl shadow-sm md:hover:translate-y-[-4px] md:hover:shadow-md hover:shadow-sm transition-all duration-300 flex flex-col justify-between bg-white border border-brand-primary-soft/10">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-soft-green text-green-accent flex items-center justify-center mb-6">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-heading mb-2">Guided Reflection</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Get thoughtful prompts when you feel stuck, from gratitude to goal reviews.
                  </p>
                </div>
              </Card>

              <Card className="stagger-item rounded-2xl shadow-sm md:hover:translate-y-[-4px] md:hover:shadow-md hover:shadow-sm transition-all duration-300 flex flex-col justify-between bg-white border border-brand-primary-soft/10">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary-tint text-brand-primary flex items-center justify-center mb-6">
                    <Smile size={24} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-heading mb-2">Mood Tracking</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Track emotional check-ins and see how your moods shift over time.
                  </p>
                </div>
              </Card>

              <Card className="stagger-item rounded-2xl shadow-sm md:hover:translate-y-[-4px] md:hover:shadow-md hover:shadow-sm transition-all duration-300 flex flex-col justify-between bg-white border border-brand-primary-soft/10">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-soft-lavender text-lavender-accent flex items-center justify-center mb-6">
                    <BarChart2 size={24} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-heading mb-2">AI Insights</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Weekly and monthly summaries of your emotions, themes, and growth.
                  </p>
                </div>
              </Card>

              <Card className="stagger-item rounded-2xl shadow-sm md:hover:translate-y-[-4px] md:hover:shadow-md hover:shadow-sm transition-all duration-300 flex flex-col justify-between bg-white border border-brand-primary-soft/10">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-orange-soft text-orange-accent flex items-center justify-center mb-6">
                    <MessageCircle size={24} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-heading mb-2">Journal Chat</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Ask questions across your journal history and get real answers.
                  </p>
                </div>
              </Card>

              <Card className="stagger-item rounded-2xl shadow-sm md:hover:translate-y-[-4px] md:hover:shadow-md hover:shadow-sm transition-all duration-300 flex flex-col justify-between bg-white border border-brand-primary-soft/10">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-soft-blue text-blue-accent flex items-center justify-center mb-6">
                    <Calendar size={24} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-heading mb-2">Streaks & Calendar</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Build consistency and view your journaling activity over time.
                  </p>
                </div>
              </Card>

            </div>
          </SectionWrapper>

          {/* How It Works Section */}
          <SectionWrapper id="how-it-works" className="bg-white border-b border-brand-primary-soft/10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-heading leading-tight mb-4">
                From check-in to <span className="text-brand-primary">clarity</span>, in four simple steps.
              </h2>
            </div>

            {/* Desktop Timeline Layout */}
            <div className="hidden lg:block relative my-12">
              {/* Dotted/Gradient connection line */}
              <div className="absolute top-[28px] left-[12%] right-[12%] h-[2px] border-t-2 border-dashed border-brand-primary-soft/35 -z-10" />

              <div className="flex items-start justify-between gap-6 stagger-container">
                {/* Step 1 */}
                <div className="stagger-item flex-1 flex flex-col items-center text-center px-4">
                  <div className="w-14 h-14 rounded-full bg-brand-primary text-white font-semibold text-lg flex items-center justify-center shadow-md mb-6 border-4 border-white shrink-0">
                    1
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-soft-blue text-blue-accent flex items-center justify-center mb-4 shadow-sm shrink-0">
                    <Smile size={20} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-heading mb-2">Check in with your mood</h3>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-[200px]">
                    Quick emotional check-in before you write.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="stagger-item flex-1 flex flex-col items-center text-center px-4">
                  <div className="w-14 h-14 rounded-full bg-brand-primary text-white font-semibold text-lg flex items-center justify-center shadow-md mb-6 border-4 border-white shrink-0">
                    2
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-soft-green text-green-accent flex items-center justify-center mb-4 shadow-sm shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-heading mb-2">Write freely or choose a prompt</h3>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-[200px]">
                    No pressure to know what to say.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="stagger-item flex-1 flex flex-col items-center text-center px-4">
                  <div className="w-14 h-14 rounded-full bg-brand-primary text-white font-semibold text-lg flex items-center justify-center shadow-md mb-6 border-4 border-white shrink-0">
                    3
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand-primary-tint text-brand-primary flex items-center justify-center mb-4 shadow-sm shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-heading mb-2">Receive gentle AI reflections</h3>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-[200px]">
                    Follow-up questions that help you go deeper.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="stagger-item flex-1 flex flex-col items-center text-center px-4">
                  <div className="w-14 h-14 rounded-full bg-brand-primary text-white font-semibold text-lg flex items-center justify-center shadow-md mb-6 border-4 border-white shrink-0">
                    4
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-soft-lavender text-lavender-accent flex items-center justify-center mb-4 shadow-sm shrink-0">
                    <BarChart2 size={20} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-heading mb-2">Revisit your patterns</h3>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-[200px]">
                    Through insights, calendar, and journal chat.
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Timeline Layout */}
            <div className="block lg:hidden mt-10">
            <div className="relative space-y-12 stagger-container">
                {/* Vertical dotted connection line */}
                <div className="absolute top-[28px] bottom-[28px] left-[27px] w-[2px] border-l-2 border-dashed border-brand-primary-soft/45 -z-10" />

                {/* Step 1 */}
                <div className="stagger-item flex items-start gap-5">
                  <div className="w-14 h-14 rounded-full bg-brand-primary text-white font-semibold text-lg flex items-center justify-center shadow-md border-4 border-white shrink-0">
                    1
                  </div>
                  <div className="flex-1 pt-1 text-left">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-soft-blue text-blue-accent flex items-center justify-center">
                        <Smile size={18} />
                      </div>
                      <h3 className="font-display font-semibold text-base sm:text-lg text-heading">Check in with your mood</h3>
                    </div>
                    <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                      Quick emotional check-in before you write.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="stagger-item flex items-start gap-5">
                  <div className="w-14 h-14 rounded-full bg-brand-primary text-white font-semibold text-lg flex items-center justify-center shadow-md border-4 border-white shrink-0">
                    2
                  </div>
                  <div className="flex-1 pt-1 text-left">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-soft-green text-green-accent flex items-center justify-center">
                        <BookOpen size={18} />
                      </div>
                      <h3 className="font-display font-semibold text-base sm:text-lg text-heading">Write freely or choose a prompt</h3>
                    </div>
                    <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                      No pressure to know what to say.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="stagger-item flex items-start gap-5">
                  <div className="w-14 h-14 rounded-full bg-brand-primary text-white font-semibold text-lg flex items-center justify-center shadow-md border-4 border-white shrink-0">
                    3
                  </div>
                  <div className="flex-1 pt-1 text-left">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-brand-primary-tint text-brand-primary flex items-center justify-center">
                        <Sparkles size={18} />
                      </div>
                      <h3 className="font-display font-semibold text-base sm:text-lg text-heading">Receive gentle AI reflections</h3>
                    </div>
                    <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                      Follow-up questions that help you go deeper.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="stagger-item flex items-start gap-5">
                  <div className="w-14 h-14 rounded-full bg-brand-primary text-white font-semibold text-lg flex items-center justify-center shadow-md border-4 border-white shrink-0">
                    4
                  </div>
                  <div className="flex-1 pt-1 text-left">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-soft-lavender text-lavender-accent flex items-center justify-center">
                        <BarChart2 size={18} />
                      </div>
                      <h3 className="font-display font-semibold text-base sm:text-lg text-heading">Revisit your patterns</h3>
                    </div>
                    <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                      Through insights, calendar, and journal chat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionWrapper>

          {/* AI Reflection Assistant Section */}
          <SectionWrapper id="ai-assistant" className="bg-warm-ivory border-b border-brand-primary-soft/10">
            <div ref={aiSectionRef} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Copy & Value Props */}
              <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
                <Pill className="mb-6">
                  Gentle AI, not generic AI
                </Pill>
                
                <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-heading leading-tight tracking-tight mb-6 max-w-xl">
                  AI that helps you <span className="text-brand-primary">notice</span>, not an AI that writes for you.
                </h2>
                
                <p className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed mb-8 font-sans">
                  DearDiary's AI doesn't write your life for you. It helps you notice what matters, ask better questions, and reflect with more clarity.
                </p>

                <ul className="space-y-4 text-left w-full max-w-lg">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-text-secondary w-5 h-5 mt-0.5 shrink-0" />
                    <span className="text-text-secondary text-sm md:text-base">
                      Reflection prompts tailored to your entry
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-text-secondary w-5 h-5 mt-0.5 shrink-0" />
                    <span className="text-text-secondary text-sm md:text-base">
                      Thoughtful follow-up questions
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-text-secondary w-5 h-5 mt-0.5 shrink-0" />
                    <span className="text-text-secondary text-sm md:text-base">
                      Writing guidance when you feel stuck
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-text-secondary w-5 h-5 mt-0.5 shrink-0" />
                    <span className="text-text-secondary text-sm md:text-base">
                      A gentle summary at the end of each entry
                    </span>
                  </li>
                </ul>
              </div>

              {/* Right Column: Interactive Chat-Style Card */}
              <div className="lg:col-span-6 flex items-center justify-center relative w-full mt-6 lg:mt-0">
                <div className="w-full max-w-[420px] rounded-2xl bg-gradient-to-br from-[#F8E3FA] to-[#FFE2EA] p-6 sm:p-8 shadow-[0_16px_40px_rgba(255,32,86,0.06)] border border-white/60 relative overflow-hidden">
                  
                  {/* Decorative background glows */}
                  <div className="absolute top-[-20%] left-[-20%] w-48 h-48 rounded-full bg-white/20 blur-2xl" />
                  <div className="absolute bottom-[-20%] right-[-20%] w-48 h-48 rounded-full bg-brand-primary-soft/30 blur-2xl" />

                  {/* Staggered Prompt Chips Container */}
                  <div className="space-y-4 relative z-10">
                    
                    {/* Chip 1 */}
                    <div 
                      className={`flex items-start gap-3 transition-all duration-700 ease-out ${
                        aiSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                      }`}
                      style={{ transitionDelay: '100ms' }}
                    >
                      <div className="w-8 h-8 rounded-full bg-soft-lavender text-lavender-accent flex items-center justify-center shrink-0 shadow-sm border border-white/50">
                        <Feather size={14} />
                      </div>
                      <div className="bg-soft-lavender/95 backdrop-blur-sm border border-white/50 px-4 py-3 rounded-2xl rounded-tl-sm text-text-secondary text-sm font-medium shadow-sm max-w-[85%] text-left">
                        How did today feel?
                      </div>
                    </div>

                    {/* Chip 2 */}
                    <div 
                      className={`flex items-start gap-3 justify-end transition-all duration-700 ease-out ${
                        aiSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                      }`}
                      style={{ transitionDelay: '300ms' }}
                    >
                      <div className="bg-brand-primary-soft/95 backdrop-blur-sm border border-white/50 px-4 py-3 rounded-2xl rounded-tr-sm text-text-secondary text-sm font-medium shadow-sm max-w-[85%] text-left">
                        What challenged you today?
                      </div>
                    </div>

                    {/* Chip 3 */}
                    <div 
                      className={`flex items-start gap-3 transition-all duration-700 ease-out ${
                        aiSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                      }`}
                      style={{ transitionDelay: '500ms' }}
                    >
                      <div className="w-8 h-8 opacity-0 shrink-0" />
                      <div className="bg-soft-lavender/95 backdrop-blur-sm border border-white/50 px-4 py-3 rounded-2xl rounded-tl-sm text-text-secondary text-sm font-medium shadow-sm max-w-[85%] text-left">
                        What are you grateful for?
                      </div>
                    </div>

                    {/* Chip 4 */}
                    <div 
                      className={`flex items-start gap-3 justify-end transition-all duration-700 ease-out ${
                        aiSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                      }`}
                      style={{ transitionDelay: '700ms' }}
                    >
                      <div className="bg-brand-primary-soft/95 backdrop-blur-sm border border-white/50 px-4 py-3 rounded-2xl rounded-tr-sm text-text-secondary text-sm font-medium shadow-sm max-w-[85%] text-left">
                        What would you like to let go of?
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </SectionWrapper>

          {/* Mood Tracking & Insights Section */}
          <SectionWrapper id="mood-insights" className="bg-white border-b border-brand-primary-soft/10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Copy & Stats */}
              <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
                <Pill className="mb-6">
                  Simple, Organic Logs
                </Pill>
                
                <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-heading leading-tight tracking-tight mb-6 max-w-xl">
                  See how your emotional world <span className="text-brand-primary">changes</span> over time.
                </h2>
                
                <p className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed mb-8 font-sans">
                  From daily moods to recurring themes and weekly reflection patterns — DearDiary helps you notice what you might otherwise miss.
                </p>

                {/* 4 Small Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-2 stagger-container">
                  {/* Card 1 */}
                  <Card className="stagger-item p-4 min-h-[105px] flex flex-col justify-between items-center text-center bg-white border border-brand-primary-soft/10 rounded-2xl shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                    <div className="text-xs text-text-muted font-medium mb-1">Top Emotion</div>
                    <div className="text-xs sm:text-sm font-bold text-green-accent bg-soft-green/60 px-2.5 py-1 rounded-lg">
                      Grateful
                    </div>
                  </Card>

                  {/* Card 2 */}
                  <Card className="stagger-item p-4 min-h-[105px] flex flex-col justify-between items-center text-center bg-white border border-brand-primary-soft/10 rounded-2xl shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                    <div className="text-xs text-text-muted font-medium mb-1">Entries</div>
                    <div className="text-xs sm:text-sm font-bold text-blue-accent bg-soft-blue/60 px-2.5 py-1 rounded-lg">
                      128
                    </div>
                  </Card>

                  {/* Card 3 */}
                  <Card className="stagger-item p-4 min-h-[105px] flex flex-col justify-between items-center text-center bg-white border border-brand-primary-soft/10 rounded-2xl shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                    <div className="text-xs text-text-muted font-medium mb-1">Current Streak</div>
                    <div className="text-xs sm:text-sm font-bold text-brand-primary bg-brand-primary-soft/60 px-2.5 py-1 rounded-lg">
                      12 days
                    </div>
                  </Card>

                  {/* Card 4 */}
                  <Card className="stagger-item p-4 min-h-[105px] flex flex-col justify-between items-center text-center bg-white border border-brand-primary-soft/10 rounded-2xl shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                    <div className="text-xs text-text-muted font-medium mb-1">Pattern Found</div>
                    <div className="text-[11px] sm:text-xs font-bold text-lavender-accent bg-soft-lavender/60 px-2 py-1 rounded-lg leading-snug">
                      Evenings are calmer
                    </div>
                  </Card>
                </div>
              </div>

              {/* Right Column: Phone Mockup & Float Badge */}
              <div className="lg:col-span-6 flex items-center justify-center relative w-full mt-8 lg:mt-0">
                <div className="relative mx-auto max-w-[280px] sm:max-w-[320px] transition-transform duration-500 hover:scale-[1.02]">
                  {/* Soft background glow */}
                  <div className="absolute inset-0 bg-brand-primary/5 rounded-[40px] blur-2xl transform translate-y-4 scale-95" />
                  
                  {/* Tilted frame container */}
                  <div className="relative border-[8px] sm:border-[10px] border-zinc-900 rounded-[40px] sm:rounded-[44px] shadow-[0_24px_50px_rgba(0,0,0,0.12)] overflow-hidden bg-brand-primary-soft/10 aspect-[1125/2436] transform rotate-2">
                    <img 
                      src="https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934358/insights-tab-mockup_pee9hv.png" 
                      alt="DearDiary insights tab mockup displaying visual graphs of emotions and mood stats over time" 
                      className="w-full h-full object-cover bg-white"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      width={320}
                      height={693}
                    />
                  </div>
                </div>
              </div>

            </div>
          </SectionWrapper>

          {/* Chat With Your Journal Section */}
          <SectionWrapper id="chat-journal" className="bg-warm-ivory border-b border-brand-primary-soft/10 py-20 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Larger Phone Mockup with AI-chat-mockup */}
              <div className="lg:col-span-6 flex items-center justify-center relative w-full order-1">
                <div className="relative mx-auto w-full max-w-[310px] sm:max-w-[380px] transition-transform duration-500 hover:scale-[1.02]">
                  {/* Outer shadow glow */}
                  <div className="absolute inset-0 bg-brand-primary/4 rounded-[48px] blur-3xl transform translate-y-6 scale-95" />
                  
                  {/* Phone frame with rotation */}
                  <div className="relative border-[10px] sm:border-[12px] border-zinc-900 rounded-[44px] sm:rounded-[52px] shadow-[0_32px_64px_rgba(0,0,0,0.14)] overflow-hidden bg-brand-primary-soft/10 aspect-[1125/2436] transform -rotate-2">
                    <img 
                      src="https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934354/AI-chat-mockup_iwasx7.png" 
                      alt="DearDiary private AI chat dashboard mockup showing searchable and interactive diary history responses" 
                      className="w-full h-full object-cover bg-white"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      width={380}
                      height={823}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Copy & Interactive Questions */}
              <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left order-2">
                <Pill className="mb-6">
                  Your journal, searchable
                </Pill>
                
                <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-heading leading-tight tracking-tight mb-6 max-w-xl">
                  Ask <span className="text-brand-primary">meaningful</span> questions across your journal history.
                </h2>
                
                <p className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed mb-8 font-sans">
                  Uncover themes you may have missed, and rediscover moments you'd otherwise forget.
                </p>

                {/* Vertical Stack of Chat Bubble Prompt Chips */}
                <div className="space-y-4 w-full max-w-md text-left">
                  
                  {/* Chip 1 */}
                  <div className="flex items-start gap-3 transform hover:translate-x-1.5 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer bg-soft-lavender border border-white/60 p-4 rounded-2xl rounded-tl-sm shadow-sm hover:shadow">
                    <div className="w-8 h-8 rounded-full bg-white text-lavender-accent flex items-center justify-center shrink-0 shadow-sm">
                      <MessageCircle size={16} />
                    </div>
                    <div>
                      <p className="text-text-primary text-sm font-semibold mb-0.5">"What stressed me most this month?"</p>
                      <p className="text-text-secondary text-xs">Tap to search related topics & trends</p>
                    </div>
                  </div>

                  {/* Chip 2 */}
                  <div className="flex items-start gap-3 transform hover:translate-x-1.5 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer bg-brand-primary-soft border border-white/60 p-4 rounded-2xl rounded-tl-sm shadow-sm hover:shadow">
                    <div className="w-8 h-8 rounded-full bg-white text-brand-primary flex items-center justify-center shrink-0 shadow-sm">
                      <Heart size={16} />
                    </div>
                    <div>
                      <p className="text-brand-primary text-sm font-semibold mb-0.5">"When was I happiest?"</p>
                      <p className="text-text-secondary text-xs">Tap to revisit joyful days & memories</p>
                    </div>
                  </div>

                  {/* Chip 3 */}
                  <div className="flex items-start gap-3 transform hover:translate-x-1.5 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer bg-soft-green border border-white/60 p-4 rounded-2xl rounded-tl-sm shadow-sm hover:shadow">
                    <div className="w-8 h-8 rounded-full bg-white text-green-accent flex items-center justify-center shrink-0 shadow-sm">
                      <Star size={16} />
                    </div>
                    <div>
                      <p className="text-green-accent text-sm font-semibold mb-0.5">"What goals do I keep mentioning?"</p>
                      <p className="text-text-secondary text-xs">Tap to view recurring aspirations</p>
                    </div>
                  </div>

                  {/* Chip 4 */}
                  <div className="flex items-start gap-3 transform hover:translate-x-1.5 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer bg-soft-lavender border border-white/60 p-4 rounded-2xl rounded-tl-sm shadow-sm hover:shadow">
                    <div className="w-8 h-8 rounded-full bg-white text-lavender-accent flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="text-text-primary text-sm font-semibold mb-0.5">"What patterns keep showing up in my entries?"</p>
                      <p className="text-text-secondary text-xs">Tap to unlock recurring life habits</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </SectionWrapper>

          {/* Privacy & Security Section */}
          <SectionWrapper id="privacy-security" className="bg-[#FFF7FB] border-b border-brand-primary-soft/10 py-16 md:py-24">
            <div className="max-w-5xl mx-auto text-center">
              
              <Pill className="mb-4">Privacy first</Pill>
              
              <h2 className="font-display font-bold text-3xl md:text-4xl text-heading mb-4">
                Your journal is <span className="text-brand-primary">personal</span>.
              </h2>
              
              <p className="text-text-secondary max-w-xl mx-auto text-sm md:text-base mb-12 font-sans">
                DearDiary is designed around privacy, protection, and user control.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {/* Card 1 */}
                <Card className="bg-white border border-brand-primary-soft/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:translate-y-[-2px] transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-brand-primary-soft/40 text-brand-primary flex items-center justify-center mb-4 shrink-0">
                    <Lock size={20} />
                  </div>
                  <h3 className="font-sans font-semibold text-heading text-sm leading-snug">
                    Local-first architecture
                  </h3>
                </Card>

                {/* Card 2 */}
                <Card className="bg-white border border-brand-primary-soft/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:translate-y-[-2px] transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-brand-primary-soft/40 text-brand-primary flex items-center justify-center mb-4 shrink-0">
                    <Shield size={20} />
                  </div>
                  <h3 className="font-sans font-semibold text-heading text-sm leading-snug">
                    End-to-end encrypted entries
                  </h3>
                </Card>

                {/* Card 3 */}
                <Card className="bg-white border border-brand-primary-soft/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:translate-y-[-2px] transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-brand-primary-soft/40 text-brand-primary flex items-center justify-center mb-4 shrink-0">
                    <Fingerprint size={20} />
                  </div>
                  <h3 className="font-sans font-semibold text-heading text-sm leading-snug">
                    Biometric authentication
                  </h3>
                </Card>

                {/* Card 4 */}
                <Card className="bg-white border border-brand-primary-soft/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:translate-y-[-2px] transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-brand-primary-soft/40 text-brand-primary flex items-center justify-center mb-4 shrink-0">
                    <Key size={20} />
                  </div>
                  <h3 className="font-sans font-semibold text-heading text-sm leading-snug">
                    PIN protection
                  </h3>
                </Card>

                {/* Card 5 */}
                <Card className="bg-white border border-brand-primary-soft/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:translate-y-[-2px] transition-all duration-300 sm:col-span-2 md:col-span-1 lg:col-span-1">
                  <div className="w-12 h-12 rounded-full bg-brand-primary-soft/40 text-brand-primary flex items-center justify-center mb-4 shrink-0">
                    <Download size={20} />
                  </div>
                  <h3 className="font-sans font-semibold text-heading text-sm leading-snug">
                    Export your data anytime
                  </h3>
                </Card>
              </div>

            </div>
          </SectionWrapper>

          {/* App Screens Gallery Section */}
          <SectionWrapper id="app-screens" className="bg-white border-b border-brand-primary-soft/10 py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-5 text-center">
              <Pill className="mb-4">Designed for clarity</Pill>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-heading mb-4">
                Take a look <span className="text-brand-primary">inside</span> DearDiary
              </h2>
              <p className="text-text-secondary max-w-xl mx-auto text-sm md:text-base mb-16 font-sans">
                Explore the minimal, comforting layouts crafted to bring calm to your journaling experience.
              </p>

              {/* Desktop Layout: Horizontal staggered row */}
              <div className="hidden md:flex flex-row gap-6 justify-center items-start pt-8 pb-12">
                {[
                  { src: 'https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934357/home-tab-mockup_ocyq8s.png', title: 'Home', offset: 'translate-y-4', alt: 'DearDiary Home tab screen mockup showing mood logger, greeting message, and current streak statistics' },
                  { src: 'https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934357/reflect-tab-mockup_qdjdgq.png', title: 'Reflect', offset: '-translate-y-4', alt: 'DearDiary Reflect tab screen mockup showcasing a clean, minimalist space for free-form journaling' },
                  { src: 'https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934358/insights-tab-mockup_pee9hv.png', title: 'Insights', offset: 'translate-y-8', alt: 'DearDiary Insights tab mockup displaying visual mood distribution graphs and weekly summary cards' },
                  { src: 'https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934357/history-tab-mockup_piezwi.png', title: 'History', offset: '-translate-y-8', alt: 'DearDiary History tab mockup showing a chronologically arranged list of past secure journal entries' },
                  { src: 'https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934354/AI-chat-mockup_iwasx7.png', title: 'AI Chat', offset: 'translate-y-4', alt: 'DearDiary AI Chat tab screen mockup demonstrating smart, contextual query answers from the journal repository' },
                ].map((screen, idx) => (
                  <div 
                    key={idx} 
                    className={`flex-1 flex flex-col items-center transition-all duration-500 hover:scale-[1.03] ${screen.offset}`}
                  >
                    {/* Phone Frame */}
                    <div className="border-[8px] border-zinc-900 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] bg-brand-primary-soft/10 overflow-hidden w-[174px] aspect-[1125/2436]">
                      <img 
                        src={screen.src} 
                        alt={screen.alt} 
                        className="w-full h-full object-cover bg-white"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        width={174}
                        height={377}
                      />
                    </div>
                    {/* Caption */}
                    <span className="mt-4 text-xs font-semibold text-text-muted font-sans tracking-wide uppercase">
                      {screen.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mobile Layout: Swipeable Carousel with snap scrolling */}
              <div className="block md:hidden relative w-full overflow-hidden">
                <div 
                  ref={carouselRef}
                  onScroll={() => {
                    if (carouselRef.current) {
                      const { scrollLeft } = carouselRef.current;
                      const index = Math.round(scrollLeft / 244); // 220px width + 24px gap
                      setActiveScreenIndex(Math.max(0, Math.min(4, index)));
                    }
                  }}
                  className="flex flex-row gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-8 px-5"
                >
                  {[
                    { src: 'https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934357/home-tab-mockup_ocyq8s.png', title: 'Home', alt: 'DearDiary Home tab screen mockup showing mood logger, greeting message, and current streak statistics' },
                    { src: 'https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934357/reflect-tab-mockup_qdjdgq.png', title: 'Reflect', alt: 'DearDiary Reflect tab screen mockup showcasing a clean, minimalist space for free-form journaling' },
                    { src: 'https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934358/insights-tab-mockup_pee9hv.png', title: 'Insights', alt: 'DearDiary Insights tab mockup displaying visual mood distribution graphs and weekly summary cards' },
                    { src: 'https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934357/history-tab-mockup_piezwi.png', title: 'History', alt: 'DearDiary History tab mockup showing a chronologically arranged list of past secure journal entries' },
                    { src: 'https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934354/AI-chat-mockup_iwasx7.png', title: 'AI Chat', alt: 'DearDiary AI Chat tab screen mockup demonstrating smart, contextual query answers from the journal repository' },
                  ].map((screen, idx) => (
                    <div 
                      key={idx} 
                      className="w-[220px] shrink-0 snap-center flex flex-col items-center"
                    >
                      {/* Phone Frame */}
                      <div className="border-[8px] border-zinc-900 rounded-[32px] shadow-[0_16px_32px_rgba(0,0,0,0.08)] bg-brand-primary-soft/10 overflow-hidden w-full aspect-[1125/2436]">
                        <img 
                          src={screen.src} 
                          alt={screen.alt} 
                          className="w-full h-full object-cover bg-white"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          width={204}
                          height={442}
                        />
                      </div>
                      {/* Caption */}
                      <span className="mt-3 text-xs font-semibold text-text-muted font-sans tracking-wide uppercase">
                        {screen.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Interactive Dot indicators representing index */}
                <div className="flex justify-center gap-2 mt-2">
                  {[0, 1, 2, 3, 4].map((dot) => (
                    <div 
                      key={dot} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeScreenIndex === dot ? 'w-4 bg-brand-primary' : 'w-1.5 bg-brand-primary-soft/60'
                      }`}
                    />
                  ))}
                </div>
              </div>

            </div>
          </SectionWrapper>

          {/* Use Cases Section */}
          <SectionWrapper id="use-cases" className="bg-warm-ivory border-b border-brand-primary-soft/10 py-16 md:py-24">
            <div className="max-w-4xl mx-auto px-5 text-center">
              <Pill className="mb-4">Designed for you</Pill>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-heading mb-12">
                However you like to <span className="text-brand-primary">reflect</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left stagger-container">
                {/* Card 1 */}
                <Card className="stagger-item bg-soft-blue/60 border border-white/60 shadow-[0_8px_20px_rgba(0,0,0,0.01)] rounded-2xl p-6 flex items-center gap-4 md:hover:translate-y-[-4px] md:hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-white text-blue-accent flex items-center justify-center shrink-0 shadow-sm">
                    <Moon size={22} className="shrink-0" />
                  </div>
                  <p className="italic text-text-primary text-base sm:text-lg font-sans font-medium leading-snug">
                    "For evening reflection after a long day."
                  </p>
                </Card>

                {/* Card 2 */}
                <Card className="stagger-item bg-soft-green/60 border border-white/60 shadow-[0_8px_20px_rgba(0,0,0,0.01)] rounded-2xl p-6 flex items-center gap-4 md:hover:translate-y-[-4px] md:hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-white text-green-accent flex items-center justify-center shrink-0 shadow-sm">
                    <BarChart2 size={22} className="shrink-0" />
                  </div>
                  <p className="italic text-text-primary text-base sm:text-lg font-sans font-medium leading-snug">
                    "For tracking emotional patterns across a month."
                  </p>
                </Card>

                {/* Card 3 */}
                <Card className="stagger-item bg-soft-lavender/60 border border-white/60 shadow-[0_8px_20px_rgba(0,0,0,0.01)] rounded-2xl p-6 flex items-center gap-4 md:hover:translate-y-[-4px] md:hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-white text-lavender-accent flex items-center justify-center shrink-0 shadow-sm">
                    <Heart size={22} className="shrink-0" />
                  </div>
                  <p className="italic text-text-primary text-base sm:text-lg font-sans font-medium leading-snug">
                    "For guided gratitude and goal reviews."
                  </p>
                </Card>

                {/* Card 4 */}
                <Card className="stagger-item bg-brand-primary-soft/60 border border-white/60 shadow-[0_8px_20px_rgba(0,0,0,0.01)] rounded-2xl p-6 flex items-center gap-4 md:hover:translate-y-[-4px] md:hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-white text-brand-primary flex items-center justify-center shrink-0 shadow-sm">
                    <Search size={22} className="shrink-0" />
                  </div>
                  <p className="italic text-text-primary text-base sm:text-lg font-sans font-medium leading-snug">
                    "For rediscovering important moments in old entries."
                  </p>
                </Card>
              </div>

            </div>
          </SectionWrapper>





          {/* Early Access Waitlist Section */}
          <SectionWrapper id="early-access" className="bg-gradient-to-b from-[#FFF7FB] to-warm-ivory py-16 md:py-24">
            <div className="max-w-4xl mx-auto px-5">
              <div className="bg-white rounded-3xl p-8 md:p-16 border border-brand-primary-soft/15 shadow-sm text-center flex flex-col items-center">
                
                <h2 className="font-display font-bold text-3xl md:text-5xl text-heading tracking-tight leading-tight mb-4 max-w-2xl">
                  Be the <span className="text-brand-primary">first</span> to try DearDiary.
                </h2>
                
                <p className="text-text-secondary text-sm md:text-base max-w-xl mb-10 font-sans">
                  Join the waitlist and get early access before the public launch. We'll let you know the moment your spot opens up.
                </p>

                <div className="w-full max-w-md">
                  {waitlistStatus === 'submitted' ? (
                    <div className="space-y-4 p-6 bg-green-50 rounded-2xl border border-green-100 text-center animate-fade-in flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>
                      <p className="font-sans font-semibold text-green-800 text-base">
                        You're on the list — we'll be in touch soon.
                      </p>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-stretch">
                      <form 
                        onSubmit={(e) => {
                          /* 
                            REAL BACKEND INTEGRATION NOTE:
                            To connect a live database or form service (e.g. Formspree, HubSpot, loops.so):
                            1. Replace this submit handler or configure standard fetch/axios requests here.
                            2. Send `waitlistName` and `waitlistEmail` to your endpoint.
                            3. Set status accordingly.
                          */
                          handleWaitlistSubmit(e);
                        }} 
                        className="flex flex-col gap-3.5 w-full"
                      >
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                          <div className="flex-1 min-w-0">
                            <label htmlFor="waitlist-name" className="sr-only">Your name</label>
                            <input
                              id="waitlist-name"
                              type="text"
                              value={waitlistName}
                              onChange={(e) => {
                                setWaitlistName(e.target.value);
                                if (waitlistError) setWaitlistError(null);
                              }}
                              placeholder="Your Name"
                              className="w-full px-5 py-3 rounded-full border border-brand-primary-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary text-sm placeholder:text-text-muted bg-white"
                              required
                              disabled={waitlistStatus === 'submitting'}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <label htmlFor="waitlist-email" className="sr-only">Email address</label>
                            <input
                              id="waitlist-email"
                              type="email"
                              value={waitlistEmail}
                              onChange={(e) => {
                                setWaitlistEmail(e.target.value);
                                if (waitlistError) setWaitlistError(null);
                              }}
                              placeholder="you@example.com"
                              className="w-full px-5 py-3 rounded-full border border-brand-primary-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary text-sm placeholder:text-text-muted bg-white"
                              required
                              disabled={waitlistStatus === 'submitting'}
                              aria-describedby={waitlistError ? "waitlist-error" : undefined}
                            />
                          </div>
                        </div>
                        <Button 
                          type="submit" 
                          disabled={waitlistStatus === 'submitting'}
                          className="w-full shadow-sm rounded-full py-3.5"
                        >
                          {waitlistStatus === 'submitting' ? 'Saving spot...' : 'Get Early Access'}
                        </Button>
                      </form>
                      {waitlistError && (
                        <p id="waitlist-error" className="text-brand-primary text-xs text-left mt-2 pl-4 font-semibold animate-fade-in">
                          {waitlistError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <p className="mt-4 text-xs text-text-muted font-sans">
                  No spam. Just one email when we're ready for you.
                </p>

              </div>
            </div>
          </SectionWrapper>

          {/* FAQ Section */}
          <SectionWrapper id="faq" className="bg-white border-b border-brand-primary-soft/10 py-16 md:py-24">
            <div className="max-w-3xl mx-auto px-5">
              <div className="text-center mb-12">
                <Pill className="mb-4">FAQ</Pill>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-heading tracking-tight">
                  Questions, <span className="text-brand-primary">answered</span>
                </h2>
              </div>

              <div className="space-y-3 max-w-[700px] mx-auto stagger-container">
                {FAQ_ITEMS.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      className={`stagger-item bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                        isOpen 
                          ? 'border-brand-primary/60 shadow-[0_4px_20px_rgba(255,32,86,0.06)]' 
                          : 'border-brand-primary/35 hover:border-brand-primary/60'
                      }`}
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-5 md:p-6 text-left font-sans font-semibold text-heading text-sm md:text-base hover:bg-brand-primary-soft/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/45 focus-visible:bg-brand-primary-soft/5 focus-visible:relative focus-visible:z-10"
                      >
                        <span>{item.question}</span>
                        <ChevronDown 
                          size={18} 
                          className={`text-text-muted transition-transform duration-[250ms] ease-out shrink-0 ml-4 ${isOpen ? 'rotate-180 text-brand-primary' : ''}`} 
                        />
                      </button>
                      <div 
                        className={`transition-all duration-[250ms] ease-out overflow-hidden ${
                          isOpen ? 'max-h-[300px] opacity-100 border-t border-brand-primary-soft/5' : 'max-h-0 opacity-0 pointer-events-none'
                        }`}
                      >
                        <p className="p-5 md:p-6 text-sm text-text-secondary leading-relaxed font-sans bg-[#FFFDFE]">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionWrapper>

          {/* Final CTA Section */}
          <SectionWrapper id="final-cta" className="bg-gradient-to-b from-[#FFF7FB] to-warm-ivory py-20 md:py-28 border-b border-brand-primary-soft/10 text-center">
            <div className="max-w-4xl mx-auto px-5">
              <h2 className="font-display font-bold text-3xl md:text-[44px] leading-tight md:leading-tight text-heading tracking-tight mb-8 max-w-2xl mx-auto">
                Start building a reflection habit that actually feels <span className="text-brand-primary">gentle</span>.
              </h2>
              <Button 
                onClick={() => scrollToSection('early-access')}
                className="!px-8 !py-4 md:!text-lg font-semibold tracking-wide shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Early Access
              </Button>
            </div>
          </SectionWrapper>

          {/* Footer */}
          <footer className="bg-[#18181B] text-zinc-100 py-12 md:py-16 font-sans">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                
                {/* Brand Column */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white p-1 rounded-xl inline-flex items-center justify-center shadow-sm bg-brand-primary-soft/10">
                      <img 
                        src="https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934358/splash-logo_kmqgr7.png" 
                        alt="DearDiary elegant book and quill minimalist app brand logo" 
                        className="h-10 w-10 object-contain" 
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        width={40}
                        height={40}
                      />
                    </div>
                    <span className="font-display font-bold text-lg text-white">DearDiary</span>
                  </div>
                  <p className="text-zinc-400 text-sm max-w-sm leading-relaxed">
                    DearDiary is a private AI journaling companion for reflection, mood tracking, and emotional insight.
                  </p>
                </div>

                {/* Product Column */}
                <div>
                  <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Product</h3>
                  <ul className="space-y-2.5">
                    <li>
                      <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="text-zinc-400 hover:text-white text-sm transition-colors">Features</a>
                    </li>
                    <li>
                      <a href="#privacy-security" onClick={(e) => { e.preventDefault(); scrollToSection('privacy-security'); }} className="text-zinc-400 hover:text-white text-sm transition-colors">Privacy</a>
                    </li>
                    <li>
                      <a href="#early-access" onClick={(e) => { e.preventDefault(); scrollToSection('early-access'); }} className="text-zinc-400 hover:text-white text-sm transition-colors">Pricing</a>
                    </li>
                    <li>
                      <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }} className="text-zinc-400 hover:text-white text-sm transition-colors">FAQ</a>
                    </li>
                  </ul>
                </div>

                {/* Legal Column */}
                <div>
                  <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Legal</h3>
                  <ul className="space-y-2.5">
                    <li>
                      <a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                    </li>
                    <li>
                      <a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Bottom bar */}
              <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
                <div>
                  &copy; 2026 DearDiary. All rights reserved.
                </div>
                <div className="flex gap-4">
                  <a href="#" className="p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
                    <Twitter size={16} />
                  </a>
                  <a href="#" className="p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
                    <Instagram size={16} />
                  </a>
                  <a href="#" className="p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
                    <Github size={16} />
                  </a>
                </div>
              </div>

            </div>
          </footer>

        </div>
      ) : (
        /* Full Sandbox Interactive Diary App */
        <div className="pt-[72px] pb-24 bg-page-blush min-h-screen">
          <div className="max-w-4xl mx-auto px-5">
            
            {/* Header within app to go back or show profile status */}
            <div className="flex items-center justify-between py-6 border-b border-brand-primary-soft/20 mb-6">
              <div className="flex items-center gap-3">
                <img 
                  src={profile.avatarUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-brand-primary-soft object-cover bg-brand-primary-soft/10" 
                  loading="eager"
                  width={40}
                  height={40}
                />
                <div>
                  <h4 className="font-semibold text-sm text-heading">{profile.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-brand-primary font-semibold">
                    <Flame size={14} className="fill-brand-primary" />
                    <span>{profile.streakCount} Day Streak</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setView('landing')}
                className="text-xs font-semibold px-4 py-2 rounded-full border border-brand-primary/10 text-brand-primary bg-white hover:bg-brand-primary-soft/20 transition-all duration-300"
              >
                Back to Landing Page
              </button>
            </div>

            {/* Active Tab viewport */}
            <div className="transition-opacity duration-300">
              {activeTab === 'today' && (
                <TodayTab 
                  profile={profile}
                  moodLogs={moodLogs}
                  onAddMoodLog={handleAddMoodLog}
                  onSelectPrompt={handleSelectPrompt}
                />
              )}

              {activeTab === 'reflect' && (
                <ReflectTab 
                  selectedPromptText={selectedPromptText}
                  onClearPromptText={() => setSelectedPromptText(null)}
                  onSaveEntry={handleSaveEntry}
                />
              )}

              {activeTab === 'history' && (
                <HistoryTab 
                  entries={entries}
                  onDeleteEntry={handleDeleteEntry}
                />
              )}

              {activeTab === 'insights' && (
                <InsightsTab 
                  entries={entries}
                  moodLogs={moodLogs}
                />
              )}

              {activeTab === 'chat' && (
                <ChatTab 
                  chatHistory={chatHistory}
                  onSendMessage={handleSendMessage}
                  onClearHistory={handleClearChatHistory}
                  isAiTyping={isAiTyping}
                />
              )}
            </div>

          </div>

          {/* App-specific bottom navigation bar */}
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}

      {view === 'landing' && (
        <button
          onClick={() => scrollToSection('hero')}
          className={`fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-brand-primary text-white shadow-[0_4px_20px_rgba(255,32,86,0.25)] hover:shadow-[0_6px_24px_rgba(255,32,86,0.35)] hover:bg-brand-primary-hover active:scale-95 transition-all duration-300 flex items-center justify-center border border-white/25 ${
            showBackToTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          title="Back to top"
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}

    </div>
  );
}
