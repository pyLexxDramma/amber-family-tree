import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export const VoiceControlGlobal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAiDemo = location.pathname === '/app' || location.pathname === '/ai-demo';
  const isMainOrAuth =
    location.pathname === '/' ||
    location.pathname === ROUTES.login ||
    location.pathname === ROUTES.register ||
    location.pathname === '/confirm-code' ||
    location.pathname === '/onboarding';

  const openAssistant = useCallback(() => {
    try {
      sessionStorage.setItem('ai-demo-play-welcome', '1');
    } catch {
      // ignore
    }
    navigate(ROUTES.app);
  }, [navigate]);

  if (isAiDemo) return null;
  if (isMainOrAuth) return null;

  return (
    <button
      type="button"
      onClick={openAssistant}
      aria-label="Голосовой помощник"
      className="fixed right-4 bottom-24 z-[100] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-foreground text-background hover:opacity-90"
    >
      <Mic className="h-6 w-6" />
    </button>
  );
}
