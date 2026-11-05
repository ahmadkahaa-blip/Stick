import React, { useState } from 'react';
import { GifItem } from '../types/gif';
import { X, Sparkles, Send, Share2, Check } from 'lucide-react';
import { shareToWhatsApp, shareToSignal } from '../utils/shareUtils';

interface BobbleheadStudioModalProps {
  onClose: () => void;
  onAddGif: (gif: GifItem) => void;
  onShowToast: (msg: string) => void;
}

const AVATAR_TEMPLATES = [
  { id: 'desi-swag', name: 'Desi Swag Guy', emoji: '😎', color: 'from-amber-400 to-orange-500' },
  { id: 'chai-lover', name: 'Chai Enthusiast', emoji: '☕', color: 'from-amber-600 to-yellow-700' },
  { id: 'cricket-hero', name: 'Cricket Superfan', emoji: '🏏', color: 'from-sky-500 to-blue-600' },
  { id: 'party-freak', name: 'Party Animal', emoji: '🥳', color: 'from-pink-500 to-purple-600' },
  { id: 'bollywood-star', name: 'Bollywood Hero', emoji: '🕺', color: 'from-rose-500 to-red-600' },
  { id: 'cool-dude', name: 'Savage Boss', emoji: '😼', color: 'from-emerald-500 to-teal-600' }
];

const PROPS_STICKERS = ['🕶️', '🧢', '☕', '🔥', '✨', '🏏', '👑', '🎉'];

export const BobbleheadStudioModal: React.FC<BobbleheadStudioModalProps> = ({
  onClose,
  onAddGif,
  onShowToast
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(AVATAR_TEMPLATES[0]);
  const [punchline, setPunchline] = useState('Aur Batao! Sab Shanti?');
  const [selectedProp, setSelectedProp] = useState('🕶️');
  const [bounceSpeed, setBounceSpeed] = useState<'normal' | 'fast' | 'slow'>('normal');
  const [textColor, setTextColor] = useState('#fbbf24'); // Amber/yellow comic color
  const [isSaved, setIsSaved] = useState(false);

  // Generates an animated SVG data URI capturing the user's custom bobblehead
  const generateSvgGifUri = () => {
    const dur = bounceSpeed === 'fast' ? '0.4s' : bounceSpeed === 'slow' ? '1.2s' : '0.8s';
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.5"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" rx="24" fill="url(#bg)"/>
      <circle cx="200" cy="200" r="140" fill="#312e81" opacity="0.4"/>
      
      <!-- Bobble Head Animation -->
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0,-14; 0,0"
          dur="${dur}"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
        />
        <text x="200" y="190" font-size="100" text-anchor="middle" filter="url(#shadow)">${selectedTemplate.emoji}</text>
        <text x="240" y="140" font-size="45">${selectedProp}</text>
      </g>

      <!-- Comic Punchline Bubble -->
      <rect x="20" y="290" width="360" height="70" rx="16" fill="#000" opacity="0.65"/>
      <text x="200" y="336" font-family="sans-serif" font-weight="800" font-size="20" fill="${textColor}" text-anchor="middle">
        ${punchline.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </text>
      <text x="200" y="380" font-family="sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">
        BOBBLE AI STICKER
      </text>
    </svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  };

  const handleSaveToLibrary = () => {
    const dataUri = generateSvgGifUri();
    const newGif: GifItem = {
      id: `bobble-studio-${Date.now()}`,
      title: `${selectedTemplate.name} - ${punchline.slice(0, 20)}`,
      dialogue: punchline,
      category: 'Custom Added',
      mood: 'Excited',
      language: 'Hindi',
      url: dataUri,
      tags: ['bobblehead', 'custom meme', 'studio'],
      isCustom: true,
      source: 'Bobblehead Studio Creator',
      views: 1,
      likes: 1
    };

    onAddGif(newGif);
    setIsSaved(true);
    onShowToast('Saved Bobblehead to your GIF Hub!');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleQuickWhatsApp = async () => {
    const dataUri = generateSvgGifUri();
    const tempGif: GifItem = {
      id: 'temp',
      title: punchline,
      dialogue: punchline,
      category: 'Trending',
      url: dataUri,
      tags: [],
      language: 'Hinglish',
      mood: 'Happy',
      source: 'Bobble Studio'
    };
    onShowToast('Sending your Bobblehead to WhatsApp...');
    await shareToWhatsApp(tempGif);
  };

  const handleQuickSignal = async () => {
    const dataUri = generateSvgGifUri();
    const tempGif: GifItem = {
      id: 'temp',
      title: punchline,
      dialogue: punchline,
      category: 'Trending',
      url: dataUri,
      tags: [],
      language: 'Hinglish',
      mood: 'Happy',
      source: 'Bobble Studio'
    };
    onShowToast('Sending your Bobblehead to Signal...');
    await shareToSignal(tempGif);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Bobblehead Meme Studio
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create animated bobblehead stickers and send to WhatsApp & Signal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Body: 2 Columns */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
          {/* Left Column: Live Animated Canvas */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-black p-4 flex flex-col items-center justify-between shadow-inner border border-slate-800 overflow-hidden">
              <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
                Bobble Animation Preview
              </span>

              {/* Bouncing Head */}
              <div
                className={`relative flex flex-col items-center transition-all ${
                  bounceSpeed === 'fast'
                    ? 'animate-bounce'
                    : bounceSpeed === 'slow'
                    ? 'animate-pulse'
                    : 'animate-bounce'
                }`}
                style={{ animationDuration: bounceSpeed === 'fast' ? '0.6s' : bounceSpeed === 'slow' ? '1.5s' : '1s' }}
              >
                <span className="text-7xl filter drop-shadow-lg select-none">
                  {selectedTemplate.emoji}
                </span>
                <span className="absolute -top-2 -right-3 text-3xl">
                  {selectedProp}
                </span>
              </div>

              {/* Meme Punchline Bubble */}
              <div className="w-full bg-black/60 backdrop-blur-xs rounded-xl p-3 border border-white/10 text-center">
                <p
                  className="font-extrabold text-sm tracking-wide break-words line-clamp-2"
                  style={{ color: textColor }}
                >
                  {punchline || 'Type punchline below...'}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Bobblehead Animated Sticker
                </span>
              </div>
            </div>

            {/* Quick Share Strip */}
            <div className="w-full grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={handleQuickWhatsApp}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp</span>
              </button>
              <button
                onClick={handleQuickSignal}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#3A76F0] hover:bg-[#2b65da] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Send Signal</span>
              </button>
            </div>
          </div>

          {/* Right Column: Customizer Controls */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {/* Punchline text */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Custom Meme Dialogue / Punchline
              </label>
              <input
                type="text"
                value={punchline}
                onChange={(e) => setPunchline(e.target.value)}
                placeholder="e.g. Aur Batao! Sab Shanti?"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Choose Bobble Character
              </label>
              <div className="grid grid-cols-3 gap-2">
                {AVATAR_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      selectedTemplate.id === tpl.id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl">{tpl.emoji}</span>
                    <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {tpl.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Props / Accessory */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Add Bobble Accessory / Prop
              </label>
              <div className="flex items-center gap-2">
                {PROPS_STICKERS.map((prop) => (
                  <button
                    key={prop}
                    onClick={() => setSelectedProp(prop)}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-all ${
                      selectedProp === prop
                        ? 'border-amber-500 bg-amber-500/20 scale-110'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {prop}
                  </button>
                ))}
              </div>
            </div>

            {/* Color & Bounce Speed */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Punchline Color
                </label>
                <div className="flex items-center gap-2">
                  {['#fbbf24', '#f43f5e', '#38bdf8', '#34d399', '#ffffff'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className={`w-6 h-6 rounded-full border border-black/20 ${
                        textColor === color ? 'ring-2 ring-offset-2 ring-amber-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Bounce Speed
                </label>
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {(['slow', 'normal', 'fast'] as const).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setBounceSpeed(spd)}
                      className={`flex-1 py-1 text-[11px] font-semibold rounded-md capitalize transition-colors ${
                        bounceSpeed === spd
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={handleSaveToLibrary}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 rounded-xl shadow-sm transition-all"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                <span>Save to GIF Hub & Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
