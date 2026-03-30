import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { api } from '@/integrations/api';
import type { FamilyMember, Message } from '@/types';
import { buildMessageGroups } from '@/lib/messageGroups';
import { toast } from '@/hooks/use-toast';
import { isMockUploadUrl } from '@/integrations/mockApi';
import { Paperclip } from 'lucide-react';

type GroupMessage = Message & { peerId: string };
type MediaMsg = { kind: 'photo' | 'video' | 'audio' | 'document'; url: string; name?: string };

const nameOf = (m: FamilyMember | undefined) => (m ? `${m.firstName} ${m.lastName}`.trim() || m.nickname || 'Участник' : 'Участник');
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

const MessagesGroup: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [items, setItems] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [me, list] = await Promise.all([api.profile.getMyProfile(), api.family.listMembers()]);
        if (cancelled) return;
        setMyId(me.id);
        setMembers(list);
      } catch {
        if (!cancelled) {
          setMembers([]);
          setMyId(null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const groups = useMemo(() => buildMessageGroups(members, myId), [members, myId]);
  const group = useMemo(() => groups.find((g) => g.id === id) ?? null, [groups, id]);
  const membersMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!group) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const lists = await Promise.all(group.memberIds.map((peerId) => api.messages.listWith(peerId)));
        if (cancelled) return;
        const merged: GroupMessage[] = lists.flatMap((list, idx) => list.map((m) => ({ ...m, peerId: group.memberIds[idx] })));
        merged.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        setItems(merged);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [group]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [items.length]);

  const send = async () => {
    const messageText = text.trim();
    if (!group || !messageText || isSending) return;
    setIsSending(true);
    try {
      await Promise.all(group.memberIds.map((peerId) => api.messages.sendTo(peerId, messageText)));
      const now = new Date().toISOString();
      const optimistic = group.memberIds.map<GroupMessage>((peerId, idx) => ({
        id: `group-local-${now}-${idx}`,
        senderId: myId || '',
        recipientId: peerId,
        text: messageText,
        createdAt: now,
        peerId,
      }));
      setItems((v) => [...v, ...optimistic].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      setText('');
      toast({ title: 'Отправлено в групповой чат' });
    } catch {
      toast({ title: 'Не удалось отправить сообщение', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const uploadAndSendMedia = async (file: File) => {
    if (!group || isUploading) return;
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
      const payload = mediaPayload({ kind, url: presign.url, name: file.name });
      await Promise.all(group.memberIds.map((peerId) => api.messages.sendTo(peerId, payload)));
      const now = new Date().toISOString();
      const optimistic = group.memberIds.map<GroupMessage>((peerId, idx) => ({
        id: `group-local-media-${now}-${idx}`,
        senderId: myId || '',
        recipientId: peerId,
        text: payload,
        createdAt: now,
        peerId,
      }));
      setItems((v) => [...v, ...optimistic].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      toast({ title: 'Медиа отправлено в групповой чат' });
    } catch {
      toast({ title: 'Не удалось отправить медиа', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  if (!group) {
    return (
      <AppLayout>
        <div className="prototype-screen p-6 text-center text-[var(--proto-text)] font-medium min-h-touch flex items-center justify-center">
          Группа не найдена
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideNav>
      <div className="prototype-screen min-h-screen min-h-[100dvh] bg-[var(--proto-bg)] flex flex-col">
        <TopBar title={group.title} onBack={() => navigate(-1)} light />
        <div className="px-3 pt-2 text-xs text-[var(--proto-text-muted)]">
          Участники: {group.memberIds.map((x) => nameOf(membersMap.get(x))).join(', ')}
        </div>
        <div className="flex-1 overflow-auto px-3 py-4 pb-24 space-y-2">
          {loading ? (
            <div className="py-8 text-center text-sm text-[var(--proto-text-muted)]">Загрузка…</div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--proto-text-muted)]">Напишите первое сообщение в группу</div>
          ) : (
            items.map((m) => {
              const mine = myId && m.senderId === myId;
              const fromPeer = m.peerId;
              const media = parseMediaMessage(m.text);
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-2 text-sm border ${mine ? 'bg-[var(--proto-card)] border-[var(--proto-border)] text-[var(--proto-text)]' : 'bg-white/60 border-white/40 text-[var(--proto-text)]'}`}>
                    {!mine && <div className="mb-1 text-[10px] text-[var(--proto-text-muted)]">{nameOf(membersMap.get(fromPeer))}</div>}
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
            })
          )}
          <div ref={endRef} />
        </div>
        <div className="px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] border-t border-[var(--proto-border)] bg-[var(--proto-bg)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 rounded-2xl bg-[var(--proto-card)] border-2 border-[color:var(--proto-active)]/35 p-2 shadow-sm focus-within:ring-2 focus-within:ring-[color:var(--proto-active)]/25"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Сообщение в группу…"
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

export default MessagesGroup;
