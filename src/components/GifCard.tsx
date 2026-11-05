import React, { useState } from 'react';
import { GifItem } from '../types/gif';
import { Heart, Link, Download, Check, Sparkles, Film, Loader2 } from 'lucide-react';
import {
  shareAsWhatsAppGif,
  shareAsSignalGif,
  copyGifLink,
  downloadGif
} from '../utils/shareUtils';

interface GifCardProps {
  gif: GifItem;
  isFavorite: boolean;
  isStickerMode?: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (gif: GifItem) => void;
  onShowQr: (gif: GifItem) => void;
  onShowToast: (message: string) => void;
  onOpenDesktopModal?: (gif: GifItem, targetApp: 'whatsapp' | 'signal') => void;
}

export const GifCard: React.FC<GifCardProps> = ({
  gif,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onShowToast,
  onOpenDesktopModal
}) => {
  const [imageError, setImageError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleWhatsAppGif = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSharing(true);
    await shareAsWhatsAppGif(
      gif,
      onShowToast,
      onOpenDesktopModal ? () => onOpenDesktopModal(gif, 'whatsapp') : undefined
    );
    setIsSharing(false);
  };

  const handleSignalGif = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSharing(true);
    await shareAsSignalGif(
      gif,
      onShowToast,
      onOpenDesktopModal ? () => onOpenDesktopModal(gif, 'signal') : undefined
    );
    setIsSharing(false);
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyGifLink(gif.url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);

    if (success) {
      onShowToast('Direct GIF link copied! Paste into WhatsApp or Signal chat.');
    } else {
      onShowToast('Could not copy GIF link. Try WhatsApp or Download button.');
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadGif(gif);
    onShowToast('Downloading animated .gif...');
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(gif.id);
  };

  return (
    <div
      onClick={() => onSelect(gif)}
      className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer select-none"
    >
      {/* GIF Media Container */}
      <div className="relative aspect-square w-full bg-slate-100/70 dark:bg-slate-950 flex items-center justify-center overflow-hidden p-2">
        {!imageError ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={gif.url}
              alt={gif.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-108 drop-shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-indigo-500/10">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse mb-1" />
            <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
              {gif.title}
            </p>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-2 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-600 dark:text-slate-300 hover:text-rose-500 active:scale-90 shadow-xs backdrop-blur-xs transition-transform z-10"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
              isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : ''
            }`}
          />
        </button>

        {/* GIF Format Badge */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex items-center gap-1 text-[9px] font-extrabold text-amber-800 dark:text-amber-200 bg-amber-400/90 dark:bg-amber-500/90 border border-amber-500 px-1.5 py-0.5 rounded-md backdrop-blur-xs shadow-xs pointer-events-none tracking-wider">
          <Film className="w-3 h-3 text-slate-950 dark:text-slate-950" />
          <span className="text-slate-950 font-black">GIF</span>
        </div>

        {/* Category Pill Tag */}
        <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 text-[9px] font-semibold text-slate-600 dark:text-slate-400 bg-white/90 dark:bg-slate-900/90 px-1.5 py-0.5 rounded backdrop-blur-xs shadow-2xs pointer-events-none truncate max-w-[70%]">
          {gif.category}
        </div>
      </div>

      {/* Action Strip: True WhatsApp & Signal GIF Sharing */}
      <div className="p-1.5 sm:p-2 bg-slate-50 dark:bg-slate-900/95 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1 sm:gap-1.5">
        {/* WhatsApp GIF Button */}
        <button
          onClick={handleWhatsAppGif}
          disabled={isSharing}
          title="Send as animated GIF to WhatsApp"
          className="flex-1 min-w-0 flex items-center justify-center gap-1 py-1.5 px-1 sm:px-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white text-[10px] sm:text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
        >
          {isSharing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          )}
          <span className="truncate">WhatsApp GIF</span>
        </button>

        {/* Signal GIF Button */}
        <button
          onClick={handleSignalGif}
          disabled={isSharing}
          title="Send as animated GIF to Signal"
          className="flex-1 min-w-0 flex items-center justify-center gap-1 py-1.5 px-1 sm:px-2 rounded-lg bg-[#3A76F0] hover:bg-[#2b65da] active:scale-95 text-white text-[10px] sm:text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
        >
          {isSharing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.95.56 3.77 1.53 5.32L2 22l4.82-1.51C8.32 21.45 10.1 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z"/>
            </svg>
          )}
          <span className="truncate">Signal GIF</span>
        </button>

        {/* Copy GIF Link */}
        <button
          onClick={handleCopyLink}
          title="Copy direct GIF link"
          className="p-1.5 sm:p-2 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition-all"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link className="w-3.5 h-3.5" />}
        </button>

        {/* Download Animated GIF File */}
        <button
          onClick={handleDownload}
          title="Download animated GIF (.gif)"
          className="p-1.5 sm:p-2 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
