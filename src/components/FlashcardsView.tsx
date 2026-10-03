import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { VocabWord } from '../types';
import { soundEffects, speakWord } from '../utils/audio';
import { 
  Volume2, 
  RotateCw, 
  Shuffle, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  CheckCircle, 
  Play, 
  Pause,
  Filter,
  Sparkles
} from 'lucide-react';

interface FlashcardsViewProps {
  words: VocabWord[];
  masteredIds: string[];
  starredIds: string[];
  onToggleMastered: (id: string) => void;
  onToggleStarred: (id: string) => void;
}

type FilterMode = 'all' | 'unmastered' | 'mastered' | 'starred';

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  words,
  masteredIds,
  starredIds,
  onToggleMastered,
  onToggleStarred
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showExample, setShowExample] = useState(false);

  // Filtered dataset
  const filteredWords = useMemo(() => {
    switch (filterMode) {
      case 'starred':
        return words.filter(w => starredIds.includes(w.id));
      case 'mastered':
        return words.filter(w => masteredIds.includes(w.id));
      case 'unmastered':
        return words.filter(w => !masteredIds.includes(w.id));
      default:
        return words;
    }
  }, [words, filterMode, starredIds, masteredIds]);

  // Adjust index if out of bounds after filter change
  useEffect(() => {
    if (currentIndex >= filteredWords.length) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  }, [filterMode, filteredWords.length, currentIndex]);

  const currentWord = filteredWords[currentIndex] || words[0];
  const isMastered = masteredIds.includes(currentWord?.id || '');
  const isStarred = starredIds.includes(currentWord?.id || '');

  const handleFlip = useCallback(() => {
    soundEffects.playFlip();
    setIsFlipped(prev => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (filteredWords.length <= 1) return;
    soundEffects.playClick();
    setIsFlipped(false);
    setShowExample(false);
    setCurrentIndex(prev => (prev + 1) % filteredWords.length);
  }, [filteredWords.length]);

  const handlePrev = useCallback(() => {
    if (filteredWords.length <= 1) return;
    soundEffects.playClick();
    setIsFlipped(false);
    setShowExample(false);
    setCurrentIndex(prev => (prev - 1 + filteredWords.length) % filteredWords.length);
  }, [filteredWords.length]);

  const handleRandom = useCallback(() => {
    if (filteredWords.length <= 1) return;
    soundEffects.playClick();
    setIsFlipped(false);
    setShowExample(false);
    let nextIdx = Math.floor(Math.random() * filteredWords.length);
    if (nextIdx === currentIndex) {
      nextIdx = (nextIdx + 1) % filteredWords.length;
    }
    setCurrentIndex(nextIdx);
  }, [filteredWords.length, currentIndex]);

  const handlePronounce = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentWord) {
      speakWord(currentWord.en, speechRate);
    }
  }, [currentWord, speechRate]);

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isAutoPlaying && filteredWords.length > 0) {
      timer = setInterval(() => {
        setIsFlipped(prev => {
          if (!prev) {
            // First flip to reveal definition
            soundEffects.playFlip();
            return true;
          } else {
            // Then move to next card
            handleNext();
            return false;
          }
        });
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoPlaying, filteredWords.length, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if focus is on an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === 's' && currentWord) {
        onToggleStarred(currentWord.id);
      } else if (e.key.toLowerCase() === 'm' && currentWord) {
        onToggleMastered(currentWord.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentWord, onToggleStarred, onToggleMastered]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {/* Top Filter and Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-rose-100">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-rose-100/80 shadow-2xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            Tất cả ({words.length})
          </button>
          <button
            onClick={() => setFilterMode('unmastered')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterMode === 'unmastered'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            Cần học ({words.length - masteredIds.length})
          </button>
          <button
            onClick={() => setFilterMode('mastered')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterMode === 'mastered'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            Đã thuộc ({masteredIds.length})
          </button>
          <button
            onClick={() => setFilterMode('starred')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterMode === 'starred'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            ⭐ Yêu thích ({starredIds.length})
          </button>
        </div>

        {/* Speed & Auto play controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs text-slate-600">
            <span>Tốc độ:</span>
            <button
              onClick={() => setSpeechRate(0.75)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${speechRate === 0.75 ? 'bg-rose-100 text-rose-700' : 'hover:bg-slate-100'}`}
              title="Phát âm chậm 0.75x"
            >
              0.75x
            </button>
            <button
              onClick={() => setSpeechRate(0.95)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${speechRate === 0.95 ? 'bg-rose-100 text-rose-700' : 'hover:bg-slate-100'}`}
              title="Phát âm chuẩn 1.0x"
            >
              1.0x
            </button>
          </div>

          <button
            onClick={() => setIsAutoPlaying(prev => !prev)}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isAutoPlaying
                ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
            title="Tự động lật và chuyển từ (Slideshow)"
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAutoPlaying ? 'Dừng phát' : 'Tự chạy'}</span>
          </button>
        </div>
      </div>

      {filteredWords.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-rose-100 space-y-3">
          <div className="text-4xl">🍃</div>
          <h4 className="font-bold text-slate-800 text-base">Không có từ vựng nào trong mục này</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filterMode === 'starred'
              ? 'Bạn chưa gắn dấu sao cho từ vựng nào. Hãy bấm biểu tượng ngôi sao trên các thẻ để lưu vào đây!'
              : 'Hãy chuyển sang bộ lọc "Tất cả" để tiếp tục học nhé.'}
          </p>
          <button
            onClick={() => setFilterMode('all')}
            className="px-4 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 transition-colors"
          >
            Xem tất cả từ vựng
          </button>
        </div>
      ) : (
        <>
          {/* Progress counter */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
            <span>
              Thẻ số <strong className="text-slate-800 tabular-nums">{currentIndex + 1}</strong> / <span className="tabular-nums">{filteredWords.length}</span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Mẹo: Phím <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">Space</kbd> lật thẻ · <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">←</kbd> <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">→</kbd> chuyển từ
            </span>
          </div>

          {/* 3D Flashcard Container */}
          <div 
            className="relative w-full h-80 sm:h-96 select-none cursor-pointer group"
            style={{ perspective: '1200px' }}
            onClick={handleFlip}
          >
            <div
              className={`w-full h-full relative transition-transform duration-500 ease-out`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* FRONT OF CARD (ENGLISH) */}
              <div
                className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-white via-rose-50/40 to-emerald-50/30 border-2 border-rose-200 p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-lg shadow-rose-100/50"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Card Top Badges & Actions */}
                <div className="w-full flex items-center justify-between" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
                      {currentWord.type}
                    </span>
                    {currentWord.category && (
                      <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                        {currentWord.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleStarred(currentWord.id)}
                      className="p-1.5 rounded-full hover:bg-rose-100/60 text-slate-300 hover:text-amber-500 transition-colors"
                      title={isStarred ? 'Bỏ yêu thích' : 'Gắn sao yêu thích (Phím S)'}
                    >
                      <Star className={`w-5 h-5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => onToggleMastered(currentWord.id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        isMastered
                          ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={isMastered ? 'Đã thuộc từ này (Phím M)' : 'Đánh dấu đã thuộc (Phím M)'}
                    >
                      <CheckCircle className={`w-5 h-5 ${isMastered ? 'fill-emerald-100' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Central English Content */}
                <div className="space-y-2 my-auto">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-rose-600 tracking-tight">
                    {currentWord.en}
                  </h2>
                  <p className="text-sm sm:text-base font-mono text-slate-500 font-medium">
                    {currentWord.pron}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={handlePronounce}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all transform hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                      title="Nghe phát âm chuẩn giọng bản xứ"
                    >
                      <Volume2 className="w-5 h-5" />
                      <span className="text-xs font-bold">Phát âm</span>
                    </button>
                  </div>
                </div>

                {/* Card Bottom Hint */}
                <div className="w-full flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-rose-100/60">
                  <span className="flex items-center gap-1 text-slate-400">
                    <RotateCw className="w-3.5 h-3.5" />
                    Chạm hoặc nhấn Space để xem nghĩa
                  </span>
                  {isMastered && (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Đã thuộc
                    </span>
                  )}
                </div>
              </div>

              {/* BACK OF CARD (VIETNAMESE & EXAMPLE) */}
              <div
                className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 border-2 border-emerald-200 p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-lg shadow-emerald-100/50"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* Back Header */}
                <div className="w-full flex items-center justify-between text-xs text-emerald-700">
                  <span className="font-semibold uppercase tracking-wider">Nghĩa Tiếng Việt</span>
                  <span className="font-bold">{currentWord.en}</span>
                </div>

                {/* Back Vietnamese Meaning */}
                <div className="space-y-4 my-auto w-full px-2">
                  <div className="space-y-1">
                    <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
                      {currentWord.vi}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      ({currentWord.type}) {currentWord.pron}
                    </div>
                  </div>

                  {/* Example Context */}
                  {currentWord.exampleEn && (
                    <div 
                      className="p-3.5 rounded-xl bg-white/90 border border-emerald-100/80 shadow-2xs text-left space-y-1 max-w-lg mx-auto"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="text-xs font-semibold text-slate-700 leading-snug">
                        💡 "{currentWord.exampleEn}"
                      </div>
                      <div className="text-[11px] text-slate-500 italic">
                        ➔ {currentWord.exampleVi}
                      </div>
                    </div>
                  )}
                </div>

                {/* Back Bottom */}
                <div className="w-full flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-emerald-100/70">
                  <span className="flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    Chạm để quay lại mặt trước
                  </span>
                  <button
                    onClick={handlePronounce}
                    className="flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Nghe lại
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-rose-200 shadow-xs font-bold text-xs sm:text-sm transition-all transform hover:-translate-x-0.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Từ trước</span>
            </button>

            <button
              onClick={handleRandom}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 shadow-xs font-bold text-xs sm:text-sm transition-all transform hover:rotate-12 cursor-pointer"
              title="Chọn ngẫu nhiên một từ trong danh sách"
            >
              <Shuffle className="w-4 h-4" />
              <span>Ngẫu nhiên</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-bold text-xs sm:text-sm transition-all transform hover:translate-x-0.5 cursor-pointer"
            >
              <span>Từ sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
