import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VocabWord } from '../types';
import { soundEffects, speakWord } from '../utils/audio';
import { Volume2, Award, Flame, ArrowRight, HelpCircle, Check, RotateCcw } from 'lucide-react';

interface IoeGameViewProps {
  words: VocabWord[];
  score: number;
  onUpdateScore: (newScore: number) => void;
}

interface TileState {
  char: string;
  isGiven: boolean;
  isSpace: boolean;
  isHyphen: boolean;
  userChar: string;
  originalIndex: number;
}

export const IoeGameView: React.FC<IoeGameViewProps> = ({
  words,
  score,
  onUpdateScore
}) => {
  const [currentWord, setCurrentWord] = useState<VocabWord>(words[0]);
  const [tiles, setTiles] = useState<TileState[]>([]);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [revealed, setRevealed] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize a new IOE word challenge
  const setupWord = useCallback((targetWord?: VocabWord) => {
    const word = targetWord || words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
    setFeedback('idle');
    setRevealed(false);

    const chars = word.en.toLowerCase().split('');
    
    // Determine which letters to hide (around 40% to 50% of alphanumeric characters)
    // Always hide at least 1 character
    const lettersToHide = new Set<number>();
    const validIndices = chars
      .map((c, i) => (c !== ' ' && c !== '-') ? i : -1)
      .filter(i => i !== -1);

    // Pick 40-50% of characters to hide
    const countToHide = Math.max(1, Math.floor(validIndices.length * 0.45));
    const shuffledValid = [...validIndices].sort(() => 0.5 - Math.random());
    for (let i = 0; i < countToHide; i++) {
      lettersToHide.add(shuffledValid[i]);
    }

    const newTiles: TileState[] = chars.map((char, index) => {
      const isSpace = char === ' ';
      const isHyphen = char === '-';
      const isGiven = isSpace || isHyphen || !lettersToHide.has(index);

      return {
        char,
        isGiven,
        isSpace,
        isHyphen,
        userChar: isGiven ? char : '',
        originalIndex: index
      };
    });

    setTiles(newTiles);
    inputRefs.current = [];

    // Pronounce audio after a short delay
    setTimeout(() => {
      speakWord(word.en, 0.9);
    }, 200);

    // Focus first empty input
    setTimeout(() => {
      const firstEmptyInput = inputRefs.current.find(input => input && !input.readOnly);
      if (firstEmptyInput) {
        firstEmptyInput.focus();
      }
    }, 150);
  }, [words]);

  useEffect(() => {
    setupWord();
  }, [setupWord]);

  // Handle character input
  const handleInputChange = (index: number, val: string) => {
    if (revealed || feedback === 'correct') return;

    const char = val.slice(-1).toLowerCase();
    const updated = [...tiles];
    updated[index].userChar = char;
    setTiles(updated);

    // Move to next editable input
    if (char) {
      const nextInput = inputRefs.current.slice(index + 1).find(input => input && !input.readOnly);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !tiles[index].userChar) {
      // Find previous editable input
      const prevInputs = inputRefs.current.slice(0, index).filter(input => input && !input.readOnly);
      const prevInput = prevInputs[prevInputs.length - 1];
      if (prevInput) {
        prevInput.focus();
      }
    } else if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  // Check the answer
  const checkAnswer = () => {
    if (revealed || feedback === 'correct') {
      setupWord();
      return;
    }

    const userWord = tiles.map(t => t.userChar).join('').toLowerCase();
    const target = currentWord.en.toLowerCase();

    if (userWord === target) {
      soundEffects.playCorrect();
      setFeedback('correct');
      const bonus = streak >= 2 ? 15 : 10;
      onUpdateScore(score + bonus);
      setStreak(prev => prev + 1);

      // Automatically advance after 1.2s
      setTimeout(() => {
        setupWord();
      }, 1300);
    } else {
      soundEffects.playWrong();
      setFeedback('wrong');
      setStreak(0);
    }
  };

  // Reveal answer
  const handleReveal = () => {
    setRevealed(true);
    soundEffects.playWrong();
    setStreak(0);
    const updated = tiles.map(t => ({
      ...t,
      userChar: t.char
    }));
    setTiles(updated);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {/* Top Score & Streak Banner */}
      <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Điểm tích lũy IOE</div>
            <div className="text-xl font-bold text-slate-800 tabular-nums">{score}</div>
          </div>
        </div>

        {streak > 1 && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold animate-pulse">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Chuỗi x{streak}! (+5 bonus)</span>
          </div>
        )}

        <button
          onClick={() => speakWord(currentWord.en, 0.9)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          <span>Nghe từ</span>
        </button>
      </div>

      {/* Main IOE Challenge Box */}
      <div className={`p-6 sm:p-8 rounded-3xl bg-white border-2 text-center shadow-md transition-all duration-300 ${
        feedback === 'correct'
          ? 'border-emerald-400 bg-emerald-50/20'
          : feedback === 'wrong'
          ? 'border-rose-400 bg-rose-50/20'
          : 'border-rose-200'
      }`}>
        {/* Audio Button */}
        <div className="mb-4">
          <button
            onClick={() => speakWord(currentWord.en, 0.9)}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white shadow-md shadow-rose-200 inline-flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Bấm để nghe phát âm"
          >
            <Volume2 className="w-8 h-8" />
          </button>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Nhấn loa để nghe phát âm chuẩn</div>
        </div>

        {/* Word Meaning Hint */}
        <div className="space-y-1 mb-6">
          <div className="text-xl sm:text-2xl font-bold text-emerald-800">
            "{currentWord.vi}"
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Loại từ: <span className="font-semibold text-rose-600">({currentWord.type})</span> · Phiên âm: {currentWord.pron}
          </div>
        </div>

        {/* Character Tiles Container */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {tiles.map((tile, idx) => {
            if (tile.isSpace) {
              return <div key={idx} className="w-4 sm:w-6" />;
            }
            if (tile.isHyphen) {
              return (
                <div key={idx} className="w-6 sm:w-8 h-12 flex items-center justify-center font-bold text-slate-400 text-lg">
                  -
                </div>
              );
            }

            return (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                maxLength={1}
                value={tile.userChar}
                readOnly={tile.isGiven || revealed || feedback === 'correct'}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-10 sm:w-12 h-12 sm:h-14 rounded-xl text-center text-xl sm:text-2xl font-black uppercase transition-all duration-200 outline-none ${
                  tile.isGiven
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 select-none'
                    : feedback === 'correct'
                    ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500 shadow-sm'
                    : feedback === 'wrong'
                    ? 'bg-rose-50 text-rose-700 border-2 border-rose-400 shadow-sm'
                    : 'bg-white text-rose-600 border-2 border-rose-300 focus:border-rose-500 focus:ring-3 focus:ring-rose-200 shadow-xs'
                }`}
              />
            );
          })}
        </div>

        {/* Feedback Messages */}
        {feedback === 'correct' && (
          <div className="mb-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold animate-bounce">
            <Check className="w-4 h-4" />
            <span>Chính xác tuyệt đối! +{streak >= 2 ? 15 : 10} điểm</span>
          </div>
        )}

        {feedback === 'wrong' && !revealed && (
          <div className="mb-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold animate-shake">
            <span>Chưa chính xác! Hãy kiểm tra lại các chữ cái nhé.</span>
          </div>
        )}

        {revealed && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 max-w-sm mx-auto">
            Đáp án đúng: <strong className="text-base text-rose-600 font-bold block">{currentWord.en}</strong>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-center gap-3">
          {!revealed && feedback !== 'correct' && (
            <button
              onClick={handleReveal}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-slate-500 hover:text-amber-700 hover:bg-amber-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hiện đáp án</span>
            </button>
          )}

          <button
            onClick={checkAnswer}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 transition-all transform hover:scale-102 active:scale-98 cursor-pointer"
          >
            <span>{feedback === 'correct' || revealed ? 'Từ tiếp theo' : 'Kiểm tra'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setupWord()}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Đổi từ khác"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
