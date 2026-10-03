export interface VocabWord {
  id: string;
  en: string;
  type: string; // 'n' | 'v' | 'adj' | 'adv' | 'n/v' | 'phr v'
  pron: string;
  vi: string;
  exampleEn?: string;
  exampleVi?: string;
  category?: string;
}

export type ActiveTab = 'flashcard' | 'memory' | 'ioe' | 'quiz' | 'spelling' | 'dict';

export interface UserStats {
  masteredIds: string[];
  starredIds: string[];
  ioeScore: number;
  quizHighScores: {
    enToVi: number;
    viToEn: number;
  };
  memoryBestMoves: number | null;
  memoryBestTime: number | null;
  spellingScore: number;
  currentStreakDays: number;
  lastActiveDate: string;
  totalAnswered: number;
  correctAnswered: number;
}
