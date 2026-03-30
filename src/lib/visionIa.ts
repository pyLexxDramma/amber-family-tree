import { ROUTES } from '@/constants/routes';

export function isVisionIANavEnabled(): boolean {
  return import.meta.env.VITE_VISION_IA_NAV === 'true';
}

export function visionDefaultClassicPath(): string {
  if (
    isVisionIANavEnabled() &&
    import.meta.env.VITE_VISION_IA_HOME === 'messages'
  ) {
    return ROUTES.classic.messagesHub;
  }
  return ROUTES.classic.tree;
}

export function classicPathIsPrototype(pathname: string): boolean {
  const paths = [
    ROUTES.classic.feed,
    ROUTES.classic.family,
    ROUTES.classic.store,
    ROUTES.classic.tree,
    ROUTES.classic.timeline,
    ROUTES.classic.create,
    ROUTES.classic.myMedia,
    ROUTES.classic.albums,
    ROUTES.classic.messagesHub,
    '/classic/publication',
    '/classic/albums',
  ];
  if (pathname === ROUTES.classic.messagesHub || pathname.startsWith('/classic/messages/') || pathname.startsWith('/classic/messages-group/')) {
    return true;
  }
  return paths.some(p => pathname === p || pathname.startsWith(p + '/'));
}
