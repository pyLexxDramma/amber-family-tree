import React, { useCallback, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');

type VoiceAction = { type: 'navigate'; path: string } | { type: 'back' };

const VOICE_MAP: { patterns: RegExp[]; action: VoiceAction }[] = [
  { patterns: [/(назад|вернуться|back)/], action: { type: 'back' } },
  { patterns: [/(главная|на\s*главную|домой|демо|смотреть\s*демо)/], action: { type: 'navigate', path: ROUTES.app } },
  { patterns: [/(дерево|древо|покажи\s*дерево)/], action: { type: 'navigate', path: ROUTES.classic.tree } },
  { patterns: [/(лент[ау]|новости|публикации|что\s*нового)/], action: { type: 'navigate', path: ROUTES.classic.feed } },
  { patterns: [/(семь[яи]|семью|список|контакты|члены\s*семьи)/], action: { type: 'navigate', path: ROUTES.classic.family } },
  { patterns: [/(профиль|мой\s*профиль|обо\s*мне)/], action: { type: 'navigate', path: ROUTES.classic.myProfile } },
  { patterns: [/(магазин|подписк[ау]|тарифы)/], action: { type: 'navigate', path: ROUTES.classic.store } },
  { patterns: [/(создать|добавить|новая\s*публикация)/], action: { type: 'navigate', path: ROUTES.classic.create } },
  { patterns: [/(настройки|настройки\s*аккаунта)/], action: { type: 'navigate', path: ROUTES.classic.settings } },
  { patterns: [/(помощь|поддержка|faq)/], action: { type: 'navigate', path: ROUTES.classic.help } },
  { patterns: [/(пригласить|приглашения|инвайт)/], action: { type: 'navigate', path: ROUTES.classic.invite } },
  { patterns: [/(голос|анжело|помощник|ассистент|управление\s*голосом|расскажи)/, /(покажи\s*дедушку)/], action: { type: 'navigate', path: ROUTES.app } },
  { patterns: [/(вход|войти|логин)/], action: { type: 'navigate', path: ROUTES.login } },
  { patterns: [/(регистрация|создать\s*аккаунт)/], action: { type: 'navigate', path: ROUTES.register } },
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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isAiDemo = location.pathname === '/app' || location.pathname === '/ai-demo';

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
      const text = (e.results[0] && e.results[0][0]?.transcript) || '';
      const action = matchVoiceAction(text);
      if (action) {
        if (action.type === 'back') {
          navigate(-1);
        } else {
          navigate(action.path);
          if (action.path === ROUTES.app && text) {
            try {
              sessionStorage.setItem('ai-demo-voice-query', text);
            } catch {}
          }
        }
      } else if (text && location.pathname !== '/app' && !location.pathname.startsWith('/ai-demo')) {
        navigate(ROUTES.app);
        try {
          sessionStorage.setItem('ai-demo-voice-query', text);
        } catch {}
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
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  if (isAiDemo) return null;

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
