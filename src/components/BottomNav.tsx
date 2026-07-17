import React from 'react';
import { Home, Heart, Calendar, BarChart2, MessageCircle } from 'lucide-react';

export type TabId = 'today' | 'reflect' | 'history' | 'insights' | 'chat';

interface BottomNavProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'today' as TabId, label: 'Today', icon: Home },
    { id: 'reflect' as TabId, label: 'Reflect', icon: Heart },
    { id: 'history' as TabId, label: 'History', icon: Calendar },
    { id: 'insights' as TabId, label: 'Insights', icon: BarChart2 },
    { id: 'chat' as TabId, label: 'AI Chat', icon: MessageCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-rose-100 bg-white/80 pb-safe-bottom backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="group relative flex flex-col items-center justify-center py-1 transition-all duration-300"
              style={{ width: '20%' }}
            >
              <div
                className={`rounded-xl p-1.5 transition-all duration-300 ${
                  isActive
                    ? 'bg-rose-50 text-rose-500 scale-110'
                    : 'text-gray-400 group-hover:text-gray-600'
                }`}
              >
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
              </div>
              <span
                className={`text-[10px] mt-0.5 font-medium transition-colors duration-300 ${
                  isActive ? 'text-rose-500 font-semibold' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 h-0.5 w-6 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
