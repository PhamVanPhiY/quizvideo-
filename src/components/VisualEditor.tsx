import React, { useState } from 'react';
import type { QuizItem } from '../types/quiz';
import { Plus, Trash2, Copy, Sparkles, CheckCircle2, Clock, BookOpen, Layers, Volume2, Mic, Eye, Loader2 } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface VisualEditorProps {
  quizList: QuizItem[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  onUpdateQuiz: (updated: QuizItem) => void;
  onUpdateAllBranding?: (branding: Partial<QuizItem>) => void;
  onAddQuiz: () => void;
  onDuplicateQuiz: (index: number) => void;
  onDeleteQuiz: (index: number) => void;
}

const BRANDING_KEYS = [
  'channelName',
  'channelLogo',
  'logoPosition',
  'logoShape',
  'logoSize',
  'logoOpacity',
  'showLogoText',
] as const;

export const VisualEditor: React.FC<VisualEditorProps> = ({
  quizList,
  currentIndex,
  onSelectIndex,
  onUpdateQuiz,
  onUpdateAllBranding,
  onAddQuiz,
  onDuplicateQuiz,
  onDeleteQuiz,
}) => {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isPlayingExampleVoice, setIsPlayingExampleVoice] = useState(false);
  const current = quizList[currentIndex] || quizList[0];
  if (!current) return null;

  const handleFieldChange = <K extends keyof QuizItem>(key: K, value: QuizItem[K]) => {
    if (BRANDING_KEYS.includes(key as any)) {
      if (onUpdateAllBranding) {
        onUpdateAllBranding({ [key]: value });
      } else {
        onUpdateQuiz({
          ...current,
          [key]: value,
        });
      }
    } else {
      onUpdateQuiz({
        ...current,
        [key]: value,
      });
    }
  };

  const handleOptionChange = (optIndex: number, text: string) => {
    const updatedOptions = [...current.options];
    updatedOptions[optIndex] = {
      ...updatedOptions[optIndex],
      text,
    };
    handleFieldChange('options', updatedOptions);
  };

  return (
    <div className="space-y-5">
      {/* Quiz Item Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Danh Sách Câu Hỏi ({quizList.length} câu)</span>
          </div>
          <button
            onClick={onAddQuiz}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Câu Mới</span>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {quizList.map((q, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={q.id || idx}
                onClick={() => onSelectIndex(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-medium shrink-0 flex items-center gap-2 border transition-all ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-md shadow-sky-500/20'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span>#{idx + 1}</span>
                <span className="truncate max-w-[90px]">{q.word || 'Câu hỏi'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Editing Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 space-y-5 shadow-xl">
        {/* Header toolbar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-mono font-bold text-xs">
              #{currentIndex + 1}
            </span>
            <span className="text-sm font-bold text-slate-200">
              Chỉnh Sửa Nội Dung Video
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onDuplicateQuiz(currentIndex)}
              title="Nhân bản câu này"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            {quizList.length > 1 && (
              <button
                onClick={() => onDeleteQuiz(currentIndex)}
                title="Xóa câu này"
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Channel Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Tên Kênh / Tiêu Đề Đầu:
            </label>
            <input
              type="text"
              value={current.channelName || ''}
              onChange={(e) => handleFieldChange('channelName', e.target.value)}
              placeholder="VD: BIN HỌC TIẾNG ANH"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Danh Mục / Chủ Đề:
            </label>
            <input
              type="text"
              value={current.category || ''}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              placeholder="VD: TỪ VỰNG DỄ NHẦM LẪN"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Channel Logo / Avatar Customization */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-sky-500/30 space-y-3.5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <span>🖼️ Logo / Avatar Bản Quyền Kênh (Góc Trên Trái):</span>
              </label>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Tự động áp dụng cho tất cả {quizList.length} câu
              </span>
            </div>

            {current.channelLogo && (
              <button
                type="button"
                onClick={() => {
                  if (onUpdateAllBranding) {
                    onUpdateAllBranding({ channelLogo: undefined });
                  } else {
                    handleFieldChange('channelLogo', undefined);
                  }
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
              >
                Xóa Logo
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
            {/* Logo Preview & Upload */}
            <div className="sm:col-span-5 flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-dashed border-sky-500/50 flex items-center justify-center overflow-hidden shrink-0 relative group shadow-md">
                {current.channelLogo ? (
                  <img
                    src={current.channelLogo}
                    alt="Logo Kênh"
                    className={`w-full h-full object-cover ${
                      current.logoShape === 'rounded'
                        ? 'rounded-xl'
                        : current.logoShape === 'square'
                        ? ''
                        : 'rounded-full'
                    }`}
                  />
                ) : (
                  <span className="text-[10px] text-slate-500 text-center font-bold px-1">
                    Chưa có Logo
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-md shadow-sky-500/20 transition-all">
                  <span>Tải Ảnh Lên</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            const logoData = event.target.result as string;
                            if (onUpdateAllBranding) {
                              onUpdateAllBranding({
                                channelLogo: logoData,
                                logoSize: current.logoSize || 115,
                                logoPosition: current.logoPosition || 'top-left',
                                logoShape: current.logoShape || 'circle',
                                showLogoText: current.showLogoText !== false,
                              });
                            } else {
                              handleFieldChange('channelLogo', logoData);
                              if (!current.logoSize) handleFieldChange('logoSize', 115);
                              if (!current.logoPosition) handleFieldChange('logoPosition', 'top-left');
                            }
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                <p className="text-[10px] text-slate-400">PNG trong suốt, JPG, WebP</p>
              </div>
            </div>

            {/* Position & Shape & Size Controls */}
            <div className="sm:col-span-7 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Vị trí Logo:</label>
                  <select
                    value={current.logoPosition || 'top-left'}
                    onChange={(e) => handleFieldChange('logoPosition', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                  >
                    <option value="top-left">Góc trái trên (Đánh dấu bản quyền)</option>
                    <option value="top-center">Giữa trên cùng</option>
                    <option value="top-right">Góc phải trên</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Kiểu dáng:</label>
                  <select
                    value={current.logoShape || 'circle'}
                    onChange={(e) => handleFieldChange('logoShape', e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                  >
                    <option value="circle">Tròn (Circle)</option>
                    <option value="rounded">Bo góc (Rounded)</option>
                    <option value="square">Vuông (Square)</option>
                    <option value="original">Trong suốt (Original)</option>
                  </select>
                </div>
              </div>

              {/* Avatar Size Slider & Text Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Kích thước Avatar:</span>
                    <span className="font-bold text-sky-400">{current.logoSize || 115}px</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="160"
                    step="5"
                    value={current.logoSize || 115}
                    onChange={(e) => handleFieldChange('logoSize', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={current.showLogoText !== false}
                      onChange={(e) => handleFieldChange('showLogoText', e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-800 border-slate-700 focus:ring-sky-500 cursor-pointer"
                    />
                    <span>Kèm Tên Kênh (Huy hiệu)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Word, IPA & Question */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-xs font-semibold text-sky-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Từ Vựng Trắc Nghiệm (Word):
            </label>
            <input
              type="text"
              value={current.word}
              onChange={(e) => handleFieldChange('word', e.target.value)}
              placeholder="VD: GOODS"
              className="w-full bg-slate-950 border border-sky-500/50 rounded-xl px-3 py-2 text-sm font-bold text-sky-200 focus:outline-none focus:border-sky-400"
            />
          </div>
          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Phiên Âm (IPA):
            </label>
            <input
              type="text"
              value={current.ipa || ''}
              onChange={(e) => handleFieldChange('ipa', e.target.value)}
              placeholder="/ɡʊdz/"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Câu Hỏi (Question Prompt):
            </label>
            <input
              type="text"
              value={current.question}
              onChange={(e) => handleFieldChange('question', e.target.value)}
              placeholder="nghĩa là gì?"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* 4 Options & Correct Answer Radio */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>4 Lựa Chọn (Tích tròn chọn đáp án đúng):</span>
            </label>
            <span className="text-[11px] text-emerald-400 font-medium">
              Đáp án đúng hiện tại: <span className="font-bold">{current.correctAnswer}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {current.options.map((opt, idx) => {
              const isSelected = opt.key.toUpperCase() === current.correctAnswer.toUpperCase();
              return (
                <div
                  key={opt.key}
                  className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/50'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <label className="cursor-pointer flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 shrink-0">
                    <input
                      type="radio"
                      name={`correct-${current.id}`}
                      checked={isSelected}
                      onChange={() => handleFieldChange('correctAnswer', opt.key)}
                      className="sr-only"
                    />
                    <span className={isSelected ? 'text-emerald-400 font-extrabold' : ''}>
                      {opt.key}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Đáp án ${opt.key}`}
                    className="w-full bg-transparent border-none text-xs text-slate-100 focus:outline-none"
                  />
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Countdown & Timing Slider */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> Thời gian đếm ngược:
              </span>
              <span className="font-bold text-sky-400">{current.countdownSeconds} giây</span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              step="1"
              value={current.countdownSeconds}
              onChange={(e) => handleFieldChange('countdownSeconds', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Thời gian xem kết quả (tối thiểu):
              </span>
              <span className="font-bold text-emerald-400">{current.revealDurationSeconds || 4} giây</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={current.revealDurationSeconds || 4}
              onChange={(e) => handleFieldChange('revealDurationSeconds', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="text-[10px] text-slate-400 text-right">
              (Tự động mở rộng nếu câu ví dụ dài hơn, không lo bị cắt tiếng)
            </div>
          </div>
        </div>

        {/* Post-Reveal Note, Explanation & Example */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Phần Giải Thích Sau 5s (Note & Ví Dụ)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Ghi Chú Nổi Bật (Note / Phân Biệt):
              </label>
              <input
                type="text"
                value={current.note || ''}
                onChange={(e) => handleFieldChange('note', e.target.value)}
                placeholder="VD: Good ≠ Goods"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-serif italic text-amber-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Nghĩa Đầy Đủ (Explanation):
              </label>
              <input
                type="text"
                value={current.explanation || ''}
                onChange={(e) => handleFieldChange('explanation', e.target.value)}
                placeholder="VD: Goods = Hàng hóa (Danh từ)"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Câu Ví Dụ Tiếng Anh (Example):</span>
                </label>

                <button
                  type="button"
                  disabled={isPlayingExampleVoice}
                  onClick={async () => {
                    const text = (current.example || current.explanation || '').trim();
                    if (!text) return;
                    setIsPlayingExampleVoice(true);
                    try {
                      const buf = await audioEngine.getVoiceAudioBuffer(text, 'en');
                      if (buf) {
                        audioEngine.playAudioBuffer(buf);
                        setTimeout(() => setIsPlayingExampleVoice(false), Math.max(1500, buf.duration * 1000));
                      } else {
                        await audioEngine.speak(text, { lang: 'en-US' });
                        setIsPlayingExampleVoice(false);
                      }
                    } catch {
                      setIsPlayingExampleVoice(false);
                    }
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-[10px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                  title="Nghe thử giọng đọc câu ví dụ tiếng Anh"
                >
                  {isPlayingExampleVoice ? (
                    <>
                      <Loader2 className="w-2.5 h-2.5 animate-spin text-sky-300" />
                      <span>Đang đọc...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-2.5 h-2.5 text-sky-400" />
                      <span>Nghe thử Voice</span>
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={current.example || ''}
                onChange={(e) => handleFieldChange('example', e.target.value)}
                placeholder="VD: The company produces electronic goods."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Dịch Nghĩa Tiếng Việt (Example Meaning):
              </label>
              <input
                type="text"
                value={current.exampleMeaning || ''}
                onChange={(e) => handleFieldChange('exampleMeaning', e.target.value)}
                placeholder="VD: Công ty sản xuất các mặt hàng điện tử."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Interactive Audience Question Section (Call to Action / Viral Engagement) */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>💬 Câu Hỏi Tương Tác Khán Giả (Tăng Bình Luận / Viral Video)</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
              <input
                type="checkbox"
                checked={current.enableInteractive !== false && (!!current.interactiveQuestion || !!current.interactiveVoiceText || current.enableInteractive === true)}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  const word = current.word || 'từ này';
                  onUpdateQuiz({
                    ...current,
                    enableInteractive: enabled,
                    interactiveQuestion: enabled ? (current.interactiveQuestion || `Vậy "${word}" tiếng Anh là gì?`) : current.interactiveQuestion,
                    interactiveVoiceText: enabled ? (current.interactiveVoiceText || `Vậy câu "${word}" tiếng Anh là gì? Bạn hãy bình luận đáp án bên dưới nhé!`) : current.interactiveVoiceText,
                    interactivePrompt: current.interactivePrompt || 'Bình luận đáp án của bạn bên dưới nhé! 👇',
                    interactiveDurationSeconds: current.interactiveDurationSeconds || 4,
                  });
                }}
                className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-amber-400 font-bold">Bật hỏi khán giả</span>
            </label>
          </div>

          {(current.enableInteractive !== false && (!!current.interactiveQuestion || !!current.interactiveVoiceText || current.enableInteractive === true)) && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-4 shadow-lg">
              {/* Quick Template Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-amber-200/90">
                  <span className="font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Mẫu câu hỏi tương tác nhanh (Tự điền cả Text + Voice):
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const wordName = current.word || 'từ này';
                      onUpdateQuiz({
                        ...current,
                        interactiveQuestion: `Vậy "${wordName}" tiếng Anh là gì?`,
                        interactiveVoiceText: `Vậy câu "${wordName}" tiếng Anh là gì? Hãy bình luận đáp án của bạn bên dưới nhé!`,
                        interactivePrompt: current.interactivePrompt || 'Bình luận đáp án của bạn bên dưới nhé! 👇',
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    🎯 Dịch câu sang TA
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const wordName = current.word || 'từ này';
                      onUpdateQuiz({
                        ...current,
                        interactiveQuestion: `Từ đồng nghĩa của "${wordName}" là gì?`,
                        interactiveVoiceText: `Bạn còn biết từ đồng nghĩa nào khác của từ "${wordName}" không? Hãy chia sẻ ở phần bình luận nhé!`,
                        interactivePrompt: current.interactivePrompt || 'Chia sẻ câu trả lời của bạn nào! 💬',
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    💡 Tìm từ đồng nghĩa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const wordName = current.word || 'từ này';
                      onUpdateQuiz({
                        ...current,
                        interactiveQuestion: `Hãy đặt 1 câu với từ "${wordName}"`,
                        interactiveVoiceText: `Bạn hãy thử đặt một câu tiếng Anh hoàn chỉnh với từ "${wordName}" nhé!`,
                        interactivePrompt: current.interactivePrompt || 'Thử tài comment câu của bạn bên dưới! ✍️',
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    ✍️ Đặt câu ví dụ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateQuiz({
                        ...current,
                        interactiveQuestion: `Điền vào chỗ trống: "She bought some fresh ___"`,
                        interactiveVoiceText: `Hãy điền từ thích hợp vào chỗ trống và comment đáp án đúng của bạn nào!`,
                        interactivePrompt: current.interactivePrompt || 'Comment đáp án đúng của bạn nào! 🎯',
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    ❓ Điền vào chỗ trống
                  </button>
                </div>
              </div>

              {/* 1. Text to display on screen */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <label className="text-xs font-bold text-sky-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span>1. Text hiển thị trên màn hình Video (Display Text):</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Chữ to rõ trên video</span>
                </label>
                <textarea
                  rows={2}
                  value={current.interactiveQuestion || ''}
                  onChange={(e) => handleFieldChange('interactiveQuestion', e.target.value)}
                  placeholder="VD: Vậy 'Cho tôi mượn' tiếng Anh là gì?"
                  className="w-full bg-slate-900 border border-sky-500/40 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-400 resize-none font-semibold"
                />
              </div>

              {/* 2. Text to speak (Voice TTS) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. Nội dung Voice Tiếng Việt đọc thành tiếng (TTS Audio):</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleFieldChange('interactiveVoiceText', current.interactiveQuestion || '');
                      }}
                      className="text-[10px] text-slate-400 hover:text-sky-300 underline cursor-pointer"
                      title="Lấy nội dung từ ô hiển thị sang ô đọc voice"
                    >
                      ⚡ Sao chép từ Text hiển thị
                    </button>

                    <button
                      type="button"
                      disabled={isPlayingVoice}
                      onClick={async () => {
                        const text = (current.interactiveVoiceText || current.interactiveQuestion || '').trim();
                        if (!text) return;
                        setIsPlayingVoice(true);
                        try {
                          const buf = await audioEngine.getVoiceAudioBuffer(text, 'vi');
                          const speed = current.interactiveVoiceSpeed || 1.05;
                          const detune = current.interactiveVoicePitch ? (current.interactiveVoicePitch - 1.0) * 800 : 0;
                          if (buf) {
                            audioEngine.playAudioBuffer(buf, 0, speed, detune);
                            const effectiveDuration = (buf.duration / speed) * 1000;
                            setTimeout(() => setIsPlayingVoice(false), Math.max(1500, effectiveDuration));
                          } else {
                            await audioEngine.speak(text, {
                              lang: 'vi-VN',
                              rate: speed,
                              pitch: current.interactiveVoicePitch || 1.0,
                            });
                            setIsPlayingVoice(false);
                          }
                        } catch {
                          setIsPlayingVoice(false);
                        }
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isPlayingVoice ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-emerald-300" />
                          <span>Đang đọc...</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-emerald-400" />
                          <span>Nghe thử Voice</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={current.interactiveVoiceText || ''}
                  onChange={(e) => handleFieldChange('interactiveVoiceText', e.target.value)}
                  placeholder="VD: Vậy câu cho tôi mượn tiếng Anh là gì? Bạn hãy bình luận đáp án của mình bên dưới nhé!"
                  className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-400 resize-none font-medium"
                />

                {/* Voice Speed & Style Controls */}
                <div className="pt-2.5 border-t border-slate-800/80 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    {/* Voice Speed Control */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-300 font-semibold flex items-center gap-1">
                          ⚡ Tốc độ đọc Voice:
                        </span>
                        <span className="font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30 text-[11px]">
                          {current.interactiveVoiceSpeed || 1.05}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="1.5"
                        step="0.05"
                        value={current.interactiveVoiceSpeed || 1.05}
                        onChange={(e) => handleFieldChange('interactiveVoiceSpeed', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      {/* Speed Presets */}
                      <div className="flex flex-wrap gap-1">
                        {[
                          { label: '0.9x Chậm', val: 0.9 },
                          { label: '1.0x Chuẩn', val: 1.0 },
                          { label: '1.15x Nhanh', val: 1.15 },
                          { label: '1.3x TikTok', val: 1.3 },
                        ].map((p) => (
                          <button
                            key={p.val}
                            type="button"
                            onClick={() => handleFieldChange('interactiveVoiceSpeed', p.val)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                              (current.interactiveVoiceSpeed || 1.05) === p.val
                                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Voice Pitch / Tone Style */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-300 font-semibold flex items-center gap-1">
                          🎭 Tông giọng & Phong cách:
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {(current.interactiveVoicePitch || 1.0) > 1.04 ? 'Trong trẻo' : (current.interactiveVoicePitch || 1.0) < 0.96 ? 'Trầm ấm' : 'Tự nhiên'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateQuiz({
                              ...current,
                              interactiveVoiceStyle: 'standard',
                              interactiveVoiceSpeed: 1.05,
                              interactiveVoicePitch: 1.0,
                            });
                          }}
                          className={`p-1.5 rounded-lg border text-[10px] font-medium text-left transition-all ${
                            (!current.interactiveVoiceStyle || current.interactiveVoiceStyle === 'standard') && (!current.interactiveVoicePitch || current.interactiveVoicePitch === 1.0)
                              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          🌸 Nữ chuẩn
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateQuiz({
                              ...current,
                              interactiveVoiceStyle: 'viral',
                              interactiveVoiceSpeed: 1.15,
                              interactiveVoicePitch: 1.08,
                            });
                          }}
                          className={`p-1.5 rounded-lg border text-[10px] font-medium text-left transition-all ${
                            current.interactiveVoiceStyle === 'viral' || current.interactiveVoicePitch === 1.08
                              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          ⚡ Sôi nổi / Viral
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateQuiz({
                              ...current,
                              interactiveVoiceStyle: 'deep',
                              interactiveVoiceSpeed: 0.95,
                              interactiveVoicePitch: 0.92,
                            });
                          }}
                          className={`p-1.5 rounded-lg border text-[10px] font-medium text-left transition-all ${
                            current.interactiveVoiceStyle === 'deep' || current.interactiveVoicePitch === 0.92
                              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          🎙️ Trầm ấm
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateQuiz({
                              ...current,
                              interactiveVoiceStyle: 'fast',
                              interactiveVoiceSpeed: 1.25,
                              interactiveVoicePitch: 1.10,
                            });
                          }}
                          className={`p-1.5 rounded-lg border text-[10px] font-medium text-left transition-all ${
                            current.interactiveVoiceStyle === 'fast' || current.interactiveVoicePitch === 1.10
                              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          🚀 Thách đố nhanh
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prompt CTA & Duration Slider */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-7 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Lời kêu gọi hành động (Call To Action dưới khung):
                  </label>
                  <input
                    type="text"
                    value={current.interactivePrompt || ''}
                    onChange={(e) => handleFieldChange('interactivePrompt', e.target.value)}
                    placeholder="VD: Bình luận đáp án của bạn bên dưới nhé! 👇"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-5 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Thời lượng hỏi tối thiểu:</span>
                    <span className="font-bold text-amber-400">{current.interactiveDurationSeconds || 5} giây</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="1"
                    value={current.interactiveDurationSeconds || 5}
                    onChange={(e) => handleFieldChange('interactiveDurationSeconds', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="text-[10px] text-slate-400 text-right">
                    (Tự động mở rộng nếu câu voice dài hơn)
                  </div>
                </div>
              </div>

              {/* Explanation tip */}
              <div className="text-[11px] text-amber-300/80 bg-amber-950/40 border border-amber-500/20 rounded-xl p-2.5 flex items-start gap-2">
                <span className="text-sm">💡</span>
                <span>
                  <strong>Tự động khớp thời lượng Voice:</strong> Hệ thống tự động đo độ dài thực tế của câu Voice tiếng Việt để video không bao giờ bị ngắt lời giữa chừng, đảm bảo người xem nghe trọn vẹn 100% câu hỏi và lời kêu gọi!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
