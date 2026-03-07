import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { currentSubscription, plans } from '@/data/mock-subscriptions';
import { mockMembers, currentUserId } from '@/data/mock-members';
import { ArrowLeft, Send, UserMinus } from 'lucide-react';
import { getPrototypeAvatarUrl } from '@/lib/prototype-assets';
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
  const currentPlan = plans.find(p => p.id === currentSubscription.planId)!;
  const usedPlaces = currentSubscription.usedPlaces;
  const maxPlaces = currentPlan.maxPlaces;
  const occupyingMembers = mockMembers.slice(0, usedPlaces);
  const [freeSlotId, setFreeSlotId] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title="Места" onBack={() => navigate(-1)} light />
        <div className="mx-auto max-w-full px-4 pt-4 pb-4 sm:max-w-md md:max-w-2xl lg:max-w-4xl">
        <p className="text-sm text-[var(--proto-text-muted)] mb-6">занято {usedPlaces} из {maxPlaces}</p>

        <div className="space-y-3 mb-8">
          {occupyingMembers.map(m => (
            <div key={m.id} className="flex items-center gap-4 min-h-[96px] py-5 px-5 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)]">
              <button
                type="button"
                onClick={() => navigate(ROUTES.classic.profile(m.id))}
                className="h-12 w-12 rounded-full overflow-hidden bg-[var(--proto-bg)] flex-shrink-0 ring-2 ring-[var(--proto-active)]/20 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <img src={getPrototypeAvatarUrl(m.id, currentUserId)} alt="" className="h-full w-full object-cover" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-[var(--proto-text)]">{m.nickname || m.firstName} {m.lastName}</p>
                <p className="text-xs font-medium text-[var(--proto-text-muted)]">{m.firstName} {m.lastName}</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl border-2 text-[var(--proto-text-muted)] hover:text-destructive hover:border-destructive/50 transition-colors" onClick={() => setFreeSlotId(m.id)}>
                <UserMinus className="h-4 w-4 mr-1" /> Освободить место
              </Button>
            </div>
          ))}
        </div>

        {usedPlaces < maxPlaces && (
          <Button onClick={() => navigate(ROUTES.classic.invite)} className="w-full min-h-[96px] rounded-2xl border-2 border-[var(--proto-border)] flex items-center justify-center gap-2 font-semibold hover:border-[var(--proto-active)]/40 transition-all bg-[var(--proto-card)] text-[var(--proto-text)]">
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
      </div>
    </AppLayout>
  );
};

export default PlacesPage;
