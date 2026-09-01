import React, { useState, useEffect } from 'react';
import type { QuizItem } from './types/quiz';
import { SAMPLE_QUIZ_LIST } from './services/sampleData';
import { licenseManager } from './services/licenseManager';
import type { LicenseState } from './services/licenseManager';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { VisualEditor } from './components/VisualEditor';
import { JsonEditor } from './components/JsonEditor';
import { ThemeSelector } from './components/ThemeSelector';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { BatchExportModal } from './components/BatchExportModal';
import { UpgradeModal } from './components/UpgradeModal';
import { TopicLibraryModal } from './components/TopicLibraryModal';
import { Sliders, Code, Sparkles, CheckCircle2, Film, Image as ImageIcon } from 'lucide-react';

export const App: React.FC = () => {
  const [quizList, setQuizList] = useState<QuizItem[]>(SAMPLE_QUIZ_LIST);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('starry-blue');
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');

  // License & SaaS state
  const [licenseState, setLicenseState] = useState<LicenseState>(licenseManager.getState());
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [isTopicLibraryModalOpen, setIsTopicLibraryModalOpen] = useState<boolean>(false);

  // Subscribe to license changes
  useEffect(() => {
    return licenseManager.subscribe((state: LicenseState) => {
      setLicenseState(state);
    });
  }, []);

  // Voice settings state (100% In-Browser Web Speech TTS)
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [voiceURI, setVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);

  const currentQuiz = quizList[currentIndex] || quizList[0] || SAMPLE_QUIZ_LIST[0];
  const remainingExports = licenseManager.getRemainingExportsToday();

  // Handlers for Visual Editor
  const handleUpdateQuiz = (updated: QuizItem) => {
    setQuizList((prev) => {
      const next = [...prev];
      next[currentIndex] = updated;
      return next;
    });
  };

  const handleAddQuiz = () => {
    const newId = `quiz-${Date.now()}`;
    const newQuiz: QuizItem = {
      id: newId,
      channelName: currentQuiz.channelName || 'BIN HỌC TIẾNG ANH',
      channelLogo: currentQuiz.channelLogo,
      logoPosition: currentQuiz.logoPosition,
      logoShape: currentQuiz.logoShape,
      logoSize: currentQuiz.logoSize,
      category: 'TỪ VỰNG MỚI',
      word: 'NEW WORD',
      ipa: '/n/a/',
      question: 'nghĩa là gì?',
      options: [
        { key: 'A', text: 'Đáp án A' },
        { key: 'B', text: 'Đáp án B' },
        { key: 'C', text: 'Đáp án C' },
        { key: 'D', text: 'Đáp án D' },
      ],
      correctAnswer: 'A',
      countdownSeconds: 5,
      revealDurationSeconds: 4,
      note: 'Lưu ý phân biệt từ',
      explanation: 'Giải thích nghĩa chi tiết',
      example: 'Example sentence in English.',
      exampleMeaning: 'Bản dịch ví dụ tiếng Việt.',
      enableInteractive: true,
      interactiveQuestion: 'Vậy "Cho tôi mượn" tiếng Anh là gì?',
      interactiveVoiceText: 'Vậy câu cho tôi mượn tiếng Anh là gì? Bạn hãy bình luận đáp án bên dưới nhé!',
      interactivePrompt: 'Bình luận đáp án của bạn bên dưới nhé! 👇',
      interactiveDurationSeconds: 4,
    };

    setQuizList((prev) => [...prev, newQuiz]);
    setCurrentIndex(quizList.length);
  };

  const handleDuplicateQuiz = (index: number) => {
    const target = quizList[index];
    if (!target) return;
    const duplicated: QuizItem = {
      ...JSON.parse(JSON.stringify(target)),
      id: `quiz-${Date.now()}`,
      word: `${target.word} (Copy)`,
    };
    setQuizList((prev) => [
      ...prev.slice(0, index + 1),
      duplicated,
      ...prev.slice(index + 1),
    ]);
    setCurrentIndex(index + 1);
  };

  const handleDeleteQuiz = (index: number) => {
    if (quizList.length <= 1) return;
    setQuizList((prev) => prev.filter((_, i) => i !== index));
    if (currentIndex >= quizList.length - 1) {
      setCurrentIndex(Math.max(0, quizList.length - 2));
    }
  };

  const handleApplyJson = (newList: QuizItem[]) => {
    setQuizList(newList);
    setCurrentIndex(0);
  };

  const handleApplyTopicFromLibrary = (questions: QuizItem[]) => {
    setQuizList(questions);
    setCurrentIndex(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      <Header
        isVip={licenseState.isVip}
        remainingExports={remainingExports}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        onOpenTopicLibrary={() => setIsTopicLibraryModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Video Preview & Player (9:16 Canvas) */}
        <div className="lg:col-span-5 flex flex-col items-center sticky top-20">
          <div className="w-full max-w-[400px]">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-4 h-4 text-sky-400" />
                <span>Xem Trước Video (Live 9:16)</span>
              </span>
              <span className="text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full font-mono">
                1080 x 1920 HD
              </span>
            </div>

            <VideoPlayer
              quiz={currentQuiz}
              themeId={selectedThemeId}
              autoSpeak={autoSpeak}
              voiceURI={voiceURI}
              speechRate={speechRate}
              speechPitch={speechPitch}
              isVip={licenseState.isVip}
              onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
              onOpenBatchExport={() => setIsBatchModalOpen(true)}
              onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
            />
          </div>
        </div>

        {/* Right Column: Editor Controls (Tabs for Visual / JSON / Themes) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Navigation Mode Switcher */}
          <div className="flex items-center justify-between p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('visual')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'visual'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Chỉnh Sửa Trực Quan (Visual)</span>
              </button>

              <button
                onClick={() => setActiveTab('json')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'json'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Mã JSON (Upload / Paste)</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 pr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sẵn sàng tạo video</span>
            </div>
          </div>

          {/* Theme Selector */}
          <ThemeSelector
            selectedThemeId={selectedThemeId}
            onSelectTheme={setSelectedThemeId}
            isVip={licenseState.isVip}
            onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
          />

          {/* Tab Content */}
          {activeTab === 'visual' ? (
            <VisualEditor
              quizList={quizList}
              currentIndex={currentIndex}
              onSelectIndex={setCurrentIndex}
              onUpdateQuiz={handleUpdateQuiz}
              onAddQuiz={handleAddQuiz}
              onDuplicateQuiz={handleDuplicateQuiz}
              onDeleteQuiz={handleDeleteQuiz}
            />
          ) : (
            <JsonEditor
              quizList={quizList}
              onApplyJson={handleApplyJson}
            />
          )}

          {/* Feature Highlights Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                <ImageIcon className="w-4 h-4" />
                <span>Thêm Logo & Avatar Kênh</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tải logo hoặc avatar của kênh hiển thị trực tiếp lên video với viền sáng sang trọng.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đếm Ngược & Đáp Án</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tự động đếm ngược 5s, bật thẻ xanh checkmark, hiện ghi chú & câu ví dụ tiếng Anh.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>Xuất Video Siêu Tốc 60 FPS</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tự động render video Full HD sắc nét, mượt mà chuẩn định dạng Shorts/TikTok/Reels.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <VoiceSettingsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        voiceURI={voiceURI}
        onVoiceChange={setVoiceURI}
        speechRate={speechRate}
        onRateChange={setSpeechRate}
        speechPitch={speechPitch}
        onPitchChange={setSpeechPitch}
        autoSpeak={autoSpeak}
        onAutoSpeakChange={setAutoSpeak}
        sampleWord={currentQuiz.word}
      />

      <BatchExportModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        quizList={quizList}
        themeId={selectedThemeId}
        isVip={licenseState.isVip}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      <TopicLibraryModal
        isOpen={isTopicLibraryModalOpen}
        onClose={() => setIsTopicLibraryModalOpen(false)}
        isVip={licenseState.isVip}
        onApplyTopic={handleApplyTopicFromLibrary}
        onOpenUpgrade={() => {
          setIsTopicLibraryModalOpen(false);
          setIsUpgradeModalOpen(true);
        }}
      />
    </div>
  );
};

export default App;
