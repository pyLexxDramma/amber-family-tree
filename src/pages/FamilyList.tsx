import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { mockMembers, currentUserId } from '@/data/mock-members';
import { getDemoMemberPhotoUrl } from '@/lib/demo-photos';
import { Search, SlidersHorizontal, MapPin, User } from 'lucide-react';
import { useDemoWithPhotos } from '@/hooks/useDemoWithPhotos';

const FamilyList: React.FC = () => {
  const navigate = useNavigate();
  const demoWithPhotos = useDemoWithPhotos();
  const [tab, setTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');

  const filtered = mockMembers
    .filter(m => tab === 'all' || (tab === 'active' ? m.isActive : !m.isActive))
    .filter(m => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        (m.nickname || '').toLowerCase().includes(q) ||
        (m.city || '').toLowerCase().includes(q)
      );
    });

  const memberCard = (m: typeof mockMembers[0]) => {
    const isCurrent = m.id === currentUserId;
    const photoUrl = demoWithPhotos ? getDemoMemberPhotoUrl(m.id) : null;
    const displayName = `${m.firstName} ${m.lastName.charAt(0)}.`;

    return (
      <button
        key={m.id}
        onClick={() => navigate(isCurrent ? ROUTES.classic.myProfile : ROUTES.classic.profile(m.id))}
        className="relative overflow-hidden rounded-2xl w-full group"
        style={{ aspectRatio: '3/4' }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
            <User className="w-16 h-16 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

        {m.city && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">
            <MapPin className="h-3 w-3 text-white/70" />
            <span className="text-[10px] text-white/80 font-medium">{m.city}</span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 z-10">
          {isCurrent && (
            <span className="text-[10px] text-primary font-bold bg-primary/20 px-1.5 py-0.5 rounded-full mb-1 inline-block">Вы</span>
          )}
          <p className="text-white font-bold text-base leading-tight drop-shadow-lg">
            {displayName}
          </p>
        </div>
      </button>
    );
  };

  return (
    <AppLayout>
      <div className="px-4 pt-4 pb-4 page-enter">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="w-full h-10 pl-9 pr-4 rounded-full border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            />
          </div>
          <button className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(['all', 'active', 'inactive'] as const).map(t => {
            const labels = { all: 'Все', active: 'Активные', inactive: 'Неактивные' };
            const count = mockMembers.filter(m => t === 'all' || (t === 'active' ? m.isActive : !m.isActive)).length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  tab === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {labels[t]} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-3">
            {filtered.filter((_, i) => i % 2 === 0).map(m => memberCard(m))}
          </div>
          <div className="flex-1 flex flex-col gap-3 pt-10">
            {filtered.filter((_, i) => i % 2 === 1).map(m => memberCard(m))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">Никого не найдено</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default FamilyList;
