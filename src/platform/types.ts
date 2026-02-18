export interface PlatformUser {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
}

export interface PlatformAdapter {
  /** Get current platform user info */
  getUser(): PlatformUser | null;
  /** Trigger haptic feedback */
  hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error'): void;
  /** Share a link via platform native share */
  shareLink(url: string, text?: string): Promise<void>;
  /** Close the app / webview */
  close(): void;
  /** Expand the webview to full height */
  expandView(): void;
  /** Platform name for conditional logic */
  platformName: 'telegram' | 'web' | 'pwa';
}
