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
      <div className="min-h-screen bg-background px-6 pt-6 pb-8">
        <button onClick={() => setView('invite')} className="mb-8 flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs tracking-widest uppercase font-light">Назад</span>
        </button>

        <h1 className="editorial-title text-2xl mb-6">Приглашения</h1>

        {incomingList.length > 0 && (
          <div className="mb-8">
            <p className="editorial-caption text-muted-foreground mb-3">Входящие</p>
            <div className="space-y-0">
              {incomingList.map(inv => {
                const from = getMember(inv.fromId);
                return (
                  <div key={inv.id} className="py-4 border-b border-border/30 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-light tracking-wide">{from?.firstName} {from?.lastName}</p>
                        <p className="text-xs font-light text-muted-foreground/50 mt-0.5">{new Date(inv.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" className="rounded-sm h-8 text-xs" onClick={() => handleAccept(inv)}>Принять</Button>
                        <Button variant="ghost" size="sm" className="rounded-sm h-8 text-xs text-muted-foreground" onClick={() => handleDecline(inv.id)}>Отклонить</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="editorial-caption text-muted-foreground mb-3">Отправленные</p>
        <div className="space-y-0 mb-6">
          {sentList.map(inv => {
            const from = getMember(inv.fromId);
            return (
              <div key={inv.id} className="py-4 border-b border-border/30 last:border-b-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-light tracking-wide">{inv.toEmail || inv.toPhone}</p>
                    <p className="text-xs font-light text-muted-foreground/50 mt-0.5">
                      {from?.firstName} · {new Date(inv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="editorial-caption text-muted-foreground capitalize">{inv.status === 'sent' ? 'отправлено' : inv.status === 'accepted' ? 'принято' : inv.status}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleCopy(inv.link, inv.id)} className="text-xs font-light text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    {copied === inv.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied === inv.id ? 'Скопировано' : 'Скопировать ещё раз'}
                  </button>
                  {inv.status === 'sent' && (
                    <button onClick={() => handleCancelInvite(inv.id)} className="text-xs font-light text-destructive/70 hover:text-destructive transition-colors flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Отменить
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Button variant="outline" className="w-full rounded-sm h-11" onClick={() => { setView('invite'); }}>
          Создать новое приглашение
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 pt-6 pb-8">
      <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-xs tracking-widest uppercase font-light">Назад</span>
      </button>

      <h1 className="editorial-title text-2xl mb-2">Пригласить</h1>
      <p className="text-sm font-light text-muted-foreground mb-10">Отправьте ссылку близкому человеку</p>

      <div className="mb-10">
        <p className="editorial-caption text-muted-foreground mb-3">Ссылка</p>
        <Input
          value={mockLink}
          readOnly
          className="rounded-none border-0 border-b border-border bg-transparent px-0 text-sm font-light focus-visible:ring-0 mb-4"
        />
        <div className="flex gap-3">
          <button onClick={() => handleCopy(mockLink)} className="flex-1 h-11 border border-foreground/20 text-sm font-light tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300 flex items-center justify-center gap-2">
            {copied === 'main' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied === 'main' ? 'Скопировано' : 'Скопировать'}
          </button>
          <button onClick={handleShare} className="flex-1 h-11 border border-foreground/20 text-sm font-light tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300 flex items-center justify-center gap-2">
            <Share2 className="h-3.5 w-3.5" /> Поделиться
          </button>
        </div>
      </div>

      <button
        onClick={() => navigate(ROUTES.classic.family)}
        className="w-full h-12 bg-foreground text-background text-sm font-light tracking-widest uppercase hover:bg-foreground/80 transition-all duration-300 mb-4"
      >
        Готово
      </button>
      <button
        onClick={() => setView('list')}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
      >
        <Send className="h-3.5 w-3.5" />
        <span className="tracking-wider">Отправленные приглашения</span>
      </button>
    </div>
  );
};

export default InviteFlow;
