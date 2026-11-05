import { GifItem } from '../types/gif';

/**
 * Checks if current environment is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Clean filename for sticker download
 */
export function getStickerFilename(gif: GifItem, ext: 'webp' | 'png' = 'webp'): string {
  const clean = gif.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${clean}_sticker.${ext}`;
}

/**
 * Gets a CORS-friendly URL for any GIF/sticker image
 * Prioritizes local proxy if running, falls back to weserv.nl global image proxy
 */
export function getCorsFriendlyUrl(originalUrl: string, output: 'webp' | 'png' = 'webp'): string {
  // If running locally with server proxy
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `/api/sticker/proxy?url=${encodeURIComponent(originalUrl)}`;
  }
  // Universal global image proxy that guarantees Access-Control-Allow-Origin: * and converts to requested format
  return `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}&output=${output}`;
}

/**
 * Fetches the actual image blob with CORS support
 */
export async function fetchStickerBlob(gifUrl: string, format: 'webp' | 'png' = 'webp'): Promise<Blob> {
  const primaryUrl = getCorsFriendlyUrl(gifUrl, format);

  try {
    const res = await fetch(primaryUrl);
    if (res.ok) {
      return await res.blob();
    }
  } catch (e) {
    console.warn('Primary sticker fetch failed, trying direct:', e);
  }

  // Backup direct fetch
  try {
    const res = await fetch(gifUrl);
    if (res.ok) {
      return await res.blob();
    }
  } catch (e) {
    console.warn('Direct fetch failed, trying weserv fallback:', e);
  }

  // Ultimate fallback
  const fallbackUrl = `https://images.weserv.nl/?url=${encodeURIComponent(gifUrl)}&output=${format}`;
  const res = await fetch(fallbackUrl);
  return await res.blob();
}

/**
 * Copies the actual sticker image binary to clipboard for instant Ctrl+V into WhatsApp Web / Signal
 */
export async function copyStickerToClipboard(gifUrl: string): Promise<{ success: boolean; type: 'image' | 'error' }> {
  try {
    const pngBlob = await fetchStickerBlob(gifUrl, 'png');

    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob })
      ]);
      return { success: true, type: 'image' };
    }
  } catch (err) {
    console.warn('Clipboard image copy error:', err);
  }

  return { success: false, type: 'error' };
}

/**
 * Downloads the actual sticker file
 */
export async function downloadWebpSticker(gif: GifItem) {
  try {
    const blob = await fetchStickerBlob(gif.url, 'webp');
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = getStickerFilename(gif, 'webp');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    const a = document.createElement('a');
    a.href = getCorsFriendlyUrl(gif.url, 'webp');
    a.download = getStickerFilename(gif, 'webp');
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

export type ShareResult = {
  success: boolean;
  method: 'native_share' | 'clipboard_desktop';
};

/**
 * Share as WhatsApp Sticker:
 * - On Mobile: Uses navigator.share with the actual WebP sticker file. WhatsApp opens and sends the ACTUAL STICKER!
 * - On Desktop: Copies actual sticker image to clipboard for instant Ctrl+V, downloads .webp, and opens helper modal.
 */
export async function shareAsWhatsAppSticker(
  gif: GifItem,
  onToast?: (msg: string) => void,
  onDesktopModal?: () => void
): Promise<ShareResult> {
  const filename = getStickerFilename(gif, 'webp');

  // 1. Mobile Native Share Sheet (attaches the actual image file to WhatsApp)
  if (navigator.canShare) {
    try {
      const blob = await fetchStickerBlob(gif.url, 'webp');
      const file = new File([blob], filename, { type: 'image/webp' });

      if (navigator.canShare({ files: [file] })) {
        onToast?.('Opening WhatsApp with your sticker image...');
        await navigator.share({
          files: [file],
          title: `${gif.title} Sticker`
        });
        return { success: true, method: 'native_share' };
      }
    } catch (err: any) {
      // User cancelled share or browser error
      if (err.name === 'AbortError') {
        return { success: true, method: 'native_share' };
      }
      console.warn('Native share failed, using clipboard flow:', err);
    }
  }

  // 2. Desktop Flow: Copy actual image to clipboard + download file
  onToast?.('Copying sticker image to clipboard...');
  await copyStickerToClipboard(gif.url);
  downloadWebpSticker(gif);

  if (onDesktopModal) {
    onDesktopModal();
  } else {
    onToast?.('Sticker copied! Press Ctrl+V in WhatsApp Web to send as sticker.');
    window.open('https://web.whatsapp.com', '_blank', 'noopener,noreferrer');
  }

  return { success: true, method: 'clipboard_desktop' };
}

/**
 * Share as Signal Sticker:
 * - On Mobile: Uses navigator.share with the actual sticker file. Signal attaches the ACTUAL STICKER!
 * - On Desktop: Copies sticker to clipboard and opens helper modal.
 */
export async function shareAsSignalSticker(
  gif: GifItem,
  onToast?: (msg: string) => void,
  onDesktopModal?: () => void
): Promise<ShareResult> {
  const filename = getStickerFilename(gif, 'webp');

  if (navigator.canShare) {
    try {
      const blob = await fetchStickerBlob(gif.url, 'webp');
      const file = new File([blob], filename, { type: 'image/webp' });

      if (navigator.canShare({ files: [file] })) {
        onToast?.('Opening Signal with your sticker image...');
        await navigator.share({
          files: [file],
          title: `${gif.title} Sticker`
        });
        return { success: true, method: 'native_share' };
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: true, method: 'native_share' };
      }
      console.warn('Native Signal share failed, using clipboard flow:', err);
    }
  }

  // Desktop Flow
  onToast?.('Copying sticker image to clipboard...');
  await copyStickerToClipboard(gif.url);
  downloadWebpSticker(gif);

  if (onDesktopModal) {
    onDesktopModal();
  } else {
    onToast?.('Sticker copied! Press Ctrl+V in Signal chat to send.');
    window.open('https://signal.org', '_blank', 'noopener,noreferrer');
  }

  return { success: true, method: 'clipboard_desktop' };
}

// Backward compatibility
export const shareToWhatsApp = shareAsWhatsAppSticker;
export const shareToSignal = shareAsSignalSticker;
export function buildShareMessage(gif: GifItem): string {
  return `*${gif.dialogue || gif.title}*`;
}
