import React, { useState, useMemo } from 'react';
import { VocabWord } from '../types';
import { speakWord, soundEffects } from '../utils/audio';
import { Search, Volume2, Star, CheckCircle, ChevronDown, ChevronUp, Copy, Check, Filter } from 'lucide-react';

interface DictionaryViewProps {
  words: VocabWord[];
  masteredIds: string[];
  starredIds: string[];
  onToggleMastered: (id: string) => void;
  onToggleStarred: (id: string) => void;
  onSelectWordForStudy?: (word: VocabWord) => void;
}

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  words,
  masteredIds,
  starredIds,
  onToggleMastered,
  onToggleStarred
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter words
  const filteredWords = useMemo(() => {
    return words.filter(word => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        word.en.toLowerCase().includes(query) || 
        word.vi.toLowerCase().includes(query) ||
        word.pron.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (selectedType === 'starred') {
        return starredIds.includes(word.id);
      }
      if (selectedType === 'mastered') {
        return masteredIds.includes(word.id);
      }
      if (selectedType === 'unmastered') {
        return !masteredIds.includes(word.id);
      }
      if (selectedType === 'n') {
        return word.type.includes('n');
      }
      if (selectedType === 'v') {
        return word.type.includes('v');
      }
      if (selectedType === 'adj') {
        return word.type.includes('adj');
      }

      return true;
    });
  }, [words, searchQuery, selectedType, starredIds, masteredIds]);

  const handleCopyWord = (word: VocabWord, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${word.en} (${word.type}) ${word.pron} - ${word.vi}\nVí dụ: ${word.exampleEn || ''} - ${word.exampleVi || ''}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(word.id);
      soundEffects.playClick();
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const toggleExpand = (id: string) => {
    soundEffects.playClick();
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Search Bar & Stats Header */}
      <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tra cứu từ tiếng Anh, tiếng Việt hoặc phiên âm..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rose-200 focus:border-rose-500 focus:ring-3 focus:ring-rose-100 text-sm outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 p-1"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Lọc:
          </span>
          {[
            { id: 'all', label: `Tất cả (${words.length})` },
            { id: 'n', label: 'Danh từ (n)' },
            { id: 'v', label: 'Động từ (v)' },
            { id: 'adj', label: 'Tính từ (adj)' },
            { id: 'starred', label: `⭐ Đã gắn sao (${starredIds.length})` },
            { id: 'mastered', label: `✅ Đã thuộc (${masteredIds.length})` },
            { id: 'unmastered', label: `⏳ Cần học (${words.length - masteredIds.length})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedType(f.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedType === f.id
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Words Count & List */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-2 font-medium">
        <span>Hiển thị <strong className="text-slate-800 tabular-nums">{filteredWords.length}</strong> từ vựng</span>
        <span className="text-[11px] text-slate-400">Nhấn vào từng dòng để xem ví dụ & phát âm</span>
      </div>

      {filteredWords.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-rose-100 space-y-2">
          <div className="text-3xl">🔍</div>
          <h4 className="font-bold text-slate-700 text-sm">Không tìm thấy từ vựng phù hợp</h4>
          <p className="text-xs text-slate-400">Hãy thử nhập từ khóa tìm kiếm khác hoặc chọn lọc "Tất cả".</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredWords.map((word) => {
            const isExpanded = expandedId === word.id;
            const isMastered = masteredIds.includes(word.id);
            const isStarred = starredIds.includes(word.id);

            return (
              <div
                key={word.id}
                onClick={() => toggleExpand(word.id)}
                className={`bg-white rounded-xl border transition-all cursor-pointer hover:border-rose-300 shadow-2xs overflow-hidden ${
                  isExpanded ? 'border-rose-400 ring-2 ring-rose-100' : 'border-rose-100/70'
                }`}
              >
                <div className="p-3.5 flex items-center justify-between gap-3">
                  {/* Left Word & Pronunciation */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(word.en);
                      }}
                      className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors shrink-0"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-base text-rose-600">
                          {word.en}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {word.pron}
                        </span>
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-sm uppercase">
                          {word.type}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-emerald-800 mt-0.5">
                        {word.vi}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleStarred(word.id)}
                      className="p-1.5 text-slate-300 hover:text-amber-500 rounded-lg hover:bg-slate-50 transition-colors"
                      title={isStarred ? 'Bỏ lưu' : 'Gắn sao yêu thích'}
                    >
                      <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => onToggleMastered(word.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isMastered ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 hover:text-emerald-600'
                      }`}
                      title={isMastered ? 'Đã thuộc' : 'Đánh dấu đã thuộc'}
                    >
                      <CheckCircle className={`w-4 h-4 ${isMastered ? 'fill-emerald-100' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => handleCopyWord(word, e)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Sao chép từ & nghĩa"
                    >
                      {copiedId === word.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => toggleExpand(word.id)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Context Details */}
                {isExpanded && (
                  <div className="px-4 pb-3.5 pt-1 border-t border-rose-50 bg-rose-50/20 text-xs space-y-2">
                    {word.exampleEn && (
                      <div className="p-3 bg-white rounded-lg border border-rose-100 space-y-1">
                        <div className="font-medium text-slate-700">
                          💡 <strong>Ví dụ:</strong> "{word.exampleEn}"
                        </div>
                        <div className="text-slate-500 italic">
                          ➔ {word.exampleVi}
                        </div>
                      </div>
                    )}
                    {word.category && (
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Chủ đề: <strong>{word.category}</strong></span>
                        <button
                          onClick={() => speakWord(word.en)}
                          className="text-rose-600 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Phát âm từ này
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
