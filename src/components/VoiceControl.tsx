import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';

const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');

type VoiceCommand = { path: string; patterns: RegExp[] };

const VOICE_COMMANDS: VoiceCommand[] = [
  { path: '/tree', patterns: [/\b(дерево|древо|family\s*tree|покажи\s*дерево)\b/, /\b(дерев[оа])\b/] },
  { path: '/feed', patterns: [/\b(лент[ауе]|новости|публикации|feed|что\s*нового)\b/, /\b(ленту|лента)\b/] },
  { path: '/family', patterns: [/\b(семь[яи]|семью|список|контакты|family|члены\s*семьи)\b/] },
  { path: '/my-profile', patterns: [/\b(профиль|мой\s*профиль|меня|обо\s*мне)\b/] },
  { path: '/store', patterns: [/\b(магазин|подписк[ау]|store|тарифы)\b/] },
  { path: '/create', patterns: [/\b(создать|добавить|новая\s*публикация|создай)\b/] },
  { path: '/ai-demo', patterns: [/\b(голос|анжело|angelo|помощник|ассистент|расскажи|покажи\s*дедушку)\b/, /\b(управляй|управление\s*голосом)\b/] },
];

function matchCommand(text: string): string | null {
  const t = normalize(text);
  for (const { path, patterns } of VOICE_COMMANDS) {
    if (patterns.some((p) => p.test(t))) return path;
  }
  return null;
}

export const VoiceControl: React.FC = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    const API =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!API) {
      return;
    }
    const rec = new API();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'ru-RU';
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const text = (e.results[0] && e.results[0][0]?.transcript) || '';
      const path = matchCommand(text);
      if (path) {
        navigate(path);
        if (path === '/ai-demo' && text) {
          try {
            sessionStorage.setItem('ai-demo-voice-query', text);
          } catch {
            // ignore
          }
        }
      } else if (text) {
        navigate('/ai-demo');
        try {
          sessionStorage.setItem('ai-demo-voice-query', text);
        } catch {
          // ignore
        }
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
  }, [navigate]);

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

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isListening ? 'Остановить запись' : 'Управление голосом'}
      className={`fixed right-4 bottom-24 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
        isListening
          ? 'bg-destructive/90 text-white animate-pulse scale-110'
          : 'bg-foreground text-background hover:opacity-90'
      }`}
    >
      <Mic className="h-6 w-6" />
    </button>
  );
}
