import React, { useState, useEffect, useCallback } from 'react';
import { VocabWord } from '../types';
import { soundEffects, speakWord } from '../utils/audio';
import { RotateCcw, Trophy, Clock, Zap, Eye, Sparkles } from 'lucide-react';

interface MemoryCard {
  cardId: string;
  wordId: string;
  text: string;
  type: 'en' | 'vi';
  pron?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameViewProps {
  words: VocabWord[];
  bestMoves: number | null;
  bestTime: number | null;
  onUpdateBestScore: (moves: number, time: number) => void;
}

export const MemoryGameView: React.FC<MemoryGameViewProps> = ({
  words,
  bestMoves,
  bestTime,
  onUpdateBestScore
}) => {
  const [pairCount, setPairCount] = useState<6 | 8>(6);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [firstCard, setFirstCard] = useState<MemoryCard | null>(null);
  const [secondCard, setSecondCard] = useState<MemoryCard | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(2);

  // Initialize deck
  const initGame = useCallback(() => {
    setIsLocked(false);
    setFirstCard(null);
    setSecondCard(null);
    setMoves(0);
    setMatchedPairs(0);
    setTimer(0);
    setHasWon(false);
    setHintsLeft(2);

    // Pick random N words from vocabulary
    const shuffledWords = [...words].sort(() => 0.5 - Math.random()).slice(0, pairCount);

    const deck: MemoryCard[] = [];
    shuffledWords.forEach((word) => {
      // English card
      deck.push({
        cardId: `${word.id}-en`,
        wordId: word.id,
        text: word.en,
        type: 'en',
        pron: word.pron,
        isFlipped: false,
        isMatched: false
      });
      // Vietnamese card
      deck.push({
        cardId: `${word.id}-vi`,
        wordId: word.id,
        text: word.vi,
        type: 'vi',
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle the deck
    const shuffledDeck = deck.sort(() => 0.5 - Math.random());
    setCards(shuffledDeck);
    setIsPlaying(true);
  }, [words, pairCount]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && !hasWon) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, hasWon]);

  // Card click handler
  const handleCardClick = (card: MemoryCard) => {
    if (isLocked || card.isFlipped || card.isMatched) return;

    soundEffects.playFlip();

    // If English card, optionally speak the word
    if (card.type === 'en') {
      speakWord(card.text, 0.95);
    }

    // Flip this card
    const updatedCards = cards.map(c => 
      c.cardId === card.cardId ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    if (!firstCard) {
      setFirstCard(card);
      return;
    }

    // Second card clicked
    setSecondCard(card);
    setMoves(prev => prev + 1);
    setIsLocked(true);

    // Check for match
    if (firstCard.wordId === card.wordId && firstCard.type !== card.type) {
      // It's a match!
      soundEffects.playCorrect();
      setTimeout(() => {
        setCards(prev => prev.map(c => 
          c.wordId === card.wordId ? { ...c, isMatched: true } : c
        ));
        setMatchedPairs(prev => {
          const next = prev + 1;
          if (next === pairCount) {
            // Victory!
            setHasWon(true);
            setIsPlaying(false);
            soundEffects.playWin();
            onUpdateBestScore(moves + 1, timer);
          }
          return next;
        });
        setFirstCard(null);
        setSecondCard(null);
        setIsLocked(false);
      }, 400);
    } else {
      // Not a match
      soundEffects.playWrong();
      setTimeout(() => {
        setCards(prev => prev.map(c => 
          (c.cardId === firstCard.cardId || c.cardId === card.cardId)
            ? { ...c, isFlipped: false }
            : c
        ));
        setFirstCard(null);
        setSecondCard(null);
        setIsLocked(false);
      }, 900);
    }
  };

  // Hint feature: briefly flashes 1 matching pair
  const handleUseHint = () => {
    if (hintsLeft <= 0 || isLocked || hasWon) return;

    const unmatched = cards.filter(c => !c.isMatched);
    if (unmatched.length < 2) return;

    const targetWordId = unmatched[0].wordId;
    setHintsLeft(prev => prev - 1);
    soundEffects.playClick();

    // Temporarily flip the pair
    setCards(prev => prev.map(c => 
      c.wordId === targetWordId ? { ...c, isFlipped: true } : c
    ));

    setTimeout(() => {
      setCards(prev => prev.map(c => 
        (c.wordId === targetWordId && !c.isMatched && c.cardId !== firstCard?.cardId) 
          ? { ...c, isFlipped: false } 
          : c
      ));
    }, 1200);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Top Controls & Status Board */}
      <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Difficulty Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => { setPairCount(6); }}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              pairCount === 6 ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            6 cặp (12 thẻ)
          </button>
          <button
            onClick={() => { setPairCount(8); }}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              pairCount === 8 ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            8 cặp (16 thẻ)
          </button>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1 text-slate-700">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="tabular-nums font-bold">{timer}s</span>
          </div>

          <div className="flex items-center gap-1 text-slate-700">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Lượt: <strong className="tabular-nums text-slate-900">{moves}</strong></span>
          </div>

          <div className="flex items-center gap-1 text-emerald-700">
            <Sparkles className="w-4 h-4" />
            <span>Khớp: <strong className="tabular-nums">{matchedPairs}/{pairCount}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUseHint}
            disabled={hintsLeft <= 0 || hasWon}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              hintsLeft > 0 && !hasWon
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 cursor-pointer'
                : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
            title="Xem trước một cặp từ ngẫu nhiên"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Gợi ý ({hintsLeft})</span>
          </button>

          <button
            onClick={initGame}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Chơi lại</span>
          </button>
        </div>
      </div>

      {/* Memory Grid */}
      <div 
        className={`grid gap-2.5 sm:gap-3 ${
          pairCount === 6 
            ? 'grid-cols-3 sm:grid-cols-4' 
            : 'grid-cols-4 sm:grid-cols-4'
        }`}
      >
        {cards.map((card) => {
          const isSelected = firstCard?.cardId === card.cardId || secondCard?.cardId === card.cardId;
          const showFace = card.isFlipped || card.isMatched;

          return (
            <div
              key={card.cardId}
              onClick={() => handleCardClick(card)}
              className="h-24 sm:h-28 relative cursor-pointer select-none"
              style={{ perspective: '800px' }}
            >
              <div
                className="w-full h-full relative transition-transform duration-500 rounded-xl"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: showFace ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Back (Hidden state with Sakura motif) */}
                <div
                  className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 border-2 border-rose-300 flex items-center justify-center text-white shadow-xs hover:scale-102 hover:shadow-md transition-transform"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-2xl filter drop-shadow-xs">🌸</span>
                </div>

                {/* Front (Revealed word card) */}
                <div
                  className={`absolute inset-0 w-full h-full rounded-xl p-2.5 flex flex-col items-center justify-center text-center border-2 transition-colors ${
                    card.isMatched
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : isSelected
                      ? 'bg-rose-50 border-rose-400 text-rose-900'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  {card.type === 'en' ? (
                    <div className="space-y-0.5">
                      <span className="text-xs sm:text-sm font-bold text-rose-600 block line-clamp-2">
                        {card.text}
                      </span>
                      {card.pron && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {card.pron}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm font-bold text-emerald-700 line-clamp-3">
                      {card.text}
                    </div>
                  )}

                  {card.isMatched && (
                    <div className="absolute top-1 right-1 text-emerald-600 text-[10px]">
                      ✓
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Best Score Highmark */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-2 pt-1">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>
            Kỷ lục tốt nhất:{' '}
            <strong className="text-slate-800 tabular-nums">
              {bestMoves ? `${bestMoves} lượt (${bestTime}s)` : 'Chưa thiết lập'}
            </strong>
          </span>
        </div>
        <span className="text-slate-400">Lật các mảnh ghép để tìm cặp từ Tiếng Anh & Tiếng Việt tương ứng</span>
      </div>

      {/* Victory Modal */}
      {hasWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 text-center shadow-xl border border-rose-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="text-5xl animate-bounce">🎉</div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800">Tuyệt Vời! Bạn Đã Thắng!</h3>
              <p className="text-xs text-slate-500">
                Bạn đã hoàn thành bảng thẻ trong <strong className="text-slate-800 tabular-nums">{moves}</strong> lượt lật và <strong className="text-slate-800 tabular-nums">{timer}</strong> giây.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs font-semibold text-emerald-800 flex justify-around">
              <div>
                <span className="block text-[11px] text-emerald-600">Thời gian</span>
                <span className="text-base font-bold tabular-nums">{timer}s</span>
              </div>
              <div className="border-r border-emerald-200" />
              <div>
                <span className="block text-[11px] text-emerald-600">Số lượt lật</span>
                <span className="text-base font-bold tabular-nums">{moves}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={initGame}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Chơi ván mới ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
