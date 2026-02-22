import React, { useCallback, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');

type VoiceAction =
  | { type: 'navigate'; path: string }
  | { type: 'back' }
  | { type: 'scroll'; direction: 'up' | 'down' }
  | { type: 'theme'; value: 'dark' | 'light' | 'toggle' }
  | { type: 'ai'; text: string };

const VOICE_MAP: { patterns: RegExp[]; action: VoiceAction }[] = [
  { patterns: [/^(назад|вернись|вернуться|обратно|back)$/], action: { type: 'back' } },
  { patterns: [/(пролистай|прокрути|листай|скролл)\s*(вверх|наверх|выше|up)/, /^(вверх|наверх|выше)$/], action: { type: 'scroll', direction: 'up' } },
  { patterns: [/(пролистай|прокрути|листай|скролл)\s*(вниз|ниже|дальше|down)?/, /^(вниз|ниже|дальше)$/], action: { type: 'scroll', direction: 'down' } },
  { patterns: [/(тёмн|темн|dark)\s*(тем|режим)?/], action: { type: 'theme', value: 'dark' } },
  { patterns: [/(светл|light)\s*(тем|режим)?/], action: { type: 'theme', value: 'light' } },
  { patterns: [/(смени|переключи|поменяй)\s*тем/], action: { type: 'theme', value: 'toggle' } },
  { patterns: [/(главная|на\s*главную|домой)/], action: { type: 'navigate', path: ROUTES.classic.tree } },
  { patterns: [/(открой|перейди)\s*(дерево|древо)/, /покажи\s*дерево/], action: { type: 'navigate', path: ROUTES.classic.tree } },
  { patterns: [/(открой|перейди)\s*(лент|feed|новости)/], action: { type: 'navigate', path: ROUTES.classic.feed } },
  { patterns: [/(открой|перейди)\s*(семь|контакт)/], action: { type: 'navigate', path: ROUTES.classic.family } },
  { patterns: [/(открой|перейди)\s*(профиль|мой\s*профиль)/], action: { type: 'navigate', path: ROUTES.classic.myProfile } },
  { patterns: [/(открой|перейди)\s*(магазин|store|подписк)/], action: { type: 'navigate', path: ROUTES.classic.store } },
  { patterns: [/(открой|перейди)\s*(настройки|settings)/], action: { type: 'navigate', path: ROUTES.classic.settings } },
  { patterns: [/(открой|перейди)\s*(помощь|поддержк|faq)/], action: { type: 'navigate', path: ROUTES.classic.help } },
  { patterns: [/(открой|перейди)\s*(создать|создание)/], action: { type: 'navigate', path: ROUTES.classic.create } },
  { patterns: [/(открой|перейди)\s*(пригла|invite)/], action: { type: 'navigate', path: ROUTES.classic.invite } },
];

function matchVoiceAction(text: string): VoiceAction | null {
  const t = normalize(text);
  for (const { patterns, action } of VOICE_MAP) {
    if (patterns.some((p) => p.test(t))) return action;
  }
  return null;
}

export const VoiceControlGlobal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isAiDemo = location.pathname === '/app' || location.pathname === '/ai-demo';
  const isMainOrAuth =
    location.pathname === '/' ||
    location.pathname === ROUTES.login ||
    location.pathname === ROUTES.register ||
    location.pathname === '/confirm-code' ||
    location.pathname === '/onboarding';

  const startListening = useCallback(() => {
    const API =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!API) return;
    const rec = new API();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'ru-RU';
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r?.[0]?.transcript) text += r[0].transcript;
      }
      text = text.trim() || (e.results[0]?.[0]?.transcript ?? '').trim();
      if (!text) return;

      const onApp = location.pathname === '/app' || location.pathname.startsWith('/ai-demo');
      if (onApp) return;

      const action = matchVoiceAction(text);
      if (action) {
        switch (action.type) {
          case 'back':
            toast('Назад');
            navigate(-1);
            return;
          case 'navigate':
            toast(`Открываю…`);
            navigate(action.path);
            return;
          case 'scroll':
            window.scrollBy({ top: (action.direction === 'up' ? -1 : 1) * window.innerHeight * 0.7, behavior: 'smooth' });
            toast(action.direction === 'up' ? 'Листаю вверх' : 'Листаю вниз');
            return;
          case 'theme': {
            const newTheme = action.value === 'toggle' ? (theme === 'dark' ? 'light' : 'dark') : action.value;
            setTheme(newTheme);
            toast(`Тема: ${newTheme === 'dark' ? 'тёмная' : 'светлая'}`);
            return;
          }
        }
      }

      navigate(ROUTES.app);
      try {
        sessionStorage.setItem('ai-demo-voice-query', text);
      } catch {
        // ignore
      }
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }, [navigate, location.pathname]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  if (isAiDemo) return null;
  if (isMainOrAuth) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isListening ? 'Остановить запись' : 'Управление голосом'}
      className={`fixed right-4 bottom-24 z-[100] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
        isListening
          ? 'bg-destructive/90 text-white animate-pulse scale-110'
          : 'bg-foreground text-background hover:opacity-90'
      }`}
    >
      <Mic className="h-6 w-6" />
    </button>
  );
}
