import React, { useState } from 'react';
import { X, Sparkles, Wand2, ChefHat, Coffee, PartyPopper, Clapperboard, Dumbbell, Cat, Trophy, Briefcase, Gamepad2, Loader2 } from 'lucide-react';
import { GifItem } from '../types/gif';

interface AiCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: (categoryName: string, gifs: GifItem[]) => void;
  onShowToast: (msg: string) => void;
}

const PRESET_SUGGESTIONS = [
  { label: 'Cooking & Recipes', icon: ChefHat, theme: 'Cooking & Street Food' },
  { label: 'Chai Time & Snacks', icon: Coffee, theme: 'Chai & Evening Snacks' },
  { label: 'Birthday & Party', icon: PartyPopper, theme: 'Birthday Celebrations & Party' },
  { label: 'Bollywood Drama', icon: Clapperboard, theme: 'Bollywood Dramatic Dialogues' },
  { label: 'Gym & Fitness', icon: Dumbbell, theme: 'Gym Workout & Diet Memes' },
  { label: 'Cats & Cute Pets', icon: Cat, theme: 'Cute Cats & Dogs Funny' },
  { label: 'Cricket Mania', icon: Trophy, theme: 'Cricket Match Passion & Banter' },
  { label: 'Office & Work Life', icon: Briefcase, theme: 'Office Meeting & Friday Mood' },
  { label: 'Gaming & Memes', icon: Gamepad2, theme: 'Gaming Rage & Victory' },
];

const BOBBLE_FALLBACK_URLS = [
  'https://bobble-animations.bobblekeyboard.net/previews/2c603501-fe93-41de-8ab7-a1d9da194b07.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/178f694f-50c5-408d-8214-b403e60bc734.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/2204133f-f6b2-4cef-b87a-2fde4fd09b90.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/feddd75e-669d-4e92-ba65-6137a4757494.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/dea7d7e0-ad54-4dfc-8d7e-bfb1a8fde103.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/973c95b0-784d-4acf-b96b-6127ebeba1ab.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/7ebd604f-9418-462f-97c8-29176f41cb8a.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/5d1ca305-680a-42a7-9474-ea2d8fea7c37.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/5a7bd5b8-2983-4894-8731-1d87b740215f.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/43b70612-ff3e-4312-a160-9006c7c84312.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/32e27c62-f2dc-4bcd-8fd0-22367439b7c5.gif',
  'https://bobble-animations.bobblekeyboard.net/previews/f4e94117-0d74-45a2-b302-3a4b1e11bf31.gif',
];

function generateClientFallbackCategory(theme: string, language: string, count: number): GifItem[] {
  const cleanName = theme.charAt(0).toUpperCase() + theme.slice(1);
  const titles = [
    `${cleanName} Mood Right Now`,
    `Super Relatable ${cleanName}`,
    `When ${cleanName} Hits Hard`,
    `Classic ${cleanName} Reaction`,
    `Peak ${cleanName} Moments`,
    `Everyday ${cleanName} Vibe`,
    `Unstoppable ${cleanName}`,
    `${cleanName} Ka Asli Maza`
  ];

  const dialogues = [
    `Yeh wala ${cleanName} toh directly dil ko laga! ✨😂`,
    `Aapke liye special ${cleanName} sticker, enjoy karo! 🎉`,
    `Life mein ${cleanName} ki kami nahi honi chahiye boss! 🔥`,
    `Bilkul sahi pakde hain! Pure ${cleanName} swag 🕶️`,
    `Kya baat hai! Bas aisi hi energy chahiye roz 🚀`,
    `Yeh scene dekh kar hasi nahi ruk rahi yaar 🤣`
  ];

  return Array.from({ length: Math.min(count, 8) }).map((_, idx) => ({
    id: `ai-local-${Date.now()}-${idx + 1}`,
    title: titles[idx % titles.length],
    category: cleanName,
    dialogue: dialogues[idx % dialogues.length],
    tags: [cleanName.toLowerCase(), 'sticker', 'whatsapp', 'fun'],
    url: BOBBLE_FALLBACK_URLS[idx % BOBBLE_FALLBACK_URLS.length],
    language: language || 'Hinglish',
    mood: idx % 2 === 0 ? 'Happy' : 'Funny',
    source: 'client-ai-generator',
    views: Math.floor(Math.random() * 40000) + 30000,
    likes: Math.floor(Math.random() * 6000) + 2000,
    aspectRatio: 'square',
    createdAt: new Date().toISOString()
  }));
}

export const AiCategoryModal: React.FC<AiCategoryModalProps> = ({
  isOpen,
  onClose,
  onCategoryCreated,
  onShowToast
}) => {
  const [themeInput, setThemeInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Hinglish');
  const [gifCount, setGifCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (theme: string) => {
    setThemeInput(theme);
    setErrorMessage(null);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const promptTheme = themeInput.trim();
    if (!promptTheme) {
      setErrorMessage('Please type a category theme or pick one of the suggestions.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/gemini/generate-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryName: promptTheme,
          theme: promptTheme,
          language: selectedLanguage,
          count: gifCount
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data && result.data.gifs && result.data.gifs.length > 0) {
        const catName = result.data.categoryName || promptTheme;
        onCategoryCreated(catName, result.data.gifs);
        onShowToast(`Created "${catName}" category with ${result.data.gifs.length} stickers!`);
        onClose();
        return;
      } else {
        throw new Error(result.errorNotice || 'Failed to generate category.');
      }
    } catch (err: any) {
      console.warn('Backend API unavailable (e.g. Netlify static mode), generating client-side:', err);
      // Fallback for Netlify static deployments where no Node server is hosted
      const fallbackGifs = generateClientFallbackCategory(promptTheme, selectedLanguage, gifCount);
      onCategoryCreated(promptTheme, fallbackGifs);
      onShowToast(`Created "${promptTheme}" category with ${fallbackGifs.length} stickers!`);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with decorative gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600" />
        
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-indigo-500/20 text-amber-500 dark:text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  AI Sticker Category Generator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Powered by Gemini 3.8 Flash · Instant WhatsApp & Signal sharing
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Popular Category Themes:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SUGGESTIONS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = themeInput.toLowerCase() === preset.theme.toLowerCase();
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSelectPreset(preset.theme)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs scale-102'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input */}
            <div>
              <label htmlFor="theme-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Or enter any custom topic or keyword:
              </label>
              <div className="relative">
                <input
                  id="theme-input"
                  type="text"
                  value={themeInput}
                  onChange={(e) => {
                    setThemeInput(e.target.value);
                    setErrorMessage(null);
                  }}
                  disabled={isLoading}
                  placeholder="e.g., Street Food, Romantic Ghazals, Exam Stress, Late Night Maggi..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Language vibe & Sticker count */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Dialogue Language:
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Hinglish">Hinglish (Chat style)</option>
                  <option value="Hindi">Hindi (Desi)</option>
                  <option value="English">English (Casual)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Number of Stickers:
                </label>
                <div className="flex gap-1.5">
                  {[4, 6, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      disabled={isLoading}
                      onClick={() => setGifCount(num)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        gifCount === num
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading || !themeInput.trim()}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white shadow-md hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Stickers...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate Category</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
