import React from 'react';
import { X, Check, Copy, ExternalLink, Download, Sticker } from 'lucide-react';
import { GifItem } from '../types/gif';
import { downloadWebpSticker } from '../utils/shareUtils';

interface DesktopStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  gif: GifItem | null;
  targetApp: 'whatsapp' | 'signal';
}

export const DesktopStickerModal: React.FC<DesktopStickerModalProps> = ({
  isOpen,
  onClose,
  gif,
  targetApp
}) => {
  if (!isOpen || !gif) return null;

  const isWhatsApp = targetApp === 'whatsapp';
  const appName = isWhatsApp ? 'WhatsApp Web' : 'Signal';
  const appUrl = isWhatsApp ? 'https://web.whatsapp.com' : 'https://signal.org';

  const handleOpenApp = () => {
    window.open(appUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    downloadWebpSticker(gif);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sticker Preview & Copied Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-28 h-28 aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800/60 p-3 mb-3.5 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
            <img
              src={gif.url}
              alt={gif.title}
              className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)]"
            />
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-emerald-500 text-white shadow-md">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2 border border-emerald-500/20">
            <Sticker className="w-3.5 h-3.5" />
            <span>Sticker Copied to Clipboard!</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Send Sticker in {appName}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            The actual sticker image is copied and the <code className="text-amber-600 dark:text-amber-400">.webp</code> file is downloaded.
          </p>
        </div>

        {/* Step-by-step instructions */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              1
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              Open your chat in <strong>{appName}</strong>.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              2
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-[11px]">Ctrl + V</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-[11px]">Cmd + V</kbd>) to paste the sticker directly!
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              3
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              Or drag & drop the downloaded <code className="text-amber-600 dark:text-amber-400">.webp</code> file right into the chat.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={handleOpenApp}
            className={`w-full flex-1 py-2.5 px-4 rounded-xl text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 ${
              isWhatsApp
                ? 'bg-[#25D366] hover:bg-[#20ba59]'
                : 'bg-[#3A76F0] hover:bg-[#2b65da]'
            }`}
          >
            <span>Open {appName}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDownload}
            className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save .webp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
