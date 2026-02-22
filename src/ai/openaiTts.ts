/**
 * Озвучка текста через OpenAI TTS.
 * В браузере запрос идёт на прокси (/api/openai), чтобы не светить ключ и обойти CORS.
 * Прокси настраивается в vite.config.ts (dev) или на бэкенде (prod).
 */

/** В dev Vite прокси /api/openai → api.openai.com, ключ подставляется на сервере */
export type OpenAIVoice = 'alloy' | 'ash' | 'coral' | 'echo' | 'fable' | 'onyx' | 'nova' | 'sage' | 'shimmer';

/**
 * Озвучить текст через OpenAI TTS (через прокси, ключ на сервере).
 * При ошибке (сеть, 4xx/5xx) — реджектит; вызывающий код делает fallback на браузерный голос.
 */
export async function speakWithOpenAI(
  text: string,
  _apiKey: string,
  options: SpeakWithOpenAIOptions = {}
): Promise<void> {
  if (!text?.trim()) {
    throw new Error('No text');
  }
  const { voice = 'nova', model = 'tts-1', speed = 0.95, onAudio } = options;
  const base = import.meta.env.DEV
    ? '/api/openai'
    : (import.meta.env.VITE_OPENAI_PROXY_URL
        || (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-proxy` : null)
        || 'https://tocjbyeybddsfihvqbrk.supabase.co/functions/v1/openai-proxy');
  const res = await fetch(`${base}/v1/audio/speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      input: text.slice(0, 4096),
      voice,
      speed,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI TTS: ${res.status} ${err}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    onAudio?.(audio);
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    audio.play().catch(reject);
  });
}

export type SpeakWithOpenAIOptions = {
  voice?: OpenAIVoice;
  model?: string;
  speed?: number;
  /** Вызывается с созданным Audio до play(), чтобы можно было остановить воспроизведение снаружи */
  onAudio?: (audio: HTMLAudioElement) => void;
};
