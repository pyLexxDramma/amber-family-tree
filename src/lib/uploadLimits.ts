const env = (key: string, fallback: number) => {
  const v = Number(String(import.meta.env[key] ?? fallback));
  return Number.isFinite(v) && v > 0 ? Math.floor(v * 1_000_000) : Math.floor(fallback * 1_000_000);
};

export const MAX_PHOTO_BYTES = env('VITE_MAX_PHOTO_MB', 20);
export const MAX_VIDEO_BYTES = env('VITE_MAX_VIDEO_MB', 500);
export const MAX_AUDIO_BYTES = env('VITE_MAX_AUDIO_MB', 100);
export const MAX_DOCUMENT_BYTES = env('VITE_MAX_DOCUMENT_MB', 100);

export const MAX_SIZES: Record<string, number> = {
  photo: MAX_PHOTO_BYTES,
  video: MAX_VIDEO_BYTES,
  audio: MAX_AUDIO_BYTES,
  document: MAX_DOCUMENT_BYTES,
};

export function getMaxBytesForContentType(contentType: string): number {
  if (contentType.startsWith('image/')) return MAX_PHOTO_BYTES;
  if (contentType.startsWith('video/')) return MAX_VIDEO_BYTES;
  if (contentType.startsWith('audio/')) return MAX_AUDIO_BYTES;
  return MAX_DOCUMENT_BYTES;
}

export function getMaxBytesForPublicationType(type: string): number {
  return MAX_SIZES[type] ?? MAX_DOCUMENT_BYTES;
}
