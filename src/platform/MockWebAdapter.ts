import { PlatformAdapter, PlatformUser } from './types';

export class MockWebAdapter implements PlatformAdapter {
  platformName = 'web' as const;

  getUser(): PlatformUser | null {
    return { id: 'mock-user-1', firstName: 'Demo', lastName: 'User', username: 'demo' };
  }

  hapticFeedback(_type: 'light' | 'medium' | 'heavy' | 'success' | 'error'): void {
    // No-op in browser
  }

  async shareLink(url: string, text?: string): Promise<void> {
    if (navigator.share) {
      await navigator.share({ url, text });
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  close(): void { window.close(); }
  expandView(): void { /* no-op */ }
}
