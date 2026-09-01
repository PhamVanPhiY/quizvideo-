import React, { useEffect, useState } from 'react';
import { Volume2, Mic, Play, X, Check, Sliders } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceURI: string;
  onVoiceChange: (uri: string) => void;
  speechRate: number;
  onRateChange: (rate: number) => void;
  speechPitch: number;
  onPitchChange: (pitch: number) => void;
  autoSpeak: boolean;
  onAutoSpeakChange: (enabled: boolean) => void;
  sampleWord: string;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  voiceURI,
  onVoiceChange,
  speechRate,
  onRateChange,
  speechPitch,
  onPitchChange,
  autoSpeak,
  onAutoSpeakChange,
  sampleWord,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = audioEngine.getVoices();
      setVoices(allVoices);
      if (!voiceURI && allVoices.length > 0) {
        // Pick an English voice by default
        const defaultVoice = allVoices.find(v => v.lang.startsWith('en')) || allVoices[0];
        if (defaultVoice) {
          onVoiceChange(defaultVoice.voiceURI);
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [voiceURI, onVoiceChange]);

  if (!isOpen) return null;

  const englishVoices = voices.filter(v => v.lang.startsWith('en'));
  const vietnameseVoices = voices.filter(v => v.lang.startsWith('vi'));
  const otherVoices = voices.filter(v => !v.lang.startsWith('en') && !v.lang.startsWith('vi'));

  const handleTestVoice = async () => {
    setIsPlayingSample(true);
    await audioEngine.speak(`${sampleWord || 'Goods'}. Nghĩa là hàng hóa.`, {
      voiceURI,
      rate: speechRate,
      pitch: speechPitch,
      onEnd: () => setIsPlayingSample(false),
      onError: () => setIsPlayingSample(false),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Cài Đặt Giọng Đọc & Phát Âm
              </h3>
              <p className="text-xs text-slate-400">
                Tùy chỉnh phát âm từ vựng chuẩn quốc tế & tốc độ giọng đọc
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto Speak Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div>
            <div className="text-sm font-semibold text-slate-200">
              Tự Động Phát Âm Khi Chạy Video
            </div>
            <p className="text-xs text-slate-400">
              Đọc từ vựng tiếng Anh và đọc đáp án khi mở kết quả
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoSpeak}
              onChange={(e) => onAutoSpeakChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
          </label>
        </div>

        {/* Select Voice */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Chọn Giọng Đọc Trong Máy:</span>
            <span className="text-slate-400 text-[11px]">
              {voices.length} giọng có sẵn
            </span>
          </label>
          <select
            value={voiceURI}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            {englishVoices.length > 0 && (
              <optgroup label="🇬🇧 🇺🇸 Tiếng Anh (English)">
                {englishVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </optgroup>
            )}
            {vietnameseVoices.length > 0 && (
              <optgroup label="🇻🇳 Tiếng Việt (Vietnamese)">
                {vietnameseVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </optgroup>
            )}
            {otherVoices.length > 0 && (
              <optgroup label="🌍 Ngôn ngữ khác">
                {otherVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Speed & Pitch Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3 text-sky-400" /> Tốc độ đọc:
              </span>
              <span className="font-mono text-sky-400 font-bold">{speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.5"
              step="0.1"
              value={speechRate}
              onChange={(e) => onRateChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-emerald-400" /> Cao độ (Pitch):
              </span>
              <span className="font-mono text-emerald-400 font-bold">{speechPitch}</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.1"
              value={speechPitch}
              onChange={(e) => onPitchChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Test Speech Button & Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleTestVoice}
            disabled={isPlayingSample}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 text-sky-400 ${isPlayingSample ? 'animate-spin' : ''}`} />
            <span>{isPlayingSample ? 'Đang đọc thử...' : 'Nghe Thử Giọng'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-sky-500/20"
          >
            <Check className="w-4 h-4" />
            <span>Hoàn Tất</span>
          </button>
        </div>
      </div>
    </div>
  );
};
