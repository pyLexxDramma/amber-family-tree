import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { api } from '@/integrations/api';
import type { ContactRequest, FamilyMember } from '@/types';
import { ROUTES } from '@/constants/routes';
import { toast } from '@/hooks/use-toast';

interface RequestWithMember extends ContactRequest {
  fromMember?: FamilyMember | null;
}

const ContactRequests: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<RequestWithMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.contactRequests.listIncoming();
        const withMembers: RequestWithMember[] = [];
        for (const r of list) {
          const m = await api.family.getMember(r.fromMemberId);
          withMembers.push({ ...r, fromMember: m });
        }
        if (!cancelled) setItems(withMembers);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAccept = async (id: string, fromId: string) => {
    await api.contactRequests.accept(id);
    toast({ title: 'Контакт одобрен' });
    setItems(v => v.filter(x => x.id !== id));
    navigate(ROUTES.classic.messages(fromId));
  };

  const handleReject = async (id: string) => {
    await api.contactRequests.reject(id);
    toast({ title: 'Запрос отклонён' });
    setItems(v => v.filter(x => x.id !== id));
  };

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title="Запросы контакта" onBack={() => navigate(-1)} light />
        <div className="mx-auto max-w-full px-3 pt-3 pb-24 sm:max-w-md sm:px-5">
          {loading && (
            <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-4 text-sm text-[var(--proto-text-muted)]">
              Загрузка…
            </div>
          )}
          {!loading && items.length === 0 && (
            <div className="py-10 text-center text-sm text-[var(--proto-text-muted)]">
              Нет новых запросов
            </div>
          )}
          <div className="space-y-3">
            {items.map((r) => {
              const name =
                r.fromMember
                  ? `${r.fromMember.firstName} ${r.fromMember.lastName}`.trim()
                  : 'Участник';
              return (
                <div
                  key={r.id}
                  className="rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-4 flex flex-col gap-3"
                >
                  <div className="text-sm text-[var(--proto-text)]">
                    {name} хочет установить контакт
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAccept(r.id, r.fromMemberId)}
                      className="flex-1 h-10 rounded-xl bg-[var(--proto-active)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Одобрить
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(r.id)}
                      className="flex-1 h-10 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)] text-sm font-semibold hover:border-[var(--proto-active)]/40 transition-colors"
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ContactRequests;

