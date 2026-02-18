import { useCallback, useEffect, useRef, useState } from 'react';

function checkSpeechRecognitionSupport(): boolean {
  if (typeof window === 'undefined') return false;
  const API =
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
  return !!API;
}

export function useVoice(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    setIsSupported(checkSpeechRecognitionSupport());
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      onResult('[Голос не поддерживается в этом браузере. Напишите текст.]');
      return;
    }
    const rec = new SpeechRecognitionAPI();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'ru-RU';
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0][0].transcript;
      if (text) onResult(text);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synthRef.current = synth;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ru-RU';
    u.rate = 0.9;
    u.onend = () => {};
    synth.speak(u);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
  }, []);

  return { isListening, isSupported, startListening, stopListening, speak, stopSpeaking };
}
