import React, { useState, useRef } from 'react';
import type { QuizItem } from '../types/quiz';
import { Code, Upload, Download, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { SAMPLE_QUIZ_LIST } from '../services/sampleData';

interface JsonEditorProps {
  quizList: QuizItem[];
  onApplyJson: (newList: QuizItem[]) => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  quizList,
  onApplyJson,
}) => {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(quizList, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    setError(null);
    setSuccessMsg(null);
  };

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Dữ liệu JSON phải là một mảng [] danh sách các câu hỏi.');
      }
      if (parsed.length === 0) {
        throw new Error('Danh sách câu hỏi không được để trống.');
      }
      // Check required fields on items
      parsed.forEach((item, index) => {
        if (!item.word || !item.options || !Array.isArray(item.options) || !item.correctAnswer) {
          throw new Error(`Câu #${index + 1} thiếu trường bắt buộc (word, options, correctAnswer).`);
        }
      });

      onApplyJson(parsed);
      setSuccessMsg(`Đã áp dụng thành công ${parsed.length} câu hỏi từ JSON!`);
      setError(null);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      setError((err as Error).message || 'Cú pháp JSON không hợp lệ.');
      setSuccessMsg(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          setJsonText(JSON.stringify(parsed, null, 2));
          onApplyJson(parsed);
          setSuccessMsg(`Đã tải lên thành công file "${file.name}" (${parsed.length} câu)!`);
          setError(null);
        } else {
          setError('File JSON phải chứa một mảng danh sách [].');
        }
      } catch {
        setError('Không thể đọc file JSON. Vui lòng kiểm tra định dạng.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetSample = () => {
    setJsonText(JSON.stringify(SAMPLE_QUIZ_LIST, null, 2));
    onApplyJson(SAMPLE_QUIZ_LIST);
    setSuccessMsg('Đã khôi phục dữ liệu mẫu chuẩn (5 câu hỏi)!');
    setError(null);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-sky-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Trình Soạn Thảo JSON Trực Tiếp
            </h3>
            <p className="text-xs text-slate-400">
              Dán nội dung JSON hoặc tải file .json từ máy của bạn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>Tải File .JSON</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tải Về File</span>
          </button>

          <button
            type="button"
            onClick={handleResetSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Mẫu Chuẩn</span>
          </button>
        </div>
      </div>

      {/* JSON Code Textarea */}
      <div className="relative">
        <textarea
          value={jsonText}
          onChange={handleTextChange}
          rows={14}
          spellCheck={false}
          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 font-mono text-xs text-sky-200 leading-relaxed focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all selection:bg-sky-700"
          placeholder="Dán mã JSON câu hỏi vào đây..."
        />
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400">
          * Đầy đủ các trường: `channelName`, `word`, `ipa`, `question`, `options`, `correctAnswer`, `note`, `explanation`, `example`, `exampleMeaning`.
        </span>

        <button
          type="button"
          onClick={handleApply}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2"
        >
          <span>Áp Dụng Thay Đổi</span>
        </button>
      </div>
    </div>
  );
};
