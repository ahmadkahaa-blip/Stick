import React, { useState, useEffect, useMemo } from 'react';
import { GifItem } from './types/gif';
import { INITIAL_GIFS } from './data/initialGifs';
import { TopBar } from './components/TopBar';
import { GifCard } from './components/GifCard';
import { GifDetailModal } from './components/GifDetailModal';
import { QrModal } from './components/QrModal';
import { Toast } from './components/Toast';
import { AiCategoryModal } from './components/AiCategoryModal';
import { Heart, Sparkles, Trash2, Sticker, CheckCircle2 } from 'lucide-react';

const STORAGE_FAVORITES = 'bobble_favs_v3';
const STORAGE_THEME = 'bobble_theme_v3';
const STORAGE_CUSTOM_GIFS = 'bobble_ai_custom_gifs_v2';

// Accent color mapping for distinct category buttons
const CATEGORY_COLORS: Record<string, string> = {
  'good morning': 'bg-amber-500 text-slate-950',
  'good night': 'bg-indigo-600 text-white',
  'hi & hello': 'bg-emerald-600 text-white',
  'cooking': 'bg-orange-500 text-white',
  'chai & snacks': 'bg-amber-600 text-white',
  'bollywood & drama': 'bg-pink-600 text-white',
  'party & celebrations': 'bg-purple-600 text-white',
  'generic': 'bg-cyan-600 text-white'
};

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_THEME);
      if (saved !== null) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to html document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_THEME, 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Sticker format mode (enabled by default)
  const [isStickerMode, setIsStickerMode] = useState<boolean>(true);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_FAVORITES);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved favorites', e);
      }
    }
    return [];
  });

  // Save favorites to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [favorites]);

  // AI-generated custom GIFs state
  const [customGifs, setCustomGifs] = useState<GifItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_CUSTOM_GIFS);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved AI custom gifs', e);
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CUSTOM_GIFS, JSON.stringify(customGifs));
    } catch (e) {
      console.warn('LocalStorage custom gifs error:', e);
    }
  }, [customGifs]);

  // Combined library of initial Bobble GIFs + AI-generated GIFs
  const allGifs = useMemo(() => {
    return [...INITIAL_GIFS, ...customGifs];
  }, [customGifs]);

  // Navigation category state
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Modals state
  const [selectedGif, setSelectedGif] = useState<GifItem | null>(null);
  const [qrGif, setQrGif] = useState<GifItem | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      showToast(exists ? 'Removed from favorites' : 'Saved to favorites');
      return next;
    });
  };

  // Add newly created AI category
  const handleCategoryCreated = (categoryName: string, newGifs: GifItem[]) => {
    setCustomGifs((prev) => [...prev, ...newGifs]);
    setActiveCategory(categoryName);
  };

  // Delete a custom AI category
  const handleDeleteCustomCategory = (categoryName: string) => {
    setCustomGifs((prev) => prev.filter((g) => g.category.toLowerCase() !== categoryName.toLowerCase()));
    setActiveCategory('all');
    showToast(`Removed "${categoryName}" category`);
  };

  // Compute category counts & organized list
  const { categoriesList, customCategoryNames } = useMemo(() => {
    const counts: Record<string, number> = {};
    allGifs.forEach((g) => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });

    const defaultOrder = [
      'Good Morning',
      'Good Night',
      'Hi & Hello',
      'Cooking',
      'Chai & Snacks',
      'Bollywood & Drama',
      'Party & Celebrations',
      'Generic'
    ];

    const customCats = Array.from(new Set(customGifs.map((g) => g.category))).filter(
      (c) => !defaultOrder.some((def) => def.toLowerCase() === c.toLowerCase())
    );

    const fullOrder = [
      ...defaultOrder.filter((c) => counts[c]),
      ...customCats
    ];

    const list = [
      { id: 'all', label: 'All', count: allGifs.length },
      ...fullOrder.map((c) => ({ id: c, label: c, count: counts[c] || 0 }))
    ];

    return { categoriesList: list, customCategoryNames: customCats };
  }, [allGifs, customGifs]);

  // Filtered GIFs based strictly on Category Filters
  const filteredGifs = useMemo(() => {
    return allGifs.filter((gif) => {
      if (activeCategory === 'favorites') {
        return favorites.includes(gif.id);
      }
      if (activeCategory.toLowerCase() === 'all') {
        return true;
      }
      return gif.category.toLowerCase() === activeCategory.toLowerCase();
    });
  }, [allGifs, activeCategory, favorites]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sleek TopBar */}
      <TopBar
        activeNav={activeCategory}
        setActiveNav={setActiveCategory}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        favoritesCount={favorites.length}
        categoriesList={categoriesList}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

      {/* Clean Sticky Category Filter Strip */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-2 sm:py-2.5 transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 hide-scrollbar touch-pan-x w-full sm:w-auto">
              {/* AI Create Category Button */}
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap shrink-0 transition-all active:scale-95 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white shadow-xs hover:opacity-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ AI Category</span>
              </button>

              {/* Category Pills */}
              {categoriesList.map((cat) => {
                const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();
                const isCustom = customCategoryNames.includes(cat.id);
                const colorClass =
                  CATEGORY_COLORS[cat.id.toLowerCase()] ||
                  (cat.id === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                    : 'bg-indigo-600 text-white');

                return (
                  <div key={cat.id} className="relative flex items-center shrink-0">
                    <button
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all active:scale-95 ${
                        isActive
                          ? `${colorClass} shadow-xs`
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cat.label} ({cat.count})
                    </button>

                    {/* Delete button for custom AI categories */}
                    {isCustom && isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomCategory(cat.id);
                        }}
                        title={`Delete ${cat.label} category`}
                        className="ml-1 p-1 rounded-md text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Favorites Tab */}
              <button
                onClick={() => setActiveCategory('favorites')}
                className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all flex items-center gap-1 active:scale-95 ${
                  activeCategory === 'favorites'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${activeCategory === 'favorites' ? 'fill-current' : ''}`} />
                <span>Favorites ({favorites.length})</span>
              </button>
            </div>

            {/* Quick Sticker Mode Indicator & Count */}
            <div className="flex items-center gap-2 shrink-0 hidden sm:flex">
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>WhatsApp .webp Stickers</span>
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                {filteredGifs.length} Stickers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Responsive Sticker Gallery */}
      <main className="flex-1 max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3.5 sm:py-6 w-full">
        {filteredGifs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5 md:gap-5">
            {filteredGifs.map((gif) => (
              <GifCard
                key={gif.id}
                gif={gif}
                isStickerMode={isStickerMode}
                isFavorite={favorites.includes(gif.id)}
                onToggleFavorite={handleToggleFavorite}
                onSelect={(g) => setSelectedGif(g)}
                onShowQr={(g) => setQrGif(g)}
                onShowToast={showToast}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center max-w-sm mx-auto">
            <Sticker className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No Stickers Found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {activeCategory === 'favorites'
                ? 'Click the heart icon on any sticker to save it here for quick sharing.'
                : 'No stickers match this category yet.'}
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-950 rounded-lg shadow-xs hover:opacity-90 transition-opacity"
            >
              View All Stickers
            </button>
          </div>
        )}
      </main>

      {/* AI Category Creation Modal */}
      <AiCategoryModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
        onShowToast={showToast}
      />

      {/* Detail Modal with True Sticker Simulator & 1-tap WhatsApp Sticker sharing */}
      {selectedGif && (
        <GifDetailModal
          gif={selectedGif}
          allGifs={allGifs}
          isFavorite={favorites.includes(selectedGif.id)}
          onClose={() => setSelectedGif(null)}
          onToggleFavorite={handleToggleFavorite}
          onSelectGif={(g) => setSelectedGif(g)}
          onShowQr={(g) => setQrGif(g)}
          onShowToast={showToast}
        />
      )}

      {/* QR Code Modal for Mobile Phone Camera Sharing */}
      {qrGif && (
        <QrModal
          gif={qrGif}
          onClose={() => setQrGif(null)}
          onShowToast={showToast}
        />
      )}

      {/* Feedback Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
