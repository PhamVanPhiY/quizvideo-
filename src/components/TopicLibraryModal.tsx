import React, { useState } from 'react';
import { TOPIC_PRESETS } from '../services/topicLibrary';
import type { TopicPreset } from '../services/topicLibrary';
import type { QuizItem } from '../types/quiz';
import { BookOpen, Sparkles, Crown, Check, X, ArrowRight, Lock } from 'lucide-react';

interface TopicLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isVip: boolean;
  onApplyTopic: (questions: QuizItem[]) => void;
  onOpenUpgrade: () => void;
}

export const TopicLibraryModal: React.FC<TopicLibraryModalProps> = ({
  isOpen,
  onClose,
  isVip,
  onApplyTopic,
  onOpenUpgrade,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(TOPIC_PRESETS[0].id);

  if (!isOpen) return null;

  const selectedTopic = TOPIC_PRESETS.find(t => t.id === selectedTopicId) || TOPIC_PRESETS[0];
  const isSelectedTopicVipLocked = selectedTopic.isVipOnly && !isVip;

  const handleApply = (topic: TopicPreset) => {
    if (topic.isVipOnly && !isVip) {
      onOpenUpgrade();
      return;
    }
    onApplyTopic(topic.questions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">
                  Kho Từ Vựng Mẫu Chuẩn (1-Click Topic Library)
                </h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  Sẵn sàng 100%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Chọn bộ từ vựng theo chủ đề để tạo hàng chục video ngay lập tức mà không cần tự soạn JSON!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topics Grid Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TOPIC_PRESETS.map((topic) => {
            const isSelected = topic.id === selectedTopicId;
            const isLocked = topic.isVipOnly && !isVip;

            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedTopicId(topic.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-800/90 border-sky-400 ring-2 ring-sky-400/50 shadow-lg shadow-sky-500/15'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      topic.isVipOnly
                        ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                        : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                    }`}>
                      {topic.badge}
                    </span>

                    {isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    ) : isSelected ? (
                      <div className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : null}
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 leading-snug line-clamp-2">
                    {topic.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                <div className="text-[10px] text-sky-400 font-semibold pt-3 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{topic.questionCount} câu hỏi chuẩn</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Topic Question Preview */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <span>Xem trước câu hỏi trong chủ đề:</span>
              <span className="text-sky-400">{selectedTopic.title}</span>
            </div>

            {isSelectedTopicVipLocked && (
              <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-current" /> Yêu cầu VIP Pro
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto scrollbar-thin pr-1">
            {selectedTopic.questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-slate-500 font-bold text-[11px]">#{idx + 1}</span>
                  <span className="font-bold text-slate-200">{q.word}</span>
                  <span className="text-slate-400 text-[11px] truncate">- {q.explanation}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                  {q.correctAnswer}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Đóng
          </button>

          {isSelectedTopicVipLocked ? (
            <button
              type="button"
              onClick={onOpenUpgrade}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
            >
              <Crown className="w-4 h-4 fill-current" />
              <span>Nâng Cấp VIP Để Mở Khóa Chủ Đề Này</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleApply(selectedTopic)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all"
            >
              <span>Nạp Chủ Đề Này Vào Video (1-Click)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
