import React, { useState, useEffect, useCallback } from 'react';
import { VocabWord } from '../types';
import { soundEffects, speakWord } from '../utils/audio';
import { HelpCircle, Check, X, ArrowRight, RotateCcw, Volume2, Trophy, Award } from 'lucide-react';

interface QuizViewProps {
  words: VocabWord[];
  highScores: { enToVi: number; viToEn: number };
  onUpdateHighScore: (mode: 'enToVi' | 'viToEn', score: number) => void;
}

type QuizDirection = 'enToVi' | 'viToEn';

interface Question {
  target: VocabWord;
  options: VocabWord[];
  selectedId: string | null;
  isCorrect: boolean | null;
}

const QUESTIONS_PER_ROUND = 10;

export const QuizView: React.FC<QuizViewProps> = ({
  words,
  highScores,
  onUpdateHighScore
}) => {
  const [direction, setDirection] = useState<QuizDirection>('enToVi');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [streak, setStreak] = useState(0);

  // Generate 10 randomized questions
  const startQuiz = useCallback((dir: QuizDirection = direction) => {
    const shuffledPool = [...words].sort(() => 0.5 - Math.random());
    const selectedTargets = shuffledPool.slice(0, QUESTIONS_PER_ROUND);

    const generated: Question[] = selectedTargets.map(target => {
      // 3 wrong distractors
      const distractors = words
        .filter(w => w.id !== target.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const allOptions = [...distractors, target].sort(() => 0.5 - Math.random());
      return {
        target,
        options: allOptions,
        selectedId: null,
        isCorrect: null
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setIsCompleted(false);
  }, [words, direction]);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (chosenWord: VocabWord) => {
    if (!currentQ || currentQ.selectedId !== null) return; // Prevent double clicks

    const isMatch = chosenWord.id === currentQ.target.id;
    const nextQuestions = [...questions];
    nextQuestions[currentIndex] = {
      ...currentQ,
      selectedId: chosenWord.id,
      isCorrect: isMatch
    };
    setQuestions(nextQuestions);

    if (isMatch) {
      soundEffects.playCorrect();
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
    } else {
      soundEffects.playWrong();
      setStreak(0);
    }
  };

  const handleNext = () => {
    soundEffects.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finished all 10 questions!
      setIsCompleted(true);
      soundEffects.playWin();
      const finalScore = score + (currentQ?.isCorrect ? 10 : 0);
      onUpdateHighScore(direction, finalScore);
    }
  };

  const handleDirectionChange = (newDir: QuizDirection) => {
    setDirection(newDir);
    startQuiz(newDir);
  };

  if (!currentQ && !isCompleted) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Quiz Top Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Direction Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => handleDirectionChange('enToVi')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              direction === 'enToVi'
                ? 'bg-white text-rose-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Anh ➔ Việt
          </button>
          <button
            onClick={() => handleDirectionChange('viToEn')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              direction === 'viToEn'
                ? 'bg-white text-rose-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Việt ➔ Anh
          </button>
        </div>

        {/* Live Score Counter */}
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1 text-slate-700">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Kỷ lục: <strong className="tabular-nums">{highScores[direction]}</strong></span>
          </div>

          <div className="flex items-center gap-1 text-rose-600">
            <Award className="w-4 h-4" />
            <span>Điểm hiện tại: <strong className="tabular-nums">{score}</strong></span>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={() => startQuiz()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ván mới</span>
        </button>
      </div>

      {!isCompleted ? (
        <div className="bg-white rounded-3xl border-2 border-rose-100 p-6 sm:p-8 shadow-md space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>
              Câu hỏi <strong className="text-slate-900 tabular-nums">{currentIndex + 1}</strong> / {QUESTIONS_PER_ROUND}
            </span>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / QUESTIONS_PER_ROUND) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Box */}
          <div className="text-center py-4 space-y-2">
            <div className="text-xs uppercase tracking-wider font-bold text-rose-500">
              {direction === 'enToVi' ? 'Chọn nghĩa Tiếng Việt tương ứng' : 'Chọn từ Tiếng Anh tương ứng'}
            </div>

            {direction === 'enToVi' ? (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                    {currentQ.target.en}
                  </h3>
                  <button
                    onClick={() => speakWord(currentQ.target.en, 0.95)}
                    className="p-2 rounded-full hover:bg-rose-50 text-rose-600 transition-colors"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  ({currentQ.target.type}) {currentQ.target.pron}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
                  "{currentQ.target.vi}"
                </h3>
                <p className="text-xs text-slate-400">
                  Loại từ: ({currentQ.target.type})
                </p>
              </div>
            )}
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((option) => {
              const isSelected = currentQ.selectedId === option.id;
              const isTarget = option.id === currentQ.target.id;
              const isAnswered = currentQ.selectedId !== null;

              let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50/50';

              if (isAnswered) {
                if (isTarget) {
                  btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-200';
                } else if (isSelected && !isTarget) {
                  btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
                } else {
                  btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 text-sm font-semibold flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <div>
                    {direction === 'enToVi' ? (
                      <span>{option.vi}</span>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="font-bold text-base">{option.en}</span>
                        <span className="text-xs text-slate-400 block font-mono">{option.pron}</span>
                      </div>
                    )}
                  </div>

                  {isAnswered && isTarget && (
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isTarget && (
                    <X className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Button / Explanation when answered */}
          {currentQ.selectedId !== null && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <div className="text-xs text-slate-600 text-center sm:text-left">
                {currentQ.isCorrect ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Chính xác! Tuyệt vời lắm.
                  </span>
                ) : (
                  <span className="text-rose-600 font-medium">
                    Đáp án đúng: <strong>{direction === 'enToVi' ? currentQ.target.vi : currentQ.target.en}</strong>
                  </span>
                )}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <span>{currentIndex + 1 === QUESTIONS_PER_ROUND ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Final Score Card */
        <div className="bg-white rounded-3xl border border-rose-100 p-8 text-center space-y-6 shadow-md">
          <div className="text-5xl animate-bounce">
            {score >= 80 ? '🌟' : score >= 50 ? '🌸' : '🌱'}
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-800">
              {score >= 90 ? 'Xuất Sắc! Bạn Là Cao Thủ Từ Vựng!' : score >= 60 ? 'Làm Tốt Lắm! Tiến Bộ Vượt Bậc!' : 'Cố Lên! Luyện Tập Thêm Nhé!'}
            </h3>
            <p className="text-xs text-slate-500">
              Bạn đã hoàn thành 10 câu trắc nghiệm Unit 2: Eco-Friendly Lifestyle.
            </p>
          </div>

          <div className="p-4 bg-gradient-to-r from-rose-50 via-pink-50 to-emerald-50 rounded-2xl border border-rose-200/80 inline-block px-8">
            <div className="text-3xl font-extrabold text-rose-600 tabular-nums">
              {score} / 100
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Đúng {score / 10} / 10 câu hỏi
            </div>
          </div>

          {/* Quick Review of Missed Questions */}
          {questions.some(q => !q.isCorrect) && (
            <div className="text-left space-y-2 max-w-md mx-auto">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Xem lại các từ cần lưu ý:
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {questions.filter(q => !q.isCorrect).map((q, idx) => (
                  <div key={idx} className="p-2.5 bg-rose-50/60 border border-rose-100 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <strong className="text-rose-700 font-bold">{q.target.en}</strong>
                      <span className="text-slate-400 font-mono text-[11px] ml-1">{q.target.pron}</span>
                    </div>
                    <div className="text-emerald-700 font-semibold">{q.target.vi}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => startQuiz()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm bài kiểm tra mới</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
