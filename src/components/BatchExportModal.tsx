import React, { useState } from 'react';
import type { QuizItem } from '../types/quiz';
import { VideoRenderer } from '../services/videoRenderer';
import { audioEngine } from '../services/audioEngine';
import { Download, Film, X, Loader2 } from 'lucide-react';

import { licenseManager } from '../services/licenseManager';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizList: QuizItem[];
  themeId: string;
  isVip: boolean;
  onOpenUpgrade: () => void;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  onClose,
  quizList,
  themeId,
  isVip,
  onOpenUpgrade,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    () => new Set(quizList.map(q => q.id))
  );
  const [isExporting, setIsExporting] = useState(false);
  const [currentExportIndex, setCurrentExportIndex] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedIds.size === quizList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(quizList.map(q => q.id)));
    }
  };

  const toggleSelectOne = (id: string | number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleStartBatchExport = async () => {
    const toExport = quizList.filter(q => selectedIds.has(q.id));
    if (toExport.length === 0) return;

    // Check quota if not VIP
    if (!isVip) {
      const quota = licenseManager.canExport(toExport.length);
      if (!quota.allowed) {
        onClose();
        onOpenUpgrade();
        return;
      }
    }

    setIsExporting(true);
    setCompletedCount(0);

    // Create off-screen canvas for rendering
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 1080;
    offscreenCanvas.height = 1920;
    const renderer = new VideoRenderer(offscreenCanvas, themeId);

    const audioStream = audioEngine.getAudioStream();

    for (let i = 0; i < toExport.length; i++) {
      const item = toExport[i];
      setCurrentExportIndex(i + 1);
      setCurrentProgress(0);

      try {
        const audioCtx = audioEngine.getAudioContext();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        // Preload voice AudioBuffers first
        const { wordBuffer, exampleBuffer } = await audioEngine.preloadQuizAudio(item);

        const startTime = audioCtx.currentTime + 0.05;
        audioEngine.scheduleQuizAudioDirect(item, startTime, wordBuffer, exampleBuffer);

        const videoBlob = await renderer.exportVideo(
          item,
          audioStream,
          (progress) => {
            setCurrentProgress(progress);
          },
          isVip
        );

        // Trigger download
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = url;
        const cleanWord = (item.word || 'quiz').replace(/[^a-zA-Z0-9]/g, '_');
        a.download = `Shorts_Quiz_${String(i + 1).padStart(2, '0')}_${cleanWord}.webm`;
        a.click();
        URL.revokeObjectURL(url);

        licenseManager.recordExport(1);
        setCompletedCount(prev => prev + 1);
      } catch (err) {
        console.error('Lỗi khi xuất video:', err);
      }
    }

    setIsExporting(false);
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Xuất Video Hàng Loạt (Batch Export)
              </h3>
              <p className="text-xs text-slate-400">
                Tự động render và tải về từng video Full HD chuẩn 9:16
              </p>
            </div>
          </div>
          {!isExporting && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress state when rendering */}
        {isExporting ? (
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-100">
                Đang Render Video {currentExportIndex} / {selectedCount}...
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Vui lòng giữ cửa sổ trình duyệt trong quá trình xuất video
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Tiến độ câu hiện tại:</span>
                <span className="font-mono text-sky-400 font-bold">{currentProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-150"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </div>

            <div className="text-xs text-emerald-400 font-medium">
              ✓ Đã hoàn thành: {completedCount} / {selectedCount} video
            </div>
          </div>
        ) : (
          <>
            {/* List Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Chọn các câu cần xuất:</span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-sky-400 hover:text-sky-300 font-semibold"
                >
                  {selectedCount === quizList.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {quizList.map((q, idx) => {
                  const isChecked = selectedIds.has(q.id);
                  return (
                    <label
                      key={q.id || idx}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-sky-950/40 border-sky-500/60 text-slate-100'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(q.id)}
                          className="w-4 h-4 rounded text-sky-500 bg-slate-800 border-slate-700 focus:ring-sky-500 cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-200">
                          {q.word}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          - {q.explanation}
                        </span>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {q.countdownSeconds}s + {q.revealDurationSeconds || 4}s
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Total info */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
              <span>Số lượng video sẽ xuất:</span>
              <span className="font-bold text-sky-400 text-sm">
                {selectedCount} Video Full HD 9:16
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                onClick={handleStartBatchExport}
                disabled={selectedCount === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                <span>Bắt Đầu Xuất {selectedCount} Video</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
