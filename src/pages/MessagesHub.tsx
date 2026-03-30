import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { api } from '@/integrations/api';
import { isDemoMode } from '@/lib/demoMode';
import { mockMembers, currentUserId } from '@/data/mock-members';
import type { FamilyMember } from '@/types';
import { toast } from '@/hooks/use-toast';
import { buildMessageGroups } from '@/lib/messageGroups';

const nameOf = (m: FamilyMember & { first_name?: string; last_name?: string }) =>
  `${(m as { firstName?: string }).firstName ?? m.first_name ?? ''} ${(m as { lastName?: string }).lastName ?? m.last_name ?? ''}`.trim();

const MessagesHub: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isDemoMode());
  const [tab, setTab] = useState<'personal' | 'groups'>('personal');

  useEffect(() => {
    if (isDemoMode()) {
      setMembers(mockMembers);
      setMyId(currentUserId);
      setLoading(false);
      return;
    }
    api.profile
      .getMyProfile()
      .then(m => setMyId(m?.id ?? null))
      .catch(() => {
        api.auth.me().then(u => setMyId(u?.member?.id ?? null)).catch(() => {});
      });
    api.family
      .listMembers()
      .then(setMembers)
      .catch(() => {
        setMembers([]);
        toast({ title: 'Не удалось загрузить семью' });
      })
      .finally(() => setLoading(false));
  }, []);

  const others = members.filter(m => m.id !== myId);
  const groups = buildMessageGroups(members, myId);

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title="Сообщения" onBack={() => navigate(-1)} light />
        <div className="mx-auto max-w-md px-3 pt-4 pb-28 sm:px-5">
          <div className="mb-4 flex gap-2 border-b border-[var(--proto-border)]">
            <button
              type="button"
              onClick={() => setTab('personal')}
              className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                tab === 'personal' ? 'text-[var(--proto-text)] border-[var(--proto-active)]' : 'text-[var(--proto-text-muted)] border-transparent'
              }`}
            >
              Личные
            </button>
            <button
              type="button"
              onClick={() => setTab('groups')}
              className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                tab === 'groups' ? 'text-[var(--proto-text)] border-[var(--proto-active)]' : 'text-[var(--proto-text-muted)] border-transparent'
              }`}
            >
              Группы
            </button>
          </div>
          <p className="text-sm text-[var(--proto-text-muted)] mb-4">
            {tab === 'personal' ? 'Выберите родственника, чтобы открыть переписку.' : 'Выберите группу семьи.'}
          </p>
          {loading ? (
            <p className="text-sm text-[var(--proto-text-muted)]">Загрузка…</p>
          ) : tab === 'personal' && others.length === 0 ? (
            <p className="text-sm text-[var(--proto-text-muted)]">Нет других членов семьи для чата.</p>
          ) : tab === 'groups' && groups.length === 0 ? (
            <p className="text-sm text-[var(--proto-text-muted)]">Недостаточно участников для группового чата.</p>
          ) : (
            <ul className="space-y-2">
              {tab === 'personal'
                ? others.map(m => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.classic.messages(m.id))}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] text-left hover:border-[var(--proto-active)]/25 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-[var(--proto-active)]/15 flex items-center justify-center shrink-0">
                          <MessageCircle className="h-5 w-5 text-[var(--proto-active)]" />
                        </div>
                        <span className="text-sm font-medium text-[var(--proto-text)]">{nameOf(m) || 'Без имени'}</span>
                      </button>
                    </li>
                  ))
                : groups.map(g => (
                    <li key={g.id}>
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.classic.messagesGroup(g.id))}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] text-left hover:border-[var(--proto-active)]/25 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-[var(--proto-active)]/15 flex items-center justify-center shrink-0">
                          <MessageCircle className="h-5 w-5 text-[var(--proto-active)]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[var(--proto-text)]">{g.title}</div>
                          <div className="text-xs text-[var(--proto-text-muted)]">{g.memberIds.length} участников</div>
                        </div>
                      </button>
                    </li>
                  ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default MessagesHub;
