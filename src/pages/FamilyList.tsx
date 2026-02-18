import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { AvatarPlaceholder } from '@/components/AvatarPlaceholder';
import { mockMembers, currentUserId } from '@/data/mock-members';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

const FamilyList: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'all' | 'active' | 'inactive'>('all');
  const filtered = mockMembers.filter(m => tab === 'all' || (tab === 'active' ? m.isActive : !m.isActive));

  return (
    <AppLayout>
      <div className="px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Family</h1>
          <Button size="sm" className="rounded-full" onClick={() => navigate('/invite')}>
            <Send className="h-3.5 w-3.5 mr-1" /> Invite
          </Button>
        </div>

        <div className="flex gap-2 mb-4">
          {(['all', 'active', 'inactive'] as const).map(t => (
            <Button key={t} variant={tab === t ? 'default' : 'ghost'} size="sm" className="rounded-full h-7 text-xs capitalize" onClick={() => setTab(t)}>{t}</Button>
          ))}
        </div>

        <div className="space-y-2 pb-4">
          {filtered.map(m => (
            <button key={m.id} onClick={() => navigate(m.id === currentUserId ? '/my-profile' : `/profile/${m.id}`)} className="w-full flex items-center gap-3 rounded-2xl bg-card p-3 text-left hover:shadow-sm transition-shadow">
              <AvatarPlaceholder name={`${m.firstName} ${m.lastName}`} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{m.firstName} {m.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">{m.about || m.city || ''}</p>
              </div>
              <span className={`h-2 w-2 rounded-full ${m.isActive ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default FamilyList;
