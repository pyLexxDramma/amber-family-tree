import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Input } from '@/components/ui/input';
import { mockInvitations, mockIncomingInvitations } from '@/data/mock-invitations';
import { getMember } from '@/data/mock-members';
import { ArrowLeft, Copy, Share2, Check, Send, XCircle } from 'lucide-react';
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
      <div className="min-h-screen bg-background px-0 pt-6 pb-8 page-enter">
        <button onClick={() => setView('invite')} className="touch-target mb-8 flex items-center gap-2 rounded-full bg-card shadow-sm hover:bg-secondary transition-colors px-3 py-2 font-semibold">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm tracking-wide">Назад</span>
        </button>

        <h1 className="hero-title font-serif text-2xl mb-6 px-3">Приглашения</h1>

        {incomingList.length > 0 && (
          <div className="mb-8 page-enter-stagger">
            <p className="section-title text-primary mb-3 px-3">Входящие</p>
            <div className="space-y-3">
              {incomingList.map(inv => {
                const from = getMember(inv.fromId);
                return (
                  <div key={inv.id} className="content-card py-5 px-5 flex flex-col gap-2 min-h-[96px]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-foreground">{from?.firstName} {from?.lastName}</p>
                        <p className="text-xs font-medium text-muted-foreground/70 mt-0.5">{new Date(inv.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="default" size="sm" className="rounded-xl border-2 h-9 text-xs font-semibold" onClick={() => handleAccept(inv)}>Принять</Button>
                        <Button variant="outline" size="sm" className="rounded-xl border-2 h-9 text-xs" onClick={() => handleDecline(inv.id)}>Отклонить</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="section-title text-primary mb-3 px-3">Отправленные</p>
        <div className="space-y-3 mb-6 page-enter-stagger">
          {sentList.map(inv => {
            const from = getMember(inv.fromId);
            return (
              <div key={inv.id} className="content-card py-5 px-5 min-h-[96px]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-foreground">{inv.toEmail || inv.toPhone}</p>
                    <p className="text-xs font-medium text-muted-foreground/70 mt-0.5">
                      {from?.firstName} · {new Date(inv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary/80 capitalize">{inv.status === 'sent' ? 'отправлено' : inv.status === 'accepted' ? 'принято' : inv.status}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleCopy(inv.link, inv.id)} className="text-xs font-medium text-primary/80 hover:text-primary transition-colors flex items-center gap-1">
                    {copied === inv.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied === inv.id ? 'Скопировано' : 'Скопировать ещё раз'}
                  </button>
                  {inv.status === 'sent' && (
                    <button onClick={() => handleCancelInvite(inv.id)} className="text-xs font-medium text-destructive/70 hover:text-destructive transition-colors flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Отменить
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Button variant="outline" className="content-card w-full min-h-[96px] rounded-2xl border-2 font-semibold hover:border-primary/40 transition-all" onClick={() => setView('invite')}>
          Создать новое приглашение
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-0 pt-6 pb-8 page-enter">
      <button onClick={() => navigate(-1)} className="touch-target mb-8 flex items-center gap-2 rounded-full bg-card shadow-sm hover:bg-secondary transition-colors px-3 py-2 font-semibold">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm tracking-wide">Назад</span>
      </button>

      <h1 className="hero-title font-serif text-2xl mb-2 px-3">Пригласить</h1>
      <p className="text-sm font-medium text-muted-foreground mb-8 px-3">Отправьте ссылку близкому человеку</p>

      <div className="mb-10 page-enter-stagger">
        <p className="section-title text-primary mb-3 px-3">Ссылка</p>
        <div className="px-3"><Input value={mockLink} readOnly className="rounded-xl border-2 mb-4 bg-muted/50 font-medium w-full" /></div>
        <div className="flex gap-3">
          <button onClick={() => handleCopy(mockLink)} className="content-card flex-1 min-h-[96px] rounded-2xl border-2 flex items-center justify-center gap-2 text-[15px] font-semibold hover:border-primary/40 hover:shadow-md transition-all">
            {copied === 'main' ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            {copied === 'main' ? 'Скопировано' : 'Скопировать'}
          </button>
          <button onClick={handleShare} className="content-card flex-1 min-h-[96px] rounded-2xl border-2 flex items-center justify-center gap-2 text-[15px] font-semibold hover:border-primary/40 hover:shadow-md transition-all">
            <Share2 className="h-4 w-4" /> Поделиться
          </button>
        </div>
      </div>

      <button onClick={() => navigate(ROUTES.classic.family)} className="content-card w-full min-h-[96px] rounded-2xl border-2 bg-foreground text-background text-[15px] font-semibold hover:bg-foreground/90 transition-all mb-4">
        Готово
      </button>
      <button onClick={() => setView('list')} className="link-row-warm w-full justify-center gap-2 py-3 text-sm font-semibold text-primary/90">
        <Send className="h-4 w-4 link-row-icon" />
        <span>Отправленные приглашения</span>
      </button>
    </div>
  );
};

export default InviteFlow;
