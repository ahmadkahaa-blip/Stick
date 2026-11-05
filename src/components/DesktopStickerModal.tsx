import React, { useState } from 'react';
import { X, Check, Link, ExternalLink, Download, Film } from 'lucide-react';
import { GifItem } from '../types/gif';
import { downloadGif, copyGifLink, getGifFilename } from '../utils/shareUtils';

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
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !gif) return null;

  const isWhatsApp = targetApp === 'whatsapp';
  const appName = isWhatsApp ? 'WhatsApp Web' : 'Signal';
  const appUrl = isWhatsApp ? 'https://web.whatsapp.com' : 'https://signal.org';
  const filename = getGifFilename(gif);

  const handleOpenApp = () => {
    window.open(appUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    downloadGif(gif);
  };

  const handleCopyLink = async () => {
    const success = await copyGifLink(gif.url);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
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

        {/* GIF Preview & Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-28 h-28 aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800/60 p-3 mb-3.5 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
            <img
              src={gif.url}
              alt={gif.title}
              className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
            />
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-emerald-500 text-white shadow-md">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2 border border-amber-500/30">
            <Film className="w-3.5 h-3.5 text-amber-500" />
            <span>Animated GIF Ready!</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Send Animated GIF in {appName}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Downloaded file: <code className="font-mono text-amber-600 dark:text-amber-400 font-semibold">{filename}</code>
          </p>
        </div>

        {/* Step-by-step instructions to send as real GIF */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2.5">
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
              Drag & drop the downloaded <code className="font-mono text-amber-600 dark:text-amber-400">.gif</code> file into the chat window, or click <strong>📎 &gt; Photos & Videos</strong> and select it.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              3
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              Hit <strong>Send</strong> — it sends and plays as a looping animated GIF!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={handleOpenApp}
            className={`w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 ${
              isWhatsApp
                ? 'bg-[#25D366] hover:bg-[#20ba59]'
                : 'bg-[#3A76F0] hover:bg-[#2b65da]'
            }`}
          >
            <span>Open {appName}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .gif</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy GIF Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
