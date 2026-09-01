import React from 'react';
import { THEMES } from '../services/themes';
import { Palette, Check, Lock, Crown } from 'lucide-react';

interface ThemeSelectorProps {
  selectedThemeId: string;
  onSelectTheme: (id: string) => void;
  isVip: boolean;
  onOpenUpgrade: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedThemeId,
  onSelectTheme,
  isVip,
  onOpenUpgrade,
}) => {
  const handleThemeClick = (themeId: string, isVipOnly?: boolean) => {
    if (isVipOnly && !isVip) {
      onOpenUpgrade();
      return;
    }
    onSelectTheme(themeId);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Palette className="w-4 h-4 text-sky-400" />
          <span>Giao diện & Hình nền (Themes)</span>
        </div>

        {!isVip && (
          <button
            type="button"
            onClick={onOpenUpgrade}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            <Crown className="w-3.5 h-3.5 fill-current" />
            <span>Mở khóa toàn bộ Theme VIP</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {THEMES.map((theme) => {
          const isSelected = theme.id === selectedThemeId;
          const isLocked = theme.isVipOnly && !isVip;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleThemeClick(theme.id, theme.isVipOnly)}
              className={`group relative text-left p-2.5 rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'border-sky-400 bg-slate-900/90 shadow-md shadow-sky-500/20 ring-1 ring-sky-400'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              {/* Theme color preview swatch */}
              <div
                className="w-full h-11 rounded-lg mb-2 relative overflow-hidden border border-white/10"
                style={{
                  background: `linear-gradient(135deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1]} 50%, ${theme.bgGradient[2]} 100%)`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-3 rounded bg-white/90 shadow-sm flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                    <span className="text-[7px] font-bold text-emerald-800">QUIZ</span>
                  </div>
                </div>

                {isLocked && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                      <Lock className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 transition-colors truncate">
                    {theme.name}
                  </p>
                  <span className={`text-[10px] font-semibold ${
                    theme.isVipOnly ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    {theme.badge}
                  </span>
                </div>

                {isLocked ? (
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : isSelected ? (
                  <div className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
