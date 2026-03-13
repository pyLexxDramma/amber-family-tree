import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { usePlatform } from '@/platform/PlatformContext';
import { api } from '@/integrations/api';
import type { FamilyMember, Message } from '@/types';

const displayNameOf = (m: FamilyMember | null) => {
  if (!m) return 'Сообщения';
  return m.nickname || `${m.firstName} ${m.lastName}`.trim() || 'Сообщения';
};

const Messages: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const platform = usePlatform();
  const [peer, setPeer] = useState<FamilyMember | null | undefined>(undefined);
  const [myId, setMyId] = useState<string | null>(null);
  const [items, setItems] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

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
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm border ${mine ? 'bg-[var(--proto-card)] border-[var(--proto-border)] text-[var(--proto-text)]' : 'bg-white/60 border-white/40 text-[var(--proto-text)]'}`}>
                  {m.text}
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
            <button
              type="submit"
              disabled={!text.trim() || isSending}
              className="h-10 px-4 rounded-xl text-sm font-medium bg-[var(--proto-active)] text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Отправить
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default Messages;

