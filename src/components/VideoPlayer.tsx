import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { QuizItem } from '../types/quiz';
import { VideoRenderer } from '../services/videoRenderer';
import { audioEngine } from '../services/audioEngine';
import { licenseManager } from '../services/licenseManager';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Settings2,
  Loader2,
  Layers,
} from 'lucide-react';

interface VideoPlayerProps {
  quiz: QuizItem;
  themeId: string;
  autoSpeak: boolean;
  voiceURI: string;
  speechRate: number;
  speechPitch: number;
  isVip: boolean;
  onOpenVoiceSettings: () => void;
  onOpenBatchExport: () => void;
  onOpenUpgrade: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  quiz,
  themeId,
  autoSpeak,
  voiceURI,
  speechRate,
  speechPitch,
  isVip,
  onOpenVoiceSettings,
  onOpenBatchExport,
  onOpenUpgrade,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<VideoRenderer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isExportingSingle, setIsExportingSingle] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const countdownTotal = quiz.countdownSeconds || 5;
  const revealDuration = quiz.revealDurationSeconds || 4;
  const totalDuration = countdownTotal + revealDuration;

  // Track timeline flags
  const lastSecondRef = useRef<number>(-1);
  const wordSpokenRef = useRef<boolean>(false);
  const chimeTriggeredRef = useRef<boolean>(false);
  const exampleSpokenRef = useRef<boolean>(false);
  const animationFrameId = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  // Initialize Canvas Renderer
  useEffect(() => {
    if (canvasRef.current) {
      const renderer = new VideoRenderer(canvasRef.current, themeId);
      renderer.setDimensions(1080, 1920);
      rendererRef.current = renderer;
      renderer.renderFrame(quiz, currentTime);
    }
  }, [themeId]);

  // Update theme when changed
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setTheme(themeId);
      rendererRef.current.renderFrame(quiz, currentTime);
    }
  }, [themeId, quiz, currentTime]);

  const wordBufferRef = useRef<AudioBuffer | null>(null);
  const exampleBufferRef = useRef<AudioBuffer | null>(null);

  // Preload TTS Voice Buffers whenever quiz changes
  useEffect(() => {
    let isCancelled = false;
    audioEngine.preloadQuizAudio(quiz).then(({ wordBuffer, exampleBuffer }) => {
      if (!isCancelled) {
        wordBufferRef.current = wordBuffer;
        exampleBufferRef.current = exampleBuffer;
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [quiz]);

  // Handle Confetti Burst on reveal
  const triggerConfettiEffect = useCallback(() => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#38bdf8', '#fbbf24', '#ffffff']
      });
    } catch {
      // fallback
    }
  }, []);

  // Main Animation / Playback Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      lastTimestampRef.current = null;
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }
      const deltaSec = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      setCurrentTime((prev) => {
        const next = prev + deltaSec;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }

        // 1. Pronounce Word at beginning (t = 0.1s - 0.3s)
        if (next >= 0.1 && !wordSpokenRef.current) {
          wordSpokenRef.current = true;
          if (autoSpeak) {
            if (wordBufferRef.current) {
              audioEngine.playAudioBuffer(wordBufferRef.current);
            } else {
              audioEngine.speak(quiz.word, {
                voiceURI,
                rate: speechRate,
                pitch: speechPitch,
              });
            }
          }
        }

        // 2. Ticking sound during countdown
        const currentSecInt = Math.floor(next);
        const prevSecInt = Math.floor(prev);
        if (next < countdownTotal) {
          if (currentSecInt !== prevSecInt && currentSecInt !== lastSecondRef.current) {
            lastSecondRef.current = currentSecInt;
            const remaining = countdownTotal - currentSecInt;
            if (remaining <= 3 && remaining > 0) {
              audioEngine.playBeep(false);
            } else {
              audioEngine.playTick(currentSecInt % 2 === 0 ? 800 : 700);
            }
          }
        }

        // 3. Chime and Celebration at 5s (Reveal)
        if (next >= countdownTotal && !chimeTriggeredRef.current) {
          chimeTriggeredRef.current = true;
          audioEngine.playCorrectChime();
          triggerConfettiEffect();
        }

        // 4. Pronounce Example Sentence (t = countdownTotal + 0.6s)
        if (next >= countdownTotal + 0.6 && !exampleSpokenRef.current) {
          exampleSpokenRef.current = true;
          if (autoSpeak && (quiz.example || quiz.explanation)) {
            if (exampleBufferRef.current) {
              audioEngine.playAudioBuffer(exampleBufferRef.current);
            } else {
              const textToSpeak = quiz.example || quiz.explanation;
              audioEngine.speak(textToSpeak, {
                voiceURI,
                rate: speechRate,
                pitch: speechPitch,
              });
            }
          }
        }

        return next;
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    isPlaying,
    totalDuration,
    countdownTotal,
    autoSpeak,
    voiceURI,
    speechRate,
    speechPitch,
    quiz,
    triggerConfettiEffect,
  ]);

  // Render on frame update
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.renderFrame(quiz, currentTime, isVip);
    }
  }, [quiz, currentTime, isVip]);

  const handlePlayPause = () => {
    if (currentTime >= totalDuration) {
      handleReplay();
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    lastSecondRef.current = -1;
    wordSpokenRef.current = false;
    chimeTriggeredRef.current = false;
    exampleSpokenRef.current = false;
    audioEngine.stopSpeaking();
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioEngine.stopSpeaking();
    setCurrentTime(val);
    wordSpokenRef.current = val >= 0.1;
    chimeTriggeredRef.current = val >= countdownTotal;
    exampleSpokenRef.current = val >= countdownTotal + 0.6;
    lastSecondRef.current = Math.floor(val);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setMute(nextMuted);
  };

  // Export single video with Word + Example Voice + Sound FX
  const handleExportSingle = async () => {
    if (!rendererRef.current) return;

    if (!isVip) {
      const quota = licenseManager.canExport(1);
      if (!quota.allowed) {
        onOpenUpgrade();
        return;
      }
    }

    setIsExportingSingle(true);
    setExportProgress(0);
    setIsPlaying(false);

    try {
      const audioCtx = audioEngine.getAudioContext();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      // 1. Preload voice AudioBuffers first (Zero delay during recording)
      const { wordBuffer, exampleBuffer } = await audioEngine.preloadQuizAudio(quiz);

      // 2. Schedule audio and start video export at the EXACT same timestamp
      const startTime = audioCtx.currentTime + 0.05;
      audioEngine.scheduleQuizAudioDirect(quiz, startTime, wordBuffer, exampleBuffer);

      const audioStream = audioEngine.getAudioStream();
      const videoBlob = await rendererRef.current.exportVideo(
        quiz,
        audioStream,
        (progress) => setExportProgress(progress),
        isVip
      );

      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      const cleanWord = (quiz.word || 'quiz').replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `Shorts_${cleanWord}_Quiz.webm`;
      a.click();
      URL.revokeObjectURL(url);

      licenseManager.recordExport(1);
    } catch (err) {
      console.error('Lỗi khi xuất video:', err);
    } finally {
      setIsExportingSingle(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Smartphone Mockup Container (9:16 Aspect Ratio) */}
      <div className="relative group">
        {/* Glow behind phone */}
        <div className="absolute -inset-1.5 bg-gradient-to-tr from-sky-500/30 via-indigo-500/20 to-emerald-500/30 rounded-[42px] blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />

        {/* Phone Body */}
        <div className="relative w-[300px] sm:w-[340px] md:w-[380px] aspect-[9/16] bg-slate-950 rounded-[38px] p-3 border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
          {/* Top Notch Pill */}
          <div className="absolute top-4 z-20 w-24 h-4 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mr-2" />
            <div className="w-1.5 h-1.5 rounded-full bg-sky-500/60" />
          </div>

          {/* Real 1080x1920 High-Res Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded-[28px] object-cover cursor-pointer"
            onClick={handlePlayPause}
          />

          {/* Overlay Play Button when paused */}
          {!isPlaying && (
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-sky-500/90 hover:bg-sky-400 text-slate-950 flex items-center justify-center shadow-xl shadow-sky-500/40 backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 z-30"
            >
              <Play className="w-8 h-8 fill-current ml-1" />
            </button>
          )}

          {/* Exporting Indicator Overlay */}
          {isExportingSingle && (
            <div className="absolute inset-0 bg-slate-950/90 z-40 rounded-[28px] flex flex-col items-center justify-center p-6 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
              <div>
                <p className="text-sm font-bold text-slate-100">Đang Render Video...</p>
                <p className="text-xs text-sky-400 font-mono font-bold mt-1">
                  {exportProgress}% Hoàn tất
                </p>
              </div>
              <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-150"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Controller Bar */}
      <div className="w-full max-w-[380px] bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3.5 space-y-3 shadow-xl backdrop-blur-md">
        {/* Progress scrub bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span className="text-sky-400 font-semibold">{currentTime.toFixed(1)}s</span>
            <span className="text-slate-500">Kết quả ở: {countdownTotal}s</span>
            <span>{totalDuration.toFixed(1)}s</span>
          </div>
          <input
            type="range"
            min="0"
            max={totalDuration}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>

        {/* Buttons Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePlayPause}
              className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow-md shadow-sky-500/20"
              title={isPlaying ? 'Tạm dừng' : 'Phát video'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={handleReplay}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Phát lại từ đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl transition-colors ${
                isMuted
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenVoiceSettings}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="Cài đặt giọng đọc & phát âm"
            >
              <Settings2 className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Giọng Đọc</span>
            </button>
          </div>
        </div>

        {/* Big Action Buttons: Export 1 Video & Batch Export */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
          <button
            onClick={handleExportSingle}
            disabled={isExportingSingle}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Video Này</span>
          </button>

          <button
            onClick={onOpenBatchExport}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Xuất Hàng Loạt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
