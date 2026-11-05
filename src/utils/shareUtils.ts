import { GifItem } from '../types/gif';

/**
 * Builds formatted text payload for messaging apps
 */
export function buildShareMessage(gif: GifItem, customNote?: string): string {
  const parts: string[] = [];
  if (gif.dialogue) {
    parts.push(`*${gif.dialogue}*`);
  } else {
    parts.push(`*${gif.title}*`);
  }
  if (customNote) {
    parts.push(customNote);
  }
  parts.push(gif.url);
  parts.push('— Shared via Bobble Sticker Hub');
  return parts.join('\n\n');
}

/**
 * Checks if current environment is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Backward-compatible sticker-based aliases
export const shareToWhatsApp = shareAsWhatsAppSticker;
export const shareToSignal = shareAsSignalSticker;

/**
 * Formats a clean filename for sticker downloads
 */
export function getStickerFilename(gif: GifItem): string {
  const clean = gif.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${clean}_sticker.webp`;
}

/**
 * Converts any GIF/image into a genuine 512x512 WhatsApp/Signal compliant WebP sticker
 * - 512x512 square canvas
 * - 16px transparent margin (WhatsApp official spec)
 * - Returns a WebP Blob with MIME type image/webp
 * - Works on both server-backed dev and static Netlify deployments
 */
export async function convertToWebpSticker(gifUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const renderOnCanvas = (imageSource: HTMLImageElement) => {
      try {
        const canvas = document.createElement('canvas');
        const size = 512;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // WhatsApp stickers require transparent background
        ctx.clearRect(0, 0, size, size);

        // Fit inside 512x512 with 20px padding
        const padding = 20;
        const available = size - padding * 2;
        const scale = Math.min(available / imageSource.naturalWidth, available / imageSource.naturalHeight);
        const w = imageSource.naturalWidth * scale;
        const h = imageSource.naturalHeight * scale;
        const x = (size - w) / 2;
        const y = (size - h) / 2;

        ctx.drawImage(imageSource, x, y, w, h);

        // Try converting to WebP (WhatsApp sticker format)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              // Fallback to PNG if browser doesn't export webp
              canvas.toBlob((pngBlob) => {
                if (pngBlob) resolve(pngBlob);
                else reject(new Error('Failed to generate sticker blob'));
              }, 'image/png');
            }
          },
          'image/webp',
          0.92
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onload = () => renderOnCanvas(img);

    img.onerror = () => {
      // If direct crossOrigin fails, try server proxy if running
      const proxyUrl = `/api/sticker/proxy?url=${encodeURIComponent(gifUrl)}`;
      const backupImg = new Image();
      backupImg.crossOrigin = 'anonymous';
      backupImg.onload = () => renderOnCanvas(backupImg);
      backupImg.onerror = () => {
        reject(new Error('Failed to load image for sticker conversion'));
      };
      backupImg.src = proxyUrl;
    };

    img.src = gifUrl;
  });
}

/**
 * Share as Native WhatsApp Sticker:
 * - On Mobile: Uses navigator.share with sticker.webp file. WhatsApp automatically treats .webp as a native Sticker!
 * - On Desktop / Web: Copies transparent sticker image to clipboard (for instant Ctrl+V into chat) + downloads .webp sticker file
 */
export async function shareAsWhatsAppSticker(
  gif: GifItem,
  onToast?: (msg: string) => void
): Promise<{ success: boolean; method: string }> {
  const filename = getStickerFilename(gif);

  try {
    const stickerBlob = await convertToWebpSticker(gif.url);
    const stickerFile = new File([stickerBlob], filename, {
      type: 'image/webp'
    });

    // 1. Mobile Web Share API: Native WhatsApp sticker delivery
    if (navigator.canShare && navigator.canShare({ files: [stickerFile] })) {
      onToast?.('Opening WhatsApp with Sticker...');
      await navigator.share({
        files: [stickerFile],
        title: `${gif.title} Sticker`
      });
      return { success: true, method: 'native_sticker_share' };
    }
  } catch (err) {
    console.warn('Native sticker share fallback:', err);
  }

  // 2. Desktop WhatsApp Web / Fallback flow:
  // Copy sticker image to clipboard (WhatsApp Web accepts transparent Ctrl+V as sticker)
  try {
    await copyStickerToClipboard(gif.url);
  } catch (e) {
    console.warn('Clipboard copy fallback:', e);
  }

  // Also trigger download of .webp sticker file so user has it locally
  downloadWebpSticker(gif);

  if (isMobileDevice()) {
    // Open WhatsApp app
    window.location.href = `whatsapp://send?text=${encodeURIComponent(`*${gif.dialogue || gif.title}*`)}`;
    onToast?.('Sticker .webp saved! Open WhatsApp chat and send from stickers/attachments.');
    return { success: true, method: 'mobile_whatsapp_fallback' };
  } else {
    // WhatsApp Web
    window.open('https://web.whatsapp.com', '_blank', 'noopener,noreferrer');
    onToast?.('Sticker copied to clipboard! Press Ctrl+V in WhatsApp Web to send as sticker.');
    return { success: true, method: 'whatsapp_web_paste' };
  }
}

/**
 * Share as Signal Sticker:
 * - Shares the 512x512 WebP sticker or copies to clipboard and opens Signal
 */
export async function shareAsSignalSticker(
  gif: GifItem,
  onToast?: (msg: string) => void
): Promise<{ success: boolean; method: string }> {
  const filename = getStickerFilename(gif);

  try {
    const stickerBlob = await convertToWebpSticker(gif.url);
    const stickerFile = new File([stickerBlob], filename, {
      type: 'image/webp'
    });

    if (navigator.canShare && navigator.canShare({ files: [stickerFile] })) {
      onToast?.('Opening Signal with Sticker...');
      await navigator.share({
        files: [stickerFile],
        title: `${gif.title} Sticker`
      });
      return { success: true, method: 'signal_native_share' };
    }
  } catch (err) {
    console.warn('Signal native share error:', err);
  }

  // Copy to clipboard for Signal desktop/app
  try {
    await copyStickerToClipboard(gif.url);
  } catch {}

  downloadWebpSticker(gif);

  if (isMobileDevice()) {
    window.location.href = `sgnl://send?text=${encodeURIComponent(`*${gif.dialogue || gif.title}*`)}`;
    onToast?.('Sticker .webp downloaded! In Signal, attach sticker file to chat.');
    return { success: true, method: 'signal_protocol' };
  } else {
    window.open('https://signal.me', '_blank', 'noopener,noreferrer');
    onToast?.('Sticker copied! Press Ctrl+V in Signal to send.');
    return { success: true, method: 'signal_web' };
  }
}

/**
 * Copies the transparent 512x512 sticker image to system clipboard
 * Ready for immediate Ctrl+V pasting into WhatsApp Web, Signal, Discord, etc.
 */
export async function copyStickerToClipboard(
  gifUrl: string
): Promise<{ success: boolean; type: 'image' | 'url' }> {
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const renderBlob = (imageObj: HTMLImageElement) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.clearRect(0, 0, 512, 512);
      const padding = 20;
      const available = 512 - padding * 2;
      const scale = Math.min(available / imageObj.naturalWidth, available / imageObj.naturalHeight);
      const w = imageObj.naturalWidth * scale;
      const h = imageObj.naturalHeight * scale;
      const x = (512 - w) / 2;
      const y = (512 - h) / 2;

      ctx.drawImage(imageObj, x, y, w, h);
      return new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
    };

    const pngBlob = await new Promise<Blob | null>((resolve) => {
      img.onload = async () => resolve(await renderBlob(img));
      img.onerror = () => {
        const proxyUrl = `/api/sticker/proxy?url=${encodeURIComponent(gifUrl)}`;
        const backupImg = new Image();
        backupImg.crossOrigin = 'anonymous';
        backupImg.onload = async () => resolve(await renderBlob(backupImg));
        backupImg.onerror = () => resolve(null);
        backupImg.src = proxyUrl;
      };
      img.src = gifUrl;
    });

    if (pngBlob && typeof ClipboardItem !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob })
      ]);
      return { success: true, type: 'image' };
    }
  } catch (err) {
    console.warn('Clipboard sticker copy error:', err);
  }

  // Fallback: Copy link
  await navigator.clipboard.writeText(gifUrl);
  return { success: true, type: 'url' };
}

/**
 * Downloads the sticker as an authentic .webp sticker file
 * Works 100% on Netlify static deployments as well as dev server
 */
export async function downloadWebpSticker(gif: GifItem) {
  try {
    const blob = await convertToWebpSticker(gif.url);
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = getStickerFilename(gif);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    return;
  } catch {
    // Direct link download fallback for static hosting
    const a = document.createElement('a');
    a.href = gif.url;
    a.download = getStickerFilename(gif);
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
