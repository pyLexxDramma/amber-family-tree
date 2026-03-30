import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { usePlatform } from '@/platform/PlatformContext';
import { api } from '@/integrations/api';
import type { FamilyMember, Message } from '@/types';
import { isMockUploadUrl } from '@/integrations/mockApi';
import { Paperclip } from 'lucide-react';

const displayNameOf = (m: FamilyMember | null) => {
  if (!m) return 'Сообщения';
  return m.nickname || `${m.firstName} ${m.lastName}`.trim() || 'Сообщения';
};

type MediaMsg = { kind: 'photo' | 'video' | 'audio' | 'document'; url: string; name?: string };

const parseMediaMessage = (text: string): MediaMsg | null => {
  const m = text.match(/^\[media:(photo|video|audio|document)\]([^\s|]+)(?:\|(.+))?$/);
  if (!m) return null;
  return { kind: m[1] as MediaMsg['kind'], url: m[2], name: m[3] };
};

const mediaPayload = (media: MediaMsg) => `[media:${media.kind}]${media.url}${media.name ? `|${media.name}` : ''}`;
const timeOf = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};
const mediaKindLabel: Record<MediaMsg['kind'], string> = {
  photo: 'Фото',
  video: 'Видео',
  audio: 'Аудио',
  document: 'Документ',
};

const Messages: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const platform = usePlatform();
  const [peer, setPeer] = useState<FamilyMember | null | undefined>(undefined);
  const [myId, setMyId] = useState<string | null>(null);
  const [items, setItems] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const title = useMemo(() => displayNameOf(peer ?? null), [peer]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) {
        setPeer(null);
        return;
      }
      try {
        const [p, me] = await Promise.all([
          api.family.getMember(id),
          api.profile.getMyProfile(),
        ]);
        if (cancelled) return;
        setPeer(p);
        setMyId(me.id);
      } catch {
        if (cancelled) return;
        setPeer(null);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      try {
        const list = await api.messages.listWith(id);
        if (cancelled) return;
        setItems(list);
      } catch {
        if (cancelled) return;
        setItems([]);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [items.length]);

  useEffect(() => {
    const draft = (searchParams.get('draft') || '').trim();
    if (!draft) return;
    setText((prev) => (prev.trim() ? prev : draft));
  }, [searchParams]);

  const send = async () => {
    const messageText = text.trim();
    if (!id || !messageText || isSending) return;
    setIsSending(true);
    try {
      const created = await api.messages.sendTo(id, messageText);
      setItems(v => [...v, created]);
      setText('');
      platform.hapticFeedback('light');
    } finally {
      setIsSending(false);
    }
  };

  const uploadAndSendMedia = async (file: File) => {
    if (!id || isUploading) return;
    setIsUploading(true);
    try {
      const contentType = file.type || 'application/octet-stream';
      const presign = await api.media.presign({
        filename: file.name,
        content_type: contentType,
        file_size_bytes: file.size,
      });
      if (!isMockUploadUrl(presign.upload_url)) {
        const putRes = await fetch(presign.upload_url, {
          method: 'PUT',
          headers: { 'Content-Type': contentType },
          body: file,
        });
        if (!putRes.ok) throw new Error(`upload failed: ${putRes.status}`);
      }
      const major = contentType.split('/')[0];
      const kind: MediaMsg['kind'] = major === 'image' ? 'photo' : major === 'video' ? 'video' : major === 'audio' ? 'audio' : 'document';
      const created = await api.messages.sendTo(id, mediaPayload({ kind, url: presign.url, name: file.name }));
      setItems(v => [...v, created]);
      platform.hapticFeedback('light');
    } finally {
      setIsUploading(false);
    }
  };

  if (peer === undefined) {
    return (
      <AppLayout>
        <div className="prototype-screen p-6 text-center text-[var(--proto-text)] font-medium min-h-touch flex items-center justify-center">Загрузка…</div>
      </AppLayout>
    );
  }

  if (peer === null) {
    return (
      <AppLayout>
        <div className="prototype-screen p-6 text-center text-[var(--proto-text)] font-medium min-h-touch flex items-center justify-center">Контакт не найден</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideNav>
      <div className="prototype-screen min-h-screen min-h-[100dvh] bg-[var(--proto-bg)] flex flex-col">
        <TopBar title={title} onBack={() => navigate(-1)} light />
        <div className="flex-1 overflow-auto px-3 py-4 pb-24 space-y-2">
          {items.length === 0 && (
            <div className="py-10 text-center text-sm text-[var(--proto-text-muted)]">
              Напишите первое сообщение
            </div>
          )}
          {items.map((m) => {
            const mine = myId && m.senderId === myId;
            const media = parseMediaMessage(m.text);
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm border ${mine ? 'bg-[var(--proto-card)] border-[var(--proto-border)] text-[var(--proto-text)]' : 'bg-white/60 border-white/40 text-[var(--proto-text)]'}`}>
                  {media ? (
                    <div className="space-y-2">
                      <div className="text-[11px] uppercase tracking-wide text-[var(--proto-text-muted)]">
                        {mediaKindLabel[media.kind]}{media.name ? ` · ${media.name}` : ''}
                      </div>
                      {media.kind === 'photo' && <img src={media.url} alt="" className="max-w-[220px] rounded-xl" />}
                      {media.kind === 'video' && <video src={media.url} controls className="max-w-[220px] rounded-xl" />}
                      {media.kind === 'audio' && <audio src={media.url} controls className="max-w-[220px]" />}
                      {media.kind === 'document' && (
                        <a href={media.url} target="_blank" rel="noreferrer" className="underline">
                          {media.name || 'Документ'}
                        </a>
                      )}
                      {media.kind !== 'document' && (
                        <a href={media.url} target="_blank" rel="noreferrer" className="text-xs underline break-all">
                          {media.name || media.url}
                        </a>
                      )}
                    </div>
                  ) : (
                    m.text
                  )}
                  <div className="mt-1 text-[10px] text-[var(--proto-text-muted)] text-right">{timeOf(m.createdAt)}</div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <div className="px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] border-t border-[var(--proto-border)] bg-[var(--proto-bg)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 rounded-2xl bg-[var(--proto-card)] border-2 border-[color:var(--proto-active)]/35 p-2 shadow-sm focus-within:ring-2 focus-within:ring-[color:var(--proto-active)]/25 focus-within:border-[color:var(--proto-active)]/55"
          >
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Сообщение…"
              className="flex-1 h-10 px-3 text-sm bg-transparent text-[var(--proto-text)] placeholder:text-[var(--proto-text-muted)] focus:outline-none"
            />
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                uploadAndSendMedia(f).catch(() => {});
                e.currentTarget.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isSending}
              className="h-10 w-10 rounded-xl text-sm font-medium border border-[var(--proto-border)] text-[var(--proto-text)] hover:border-[var(--proto-active)]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center"
              aria-label="Прикрепить файл"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={!text.trim() || isSending || isUploading}
              className="h-10 px-4 rounded-xl text-sm font-medium bg-[var(--proto-active)] text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Загрузка…' : 'Отправить'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default Messages;

