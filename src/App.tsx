import React, { useState, useEffect } from 'react';
import { VOCABULARY_LIST } from './data/vocabulary';
import { ActiveTab, UserStats, VocabWord } from './types';
import { Navbar } from './components/Navbar';
import { GardenProgress } from './components/GardenProgress';
import { FlashcardsView } from './components/FlashcardsView';
import { MemoryGameView } from './components/MemoryGameView';
import { IoeGameView } from './components/IoeGameView';
import { QuizView } from './components/QuizView';
import { SpellingBeeView } from './components/SpellingBeeView';
import { DictionaryView } from './components/DictionaryView';
import { soundEffects } from './utils/audio';
import { Layers, Sparkles, Award, HelpCircle, Headphones, Search, Heart, Leaf } from 'lucide-react';

const STORAGE_KEY = 'eco_beauty_vocab_garden_stats_v2';

const DEFAULT_STATS: UserStats = {
  masteredIds: [],
  starredIds: [],
  ioeScore: 0,
  quizHighScores: {
    enToVi: 0,
    viToEn: 0
  },
  memoryBestMoves: null,
  memoryBestTime: null,
  spellingScore: 0,
  currentStreakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalAnswered: 0,
  correctAnswered: 0
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('flashcard');
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // check streak
        const today = new Date().toISOString().split('T')[0];
        if (parsed.lastActiveDate !== today) {
          const lastDate = new Date(parsed.lastActiveDate);
          const currentDate = new Date(today);
          const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) {
            parsed.currentStreakDays = (parsed.currentStreakDays || 0) + 1;
          } else if (diffDays > 1) {
            parsed.currentStreakDays = 1;
          }
          parsed.lastActiveDate = today;
        }
        return { ...DEFAULT_STATS, ...parsed };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_STATS;
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGardenModalOpen, setIsGardenModalOpen] = useState(false);

  // Sync stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Ignore storage errors
    }
  }, [stats]);

  // Mastered toggle handler
  const handleToggleMastered = (id: string) => {
    setStats(prev => {
      const exists = prev.masteredIds.includes(id);
      const updated = exists
        ? prev.masteredIds.filter(item => item !== id)
        : [...prev.masteredIds, id];

      if (!exists) {
        soundEffects.playCorrect();
      } else {
        soundEffects.playClick();
      }
      return { ...prev, masteredIds: updated };
    });
  };

  // Starred toggle handler
  const handleToggleStarred = (id: string) => {
    setStats(prev => {
      const exists = prev.starredIds.includes(id);
      const updated = exists
        ? prev.starredIds.filter(item => item !== id)
        : [...prev.starredIds, id];
      soundEffects.playClick();
      return { ...prev, starredIds: updated };
    });
  };

  // IOE score updater
  const handleUpdateIoeScore = (newScore: number) => {
    setStats(prev => ({
      ...prev,
      ioeScore: newScore
    }));
  };

  // Quiz high score updater
  const handleUpdateQuizHighScore = (mode: 'enToVi' | 'viToEn', finalScore: number) => {
    setStats(prev => ({
      ...prev,
      quizHighScores: {
        ...prev.quizHighScores,
        [mode]: Math.max(prev.quizHighScores[mode], finalScore)
      }
    }));
  };

  // Memory best score updater
  const handleUpdateMemoryScore = (moves: number, time: number) => {
    setStats(prev => ({
      ...prev,
      memoryBestMoves: prev.memoryBestMoves ? Math.min(prev.memoryBestMoves, moves) : moves,
      memoryBestTime: prev.memoryBestTime ? Math.min(prev.memoryBestTime, time) : time
    }));
  };

  // Spelling score updater
  const handleUpdateSpellingScore = (newScore: number) => {
    setStats(prev => ({
      ...prev,
      spellingScore: newScore
    }));
  };

  // Reset progress
  const handleResetProgress = () => {
    setStats({
      ...DEFAULT_STATS,
      lastActiveDate: new Date().toISOString().split('T')[0]
    });
    setIsGardenModalOpen(false);
    soundEffects.playClick();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-emerald-50/40 text-slate-800">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        totalWords={VOCABULARY_LIST.length}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenGardenModal={() => setIsGardenModalOpen(true)}
      />

      {/* Main Study Arena */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* App Hero Introduction */}
        <section className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 text-rose-700 text-xs font-bold tracking-wide uppercase">
            <span>🌸</span>
            <span>Unit 2: Eco-Friendly Lifestyle</span>
            <span>🌿</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Vườn Từ Vựng Sinh Thái Xanh
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Học trọn vẹn <strong>88 từ vựng</strong> Tiếng Anh 10 Unit 2 với Flashcard 3D thông minh, Game IOE điền từ, Lật hình trí nhớ và Trắc nghiệm thi thử.
          </p>
        </section>

        {/* View Router */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'flashcard' && (
            <FlashcardsView
              words={VOCABULARY_LIST}
              masteredIds={stats.masteredIds}
              starredIds={stats.starredIds}
              onToggleMastered={handleToggleMastered}
              onToggleStarred={handleToggleStarred}
            />
          )}

          {activeTab === 'memory' && (
            <MemoryGameView
              words={VOCABULARY_LIST}
              bestMoves={stats.memoryBestMoves}
              bestTime={stats.memoryBestTime}
              onUpdateBestScore={handleUpdateMemoryScore}
            />
          )}

          {activeTab === 'ioe' && (
            <IoeGameView
              words={VOCABULARY_LIST}
              score={stats.ioeScore}
              onUpdateScore={handleUpdateIoeScore}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView
              words={VOCABULARY_LIST}
              highScores={stats.quizHighScores}
              onUpdateHighScore={handleUpdateQuizHighScore}
            />
          )}

          {activeTab === 'spelling' && (
            <SpellingBeeView
              words={VOCABULARY_LIST}
              score={stats.spellingScore}
              onUpdateScore={handleUpdateSpellingScore}
            />
          )}

          {activeTab === 'dict' && (
            <DictionaryView
              words={VOCABULARY_LIST}
              masteredIds={stats.masteredIds}
              starredIds={stats.starredIds}
              onToggleMastered={handleToggleMastered}
              onToggleStarred={handleToggleStarred}
            />
          )}
        </div>
      </main>

      {/* Garden Progress Modal */}
      <GardenProgress
        isOpen={isGardenModalOpen}
        onClose={() => setIsGardenModalOpen(false)}
        stats={stats}
        totalWords={VOCABULARY_LIST.length}
        onResetProgress={handleResetProgress}
      />

      {/* Subtle Anti-Slop Footer */}
      <footer className="border-t border-rose-100/80 bg-white/70 backdrop-blur-xs py-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-slate-500">
            <span>🌸 Eco-Beauty Vocab Garden</span>
            <span aria-hidden="true">·</span>
            <span>English 10 Global Success Unit 2</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>88 từ vựng chuẩn ngữ pháp & phát âm</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsGardenModalOpen(true)}
              className="text-emerald-700 font-semibold hover:underline"
            >
              🌱 Xem tiến độ ({Math.round((stats.masteredIds.length / VOCABULARY_LIST.length) * 100)}%)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
