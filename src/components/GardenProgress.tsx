import React from 'react';
import { UserStats } from '../types';
import { X, Award, Flame, Star, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

interface GardenProgressProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  totalWords: number;
  onResetProgress: () => void;
}

export const GardenProgress: React.FC<GardenProgressProps> = ({
  isOpen,
  onClose,
  stats,
  totalWords,
  onResetProgress
}) => {
  if (!isOpen) return null;

  const masteredCount = stats.masteredIds.length;
  const percentage = Math.round((masteredCount / totalWords) * 100);

  // Garden level computation
  let stageTitle = 'Hạt Giống Mới Ươm';
  let stageEmoji = '🌱';
  let stageDesc = 'Khu vườn đang bắt đầu hình thành. Hãy lật thẻ và làm bài tập để tưới tắm cho các mầm cây!';
  let stageColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (percentage >= 100) {
    stageTitle = 'Thiên Đường Sinh Thái Rực Rỡ';
    stageEmoji = '🌸🌳🌺';
    stageDesc = 'Tuyệt vời! Bạn đã chinh phục trọn vẹn toàn bộ 88 từ vựng Unit 2 Eco-Friendly Lifestyle!';
    stageColor = 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (percentage >= 75) {
    stageTitle = 'Vườn Hoa Nở Rộ';
    stageEmoji = '🌸🌻🌿';
    stageDesc = 'Hương hoa ngát thơm! Phần lớn từ vựng đã được bạn ghi nhớ vững chắc.';
    stageColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (percentage >= 50) {
    stageTitle = 'Búp Non Hé Nở';
    stageEmoji = '🌷🌿';
    stageDesc = 'Những nụ hoa đầu tiên đang hé nở rạng rỡ. Bạn đã đi được nửa chặng đường!';
    stageColor = 'text-teal-700 bg-teal-50 border-teal-200';
  } else if (percentage >= 25) {
    stageTitle = 'Cây Con Bén Rễ';
    stageEmoji = '🌿🌱';
    stageDesc = 'Rễ cây đã bám sâu vào lòng đất kiến thức. Tiếp tục giữ vững phong độ nhé!';
    stageColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-50 via-pink-50 to-emerald-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{stageEmoji}</span>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Khu Vườn Sinh Thái Của Bạn</h3>
              <p className="text-xs text-slate-500">Tiến độ học tập từ vựng Unit 2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Garden Stage Card */}
          <div className={`p-4 rounded-xl border ${stageColor} text-center space-y-1`}>
            <div className="text-3xl animate-bounce duration-1000">{stageEmoji}</div>
            <h4 className="font-bold text-base">{stageTitle}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{stageDesc}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
              <span>Độ phủ xanh khu vườn</span>
              <span className="tabular-nums font-bold text-emerald-700">{percentage}% ({masteredCount}/{totalWords} từ)</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
              <div className="flex items-center justify-center text-emerald-600 mb-1">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-lg font-bold text-slate-800 tabular-nums">{masteredCount}</div>
              <div className="text-[11px] font-medium text-slate-500">Đã thuộc</div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
              <div className="flex items-center justify-center text-amber-500 mb-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-lg font-bold text-slate-800 tabular-nums">{stats.starredIds.length}</div>
              <div className="text-[11px] font-medium text-slate-500">Đã gắn sao</div>
            </div>

            <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl">
              <div className="flex items-center justify-center text-purple-600 mb-1">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-lg font-bold text-slate-800 tabular-nums">{stats.ioeScore}</div>
              <div className="text-[11px] font-medium text-slate-500">Điểm IOE</div>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl">
              <div className="flex items-center justify-center text-rose-500 mb-1">
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-lg font-bold text-slate-800 tabular-nums">{stats.currentStreakDays} ngày</div>
              <div className="text-[11px] font-medium text-slate-500">Chuỗi ngày</div>
            </div>
          </div>

          {/* Additional Game Highlights */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between items-center">
              <span>🏆 Điểm Trắc Nghiệm cao nhất:</span>
              <span className="font-bold text-slate-800 tabular-nums">{Math.max(stats.quizHighScores.enToVi, stats.quizHighScores.viToEn)} điểm</span>
            </div>
            <div className="flex justify-between items-center">
              <span>🃏 Kỷ lục Lật Hình (Memory):</span>
              <span className="font-bold text-slate-800 tabular-nums">
                {stats.memoryBestMoves ? `${stats.memoryBestMoves} lượt (${stats.memoryBestTime}s)` : 'Chưa có'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học từ đầu không?')) {
                onResetProgress();
              }
            }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại tiến độ</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Đóng & Tiếp tục học
          </button>
        </div>
      </div>
    </div>
  );
};
