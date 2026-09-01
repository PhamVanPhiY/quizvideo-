import React from 'react';
import { Video, Crown, BookOpen, Sparkles } from 'lucide-react';

interface HeaderProps {
  isVip: boolean;
  remainingExports: number;
  onOpenUpgrade: () => void;
  onOpenTopicLibrary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isVip,
  remainingExports,
  onOpenUpgrade,
  onOpenTopicLibrary,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
          <Video className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent">
              QuizVideo Studio
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-500/10 to-indigo-500/10 text-sky-300 border border-sky-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Shorts & TikTok Pro
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Tạo video Shorts / TikTok trắc nghiệm từ vựng tiếng Anh từ file JSON
          </p>
        </div>
      </div>

      {/* Action Controls & VIP Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 1-Click Topic Library Button */}
        <button
          type="button"
          onClick={onOpenTopicLibrary}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 text-xs font-semibold border border-sky-500/30 hover:border-sky-500/60 transition-all shadow-sm"
        >
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span>Kho Từ Vựng (1-Click)</span>
        </button>

        {/* Plan Status & Upgrade Trigger */}
        {isVip ? (
          <button
            type="button"
            onClick={onOpenUpgrade}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border border-amber-400/60 hover:border-amber-300 text-amber-300 text-xs font-black shadow-lg shadow-amber-500/15 transition-all cursor-pointer group"
            title="Bạn đang sở hữu VIP Pro Trọn Đời (Bấm để xem quyền lợi)"
          >
            <Crown className="w-4 h-4 fill-current text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">👑 VIP PRO TRỌN ĐỜI</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[11px] text-slate-400 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg">
              Lượt xuất: <b className="text-sky-400">{remainingExports}/3</b> hôm nay
            </span>

            <button
              type="button"
              onClick={onOpenUpgrade}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
            >
              <Crown className="w-4 h-4 fill-current" />
              <span>Nâng Cấp VIP</span>
            </button>
          </div>
        )}

        <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>9:16 Shorts</span>
        </div>
      </div>
    </header>
  );
};
