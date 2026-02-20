import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { currentSubscription, plans } from '@/data/mock-subscriptions';
import { mockMembers } from '@/data/mock-members';
import { ArrowLeft, Send, UserMinus, User } from 'lucide-react';
import { useDemoWithPhotos } from '@/hooks/useDemoWithPhotos';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PlacesPage: React.FC = () => {
  const navigate = useNavigate();
  const demoWithPhotos = useDemoWithPhotos();
  const currentPlan = plans.find(p => p.id === currentSubscription.planId)!;
  const usedPlaces = currentSubscription.usedPlaces;
  const maxPlaces = currentPlan.maxPlaces;
  const occupyingMembers = mockMembers.slice(0, usedPlaces);
  const [freeSlotId, setFreeSlotId] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="pt-4 pb-4 px-6 page-enter">
        <button onClick={() => navigate(-1)} className="touch-target mb-6 flex items-center gap-2 text-muted-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-primary/5 px-2 py-1 -ml-2">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium tracking-wide">Назад</span>
        </button>

        <h1 className="hero-title text-2xl mb-1">Места</h1>
        <p className="section-title text-primary/80 text-sm mb-6">занято {usedPlaces} из {maxPlaces}</p>

        <div className="space-y-3 mb-8 page-enter-stagger">
          {occupyingMembers.map(m => (
            <div key={m.id} className="content-card flex items-center gap-4 py-4 px-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-primary/10">
                {demoWithPhotos && (
                  <img src={`https://picsum.photos/seed/member${m.id}/96/96`} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                )}
                <div className={`h-full w-full flex items-center justify-center ${demoWithPhotos ? 'hidden' : ''}`}>
                  <User className="h-6 w-6 text-primary/60" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground">{m.nickname || m.firstName} {m.lastName}</p>
                <p className="text-xs font-medium text-muted-foreground/70">{m.firstName} {m.lastName}</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl border-2 text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors" onClick={() => setFreeSlotId(m.id)}>
                <UserMinus className="h-4 w-4 mr-1" /> Освободить место
              </Button>
            </div>
          ))}
        </div>

        {usedPlaces < maxPlaces && (
          <Button onClick={() => navigate(ROUTES.classic.invite)} className="content-card w-full min-h-[52px] rounded-2xl border-2 flex items-center justify-center gap-2 font-semibold hover:border-primary/40 transition-all">
            <Send className="h-5 w-5" /> Пригласить на место
          </Button>
        )}

        <AlertDialog open={!!freeSlotId} onOpenChange={() => setFreeSlotId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Освободить место?</AlertDialogTitle>
              <AlertDialogDescription>
                Участник перестанет занимать место в подписке. Его контент останется в семье, но для повторного доступа потребуется новое приглашение.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={() => setFreeSlotId(null)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Освободить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default PlacesPage;
