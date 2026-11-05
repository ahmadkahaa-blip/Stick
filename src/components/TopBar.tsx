import React from 'react';
import { Moon, Sun, Heart, Sparkles } from 'lucide-react';

interface CategoryItem {
  id: string;
  label: string;
  count: number;
}

interface TopBarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  favoritesCount?: number;
  categoriesList?: CategoryItem[];
  onOpenAiModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeNav,
  setActiveNav,
  isDark,
  onToggleTheme,
  favoritesCount = 0,
  categoriesList = [],
  onOpenAiModal
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-14 sm:h-16">
          {/* Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveNav('all')}
              className="flex items-center gap-2 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                B
              </div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap font-['Outfit']">
                Bobble<span className="text-amber-500">GIFs</span>
              </span>
            </button>
          </div>

          {/* Navigation Links (visible on desktop) */}
          <nav className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 overflow-x-auto">
            {categoriesList.slice(0, 6).map((cat) => {
              const isActive = activeNav.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveNav(cat.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                      : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              );
            })}
            <button
              onClick={() => setActiveNav('favorites')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeNav === 'favorites'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${activeNav === 'favorites' ? 'fill-current' : ''}`} />
              <span>Favorites ({favoritesCount})</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* AI Category Creator button */}
            {onOpenAiModal && (
              <button
                onClick={onOpenAiModal}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Category</span>
                <span className="sm:hidden">AI</span>
              </button>
            )}

            {/* Quick favorites button (mobile) */}
            <button
              onClick={() => setActiveNav(activeNav === 'favorites' ? 'all' : 'favorites')}
              aria-label="View Favorites"
              className={`xl:hidden p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
                activeNav === 'favorites'
                  ? 'bg-rose-500 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${activeNav === 'favorites' ? 'fill-current' : ''}`} />
              {favoritesCount > 0 && <span className="text-xs font-bold">{favoritesCount}</span>}
            </button>

            {/* Dark/Light mode toggle */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle color theme"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
