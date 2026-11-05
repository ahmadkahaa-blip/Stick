import React from 'react';
import { X, CheckCircle2, Smartphone, Monitor, ShieldCheck, Zap } from 'lucide-react';

interface MessengerGuideModalProps {
  onClose: () => void;
}

export const MessengerGuideModal: React.FC<MessengerGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>WhatsApp & Signal Sharing Guide</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              How to send Bobble GIFs smoothly on mobile and desktop
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs text-slate-600 dark:text-slate-300">
          {/* WhatsApp Section */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-[#25D366] text-white flex items-center justify-center">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Sharing to WhatsApp
              </h3>
            </div>
            <ul className="space-y-2 mt-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>1-Tap Share:</strong> Tap the green WhatsApp button on any card or detail page. It directly launches your WhatsApp chat contact picker with the GIF dialogue and playable animated link!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>WhatsApp Web (Desktop):</strong> Click <em>"Copy Image"</em> on any GIF, then switch to your WhatsApp Web tab and press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">Ctrl + V</kbd> (or Cmd + V). WhatsApp instantly pastes it as an image/sticker!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>From Mobile Phone:</strong> If browsing on desktop, click the <em>"QR Code"</em> icon on any GIF and scan it with your phone's camera to open WhatsApp directly on your device.
                </span>
              </li>
            </ul>
          </div>

          {/* Signal Section */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-[#3A76F0] text-white flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Sharing to Signal (Private & Encrypted)
              </h3>
            </div>
            <ul className="space-y-2 mt-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>1-Tap Signal Button:</strong> Automatically opens Signal deep-link (<code className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1 rounded">sgnl://send</code>) and simultaneously copies the image blob to your clipboard.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Signal Desktop / Mobile Paste:</strong> Click <em>"Copy Image"</em>, open any Signal conversation, and paste directly. Signal renders animated GIFs inline with automatic looping!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Direct File Attachment:</strong> You can also click <em>"Download (.gif)"</em> and drag the file into your Signal chat window for zero-compression original animation quality.
                </span>
              </li>
            </ul>
          </div>

          {/* Desktop vs Mobile tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-1">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span>Mobile Devices</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Uses native deep links and the Web Share API to attach the GIF directly into WhatsApp or Signal without leaving your chat stream.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-1">
                <Monitor className="w-4 h-4 text-indigo-500" />
                <span>Desktop Browsers</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Copies real image blobs directly to system clipboard so you can paste with Ctrl+V into WhatsApp Web, Signal Desktop, or Telegram.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 rounded-lg transition-colors"
          >
            Got it, Let's Share!
          </button>
        </div>
      </div>
    </div>
  );
};
