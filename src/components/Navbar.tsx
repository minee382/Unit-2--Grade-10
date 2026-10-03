import React from 'react';
import { ActiveTab, UserStats } from '../types';
import { Volume2, VolumeX, Sparkles, BookOpen, Layers, Award, HelpCircle, Headphones, Search } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  stats: UserStats;
  totalWords: number;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onOpenGardenModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  totalWords,
  soundEnabled,
  setSoundEnabled,
  onOpenGardenModal
}) => {
  const tabs = [
    { id: 'flashcard' as ActiveTab, label: 'Flashcard', icon: Layers },
    { id: 'memory' as ActiveTab, label: 'Lật Hình', icon: Sparkles },
    { id: 'ioe' as ActiveTab, label: 'Game IOE', icon: Award },
    { id: 'quiz' as ActiveTab, label: 'Trắc Nghiệm', icon: HelpCircle },
    { id: 'spelling' as ActiveTab, label: 'Luyện Nghe', icon: Headphones },
    { id: 'dict' as ActiveTab, label: 'Tra Từ Điển', icon: Search },
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    soundEffects.playClick();
    setActiveTab(tabId);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.setSoundEnabled(next);
    if (next) soundEffects.playCorrect();
  };

  const masteredCount = stats.masteredIds.length;
  const masteredPercent = Math.round((masteredCount / totalWords) * 100);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('flashcard')}
          className="flex items-center gap-2 group text-left cursor-pointer"
        >
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600 group-hover:text-rose-700 transition-colors">
            🌸 Eco-Beauty Vocab Garden
          </span>
          <span className="hidden lg:inline-block text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
            Unit 2 English 10
          </span>
        </button>

        {/* Zone 2: Navigation tabs */}
        <nav className="hidden md:flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-200 scale-102'
                    : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions & Garden quick progress button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenGardenModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/70 text-xs font-semibold transition-colors cursor-pointer"
            title="Xem tiến độ khu vườn"
          >
            <span className="text-sm">🌱</span>
            <span className="tabular-nums font-bold">{masteredPercent}%</span>
            <span className="hidden sm:inline text-emerald-600 font-medium">thuộc</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
            title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
            aria-label="Toggle sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile subnav row */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 bg-rose-50/60 border-t border-rose-100/60 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white/80'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
