import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { currentSubscription, plans } from '@/data/mock-subscriptions';
import { mockMembers } from '@/data/mock-members';
import { ArrowLeft, Send, UserMinus, User } from 'lucide-react';
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
      <div className="pt-4 pb-4 px-6">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs tracking-widest uppercase font-light">Назад</span>
        </button>

        <h1 className="editorial-title text-2xl mb-2">Места</h1>
        <p className="editorial-caption text-muted-foreground mb-6">занято {usedPlaces} из {maxPlaces}</p>

        <div className="space-y-0 mb-8">
          {occupyingMembers.map(m => (
            <div key={m.id} className="flex items-center gap-4 py-4 border-b border-border/30 last:border-b-0">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-light tracking-wide">{m.nickname || m.firstName} {m.lastName}</p>
                <p className="text-xs text-muted-foreground/70">{m.firstName} {m.lastName}</p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-sm text-muted-foreground hover:text-destructive" onClick={() => setFreeSlotId(m.id)}>
                <UserMinus className="h-4 w-4 mr-1" /> Освободить место
              </Button>
            </div>
          ))}
        </div>

        {usedPlaces < maxPlaces && (
          <Button onClick={() => navigate(ROUTES.classic.invite)} className="w-full h-12 rounded-sm flex items-center justify-center gap-2">
            <Send className="h-4 w-4" /> Пригласить на место
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
