import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { Input } from '@/components/ui/input';
import { mockInvitations, mockIncomingInvitations } from '@/data/mock-invitations';
import { getMember } from '@/data/mock-members';
import { Copy, Share2, Check, Send, XCircle } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';
import { Button } from '@/components/ui/button';

const InviteFlow: React.FC = () => {
  const navigate = useNavigate();
  const platform = usePlatform();
  const [copied, setCopied] = useState<string | null>(null);
  const mockLink = 'https://angelo.app/invite/xyz789';
  const [view, setView] = useState<'invite' | 'list'>('invite');
  const [sentList, setSentList] = useState(mockInvitations);
  const [incomingList, setIncomingList] = useState(mockIncomingInvitations);

  const handleCopy = (link: string, id?: string) => {
    navigator.clipboard.writeText(link);
    setCopied(id ?? 'main');
    platform.hapticFeedback('success');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = () => platform.shareLink(mockLink, 'Присоединяйтесь к нашей семье в Angelo!');

  const handleCancelInvite = (id: string) => {
    setSentList(prev => prev.filter(inv => inv.id !== id));
  };

  const handleAccept = (inv: typeof incomingList[0]) => {
    setIncomingList(prev => prev.filter(i => i.id !== inv.id));
    navigate(ROUTES.classic.profile(inv.fromId));
  };

  const handleDecline = (id: string) => {
    setIncomingList(prev => prev.filter(i => i.id !== id));
  };

  if (view === 'list') {
    return (
      <AppLayout>
        <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
          <TopBar title="Приглашения" onBack={() => setView('invite')} light />
          <div className="mx-auto max-w-full px-4 pt-4 pb-8 sm:max-w-md md:max-w-2xl lg:max-w-4xl">
            {incomingList.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-semibold text-[var(--proto-active)] uppercase tracking-wider mb-3">Входящие</p>
                <div className="space-y-3">
                  {incomingList.map(inv => {
                    const from = getMember(inv.fromId);
                    return (
                      <div key={inv.id} className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] py-5 px-5 flex flex-col gap-2 min-h-[96px]">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-semibold text-[var(--proto-text)]">{from?.firstName} {from?.lastName}</p>
                            <p className="text-xs font-medium text-[var(--proto-text-muted)] mt-0.5">{new Date(inv.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="sm" className="rounded-xl border-2 h-9 text-xs font-semibold bg-[var(--proto-active)] text-white hover:opacity-90" onClick={() => handleAccept(inv)}>Принять</Button>
                            <Button variant="outline" size="sm" className="rounded-xl border-2 border-[var(--proto-border)] h-9 text-xs text-[var(--proto-text)]" onClick={() => handleDecline(inv.id)}>Отклонить</Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-xs font-semibold text-[var(--proto-active)] uppercase tracking-wider mb-3">Отправленные</p>
            <div className="space-y-3 mb-6">
              {sentList.map(inv => {
                const from = getMember(inv.fromId);
                return (
                  <div key={inv.id} className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] py-5 px-5 min-h-[96px]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-[var(--proto-text)]">{inv.toEmail || inv.toPhone}</p>
                        <p className="text-xs font-medium text-[var(--proto-text-muted)] mt-0.5">
                          {from?.firstName} · {new Date(inv.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-[var(--proto-active)] capitalize">{inv.status === 'sent' ? 'отправлено' : inv.status === 'accepted' ? 'принято' : inv.status}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleCopy(inv.link, inv.id)} className="text-xs font-medium text-[var(--proto-active)] hover:underline transition-colors flex items-center gap-1">
                        {copied === inv.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied === inv.id ? 'Скопировано' : 'Скопировать ещё раз'}
                      </button>
                      {inv.status === 'sent' && (
                        <button onClick={() => handleCancelInvite(inv.id)} className="text-xs font-medium text-red-600 hover:underline transition-colors flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Отменить
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button variant="outline" className="w-full min-h-[96px] rounded-2xl border-2 border-[var(--proto-active)] text-[var(--proto-active)] font-semibold hover:bg-[var(--proto-active)]/10 transition-all" onClick={() => setView('invite')}>
              Создать новое приглашение
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title="Пригласить" onBack={() => navigate(-1)} light />
        <div className="mx-auto max-w-full px-4 pt-4 pb-8 sm:max-w-md md:max-w-2xl lg:max-w-4xl">
          <p className="text-sm font-medium text-[var(--proto-text-muted)] mb-8">Отправьте ссылку близкому человеку</p>

          <div className="mb-10">
            <p className="text-xs font-semibold text-[var(--proto-active)] uppercase tracking-wider mb-3">Ссылка</p>
            <Input value={mockLink} readOnly className="rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-card)] font-medium w-full text-[var(--proto-text)] mb-4" />
            <div className="flex gap-3">
              <button onClick={() => handleCopy(mockLink)} className="rounded-xl bg-[var(--proto-card)] border-2 border-[var(--proto-border)] flex-1 min-h-[96px] flex items-center justify-center gap-2 text-[15px] font-semibold text-[var(--proto-text)] hover:border-[var(--proto-active)]/40 transition-all">
                {copied === 'main' ? <Check className="h-4 w-4 text-[var(--proto-active)]" /> : <Copy className="h-4 w-4" />}
                {copied === 'main' ? 'Скопировано' : 'Скопировать'}
              </button>
              <button onClick={handleShare} className="rounded-xl bg-[var(--proto-card)] border-2 border-[var(--proto-border)] flex-1 min-h-[96px] flex items-center justify-center gap-2 text-[15px] font-semibold text-[var(--proto-text)] hover:border-[var(--proto-active)]/40 transition-all">
                <Share2 className="h-4 w-4" /> Поделиться
              </button>
            </div>
          </div>

          <button onClick={() => navigate(ROUTES.classic.family)} className="w-full min-h-[96px] rounded-2xl border-2 bg-[var(--proto-text)] text-[var(--proto-bg)] text-[15px] font-semibold hover:opacity-90 transition-opacity mb-4">
            Готово
          </button>
          <button onClick={() => setView('list')} className="w-full justify-center gap-2 py-3 text-sm font-semibold text-[var(--proto-active)] flex items-center">
            <Send className="h-4 w-4" />
            <span>Отправленные приглашения</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default InviteFlow;
