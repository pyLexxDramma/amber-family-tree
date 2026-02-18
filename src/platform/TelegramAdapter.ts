import { PlatformAdapter, PlatformUser } from './types';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: { user?: { id: number; first_name?: string; last_name?: string; username?: string; photo_url?: string } };
        HapticFeedback?: { impactOccurred(s: string): void; notificationOccurred(s: string): void };
        close(): void;
        expand(): void;
      };
    };
  }
}

export class TelegramAdapter implements PlatformAdapter {
  platformName = 'telegram' as const;

  getUser(): PlatformUser | null {
    const u = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!u) return null;
    return { id: String(u.id), firstName: u.first_name, lastName: u.last_name, username: u.username, photoUrl: u.photo_url };
  }

  hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error'): void {
    const hf = window.Telegram?.WebApp?.HapticFeedback;
    if (!hf) return;
    if (['success', 'error'].includes(type)) hf.notificationOccurred(type);
    else hf.impactOccurred(type);
  }

  async shareLink(url: string, text?: string): Promise<void> {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text || '')}`;
    window.open(shareUrl, '_blank');
  }

  close(): void { window.Telegram?.WebApp?.close(); }
  expandView(): void { window.Telegram?.WebApp?.expand(); }
}
