import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VocabWord } from '../types';
import { soundEffects, speakWord } from '../utils/audio';
import { Headphones, Volume2, Check, ArrowRight, RotateCcw, Lightbulb, Award } from 'lucide-react';

interface SpellingBeeViewProps {
  words: VocabWord[];
  score: number;
  onUpdateScore: (newScore: number) => void;
}

export const SpellingBeeView: React.FC<SpellingBeeViewProps> = ({
  words,
  score,
  onUpdateScore
}) => {
  const [currentWord, setCurrentWord] = useState<VocabWord>(words[0]);
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showHintVi, setShowHintVi] = useState(false);
  const [showHintPron, setShowHintPron] = useState(false);
  const [slowAudio, setSlowAudio] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const nextWord = useCallback(() => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setUserInput('');
    setStatus('idle');
    setShowHintVi(false);
    setShowHintPron(false);

    setTimeout(() => {
      speakWord(randomWord.en, 0.9);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 200);
  }, [words]);

  useEffect(() => {
    nextWord();
  }, [nextWord]);

  const handlePlayAudio = (rate: number = 0.9) => {
    speakWord(currentWord.en, rate);
  };

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (status === 'correct') {
      nextWord();
      return;
    }

    const cleanInput = userInput.trim().toLowerCase();
    const target = currentWord.en.trim().toLowerCase();

    if (cleanInput === target) {
      soundEffects.playCorrect();
      setStatus('correct');
      onUpdateScore(score + 10);
      setTimeout(() => {
        nextWord();
      }, 1400);
    } else {
      soundEffects.playWrong();
      setStatus('wrong');
      if (inputRef.current) {
        inputRef.current.select();
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Luyện Nghe & Viết Từ</h3>
            <p className="text-xs text-slate-400">Nghe phát âm và gõ lại chính xác từ vựng</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-teal-700 font-bold text-sm bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
          <Award className="w-4 h-4" />
          <span className="tabular-nums">{score} điểm</span>
        </div>
      </div>

      {/* Main Spelling Card */}
      <div className={`p-6 sm:p-8 rounded-3xl bg-white border-2 text-center shadow-md space-y-6 transition-all duration-300 ${
        status === 'correct' ? 'border-emerald-400 bg-emerald-50/20' : status === 'wrong' ? 'border-rose-400 bg-rose-50/20' : 'border-rose-100'
      }`}>
        {/* Large Speaker Centerpiece */}
        <div className="space-y-2">
          <div className="flex justify-center items-center gap-3">
            <button
              onClick={() => handlePlayAudio(0.9)}
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-200 inline-flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Bấm để nghe phát âm bình thường"
            >
              <Volume2 className="w-10 h-10" />
            </button>
          </div>

          <div className="flex justify-center gap-2 pt-1">
            <button
              onClick={() => handlePlayAudio(0.7)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              🐢 Nghe chậm (0.7x)
            </button>
            <button
              onClick={() => handlePlayAudio(0.95)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              🔊 Nghe lại
            </button>
          </div>
        </div>

        {/* Hints Drawer */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {!showHintPron && (
              <button
                onClick={() => setShowHintPron(true)}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Xem phiên âm</span>
              </button>
            )}

            {!showHintVi && (
              <button
                onClick={() => setShowHintVi(true)}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-200 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Xem nghĩa tiếng Việt</span>
              </button>
            )}
          </div>

          {(showHintPron || showHintVi) && (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1 max-w-sm mx-auto">
              {showHintPron && (
                <div className="text-slate-600">
                  Phiên âm: <span className="font-mono font-bold text-slate-800">{currentWord.pron}</span>
                </div>
              )}
              {showHintVi && (
                <div className="text-emerald-700 font-semibold">
                  Nghĩa: {currentWord.vi} ({currentWord.type})
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleCheck} className="space-y-4 max-w-sm mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              if (status === 'wrong') setStatus('idle');
            }}
            placeholder="Gõ từ bạn nghe được tại đây..."
            autoFocus
            className={`w-full px-4 py-3 rounded-xl border-2 text-center text-lg font-bold outline-none transition-all ${
              status === 'correct'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : status === 'wrong'
                ? 'border-rose-400 bg-rose-50 text-rose-800'
                : 'border-slate-300 focus:border-teal-500 focus:ring-3 focus:ring-teal-100'
            }`}
          />

          {status === 'correct' && (
            <div className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1 animate-bounce">
              <Check className="w-4 h-4" />
              <span>Chính xác tuyệt đối! +10 điểm</span>
            </div>
          )}

          {status === 'wrong' && (
            <div className="space-y-1">
              <div className="text-xs font-bold text-rose-600">
                Chưa đúng rồi! Bạn có muốn nghe lại một lần nữa?
              </div>
              <div className="text-[11px] text-slate-500">
                Đáp án: <strong className="text-rose-700">{currentWord.en}</strong> ({currentWord.vi})
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-100 transition-all cursor-pointer"
            >
              <span>{status === 'correct' ? 'Từ tiếp theo' : 'Kiểm tra'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={nextWord}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Đổi từ khác"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
