import React, { useState } from 'react';
import { GifItem } from '../types/gif';
import { CheckCheck, Lock, Send, Smartphone, Sticker } from 'lucide-react';
import { shareAsWhatsAppSticker, shareAsSignalSticker } from '../utils/shareUtils';

interface ChatSimulatorProps {
  gif: GifItem;
  onShowToast: (msg: string) => void;
}

export const ChatSimulator: React.FC<ChatSimulatorProps> = ({ gif, onShowToast }) => {
  const [activePlatform, setActivePlatform] = useState<'whatsapp' | 'signal'>('whatsapp');
  const [customNote, setCustomNote] = useState('');
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSend = async () => {
    if (activePlatform === 'whatsapp') {
      await shareAsWhatsAppSticker(gif, onShowToast);
    } else {
      await shareAsSignalSticker(gif, onShowToast);
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Platform Switcher Header */}
      <div className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setActivePlatform('whatsapp')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
              activePlatform === 'whatsapp'
                ? 'bg-[#25D366] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>WhatsApp Sticker</span>
          </button>
          <button
            onClick={() => setActivePlatform('signal')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
              activePlatform === 'signal'
                ? 'bg-[#3A76F0] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Signal Sticker</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline-flex items-center gap-1">
          <Smartphone className="w-3.5 h-3.5" />
          <span>True Sticker Chat Preview</span>
        </span>
      </div>

      {/* Simulated Chat Screen */}
      <div
        className={`relative p-3 sm:p-5 min-h-[240px] sm:min-h-[290px] flex flex-col justify-end transition-colors ${
          activePlatform === 'whatsapp'
            ? 'bg-[#0b141a]'
            : 'bg-[#121214]'
        }`}
        style={{
          backgroundImage:
            activePlatform === 'whatsapp'
              ? 'radial-gradient(#1f2c34 1px, transparent 1px)'
              : 'none',
          backgroundSize: '16px 16px'
        }}
      >
        {/* Encryption Banner */}
        <div className="self-center mb-3 px-2.5 py-1 rounded-md bg-black/50 text-slate-400 text-[9px] sm:text-[10px] flex items-center gap-1.5 backdrop-blur-xs max-w-xs text-center border border-white/5">
          <Lock className="w-3 h-3 text-amber-400 shrink-0" />
          <span>
            {activePlatform === 'whatsapp'
              ? 'Sticker sent as native .webp sticker'
              : 'Sticker sent via Signal chat'}
          </span>
        </div>

        {/* Authentic WhatsApp / Signal Floating Sticker (No enclosing colored card) */}
        <div className="self-end flex flex-col items-end">
          <div className="relative group/sticker">
            {/* The transparent die-cut sticker itself */}
            <div className="relative w-36 sm:w-44 aspect-square flex items-center justify-center p-1">
              <img
                src={gif.url}
                alt={gif.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform hover:scale-105"
              />
            </div>

            {/* Floating Sticker Timestamp (WhatsApp style) */}
            <div className="absolute bottom-0 right-1 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[9px] text-white/80">
              <span>{currentTime}</span>
              <CheckCheck className="w-3 h-3 text-sky-400" />
            </div>
          </div>

          {/* Dialogue or custom caption shown right below */}
          {(customNote || gif.dialogue) && (
            <div className="mt-1 px-2.5 py-1 rounded-xl bg-[#005c4b] text-white text-[11px] font-medium shadow-xs max-w-xs text-right">
              {customNote || gif.dialogue}
            </div>
          )}
        </div>
      </div>

      {/* Quick Sticker Send Bar */}
      <div className="p-2 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
          placeholder={`Optional sticker caption for ${activePlatform === 'whatsapp' ? 'WhatsApp' : 'Signal'}...`}
          className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 min-w-0"
        />

        <button
          onClick={handleSend}
          className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors whitespace-nowrap shadow-xs active:scale-95 ${
            activePlatform === 'whatsapp'
              ? 'bg-[#25D366] hover:bg-[#20ba59]'
              : 'bg-[#3A76F0] hover:bg-[#2b65da]'
          }`}
        >
          <Sticker className="w-3.5 h-3.5" />
          <span>Send as {activePlatform === 'whatsapp' ? 'WhatsApp' : 'Signal'} Sticker</span>
        </button>
      </div>
    </div>
  );
};
