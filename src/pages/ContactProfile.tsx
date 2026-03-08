import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getMember, currentUserId } from '@/data/mock-members';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { usePlatform } from '@/platform/PlatformContext';
import { Users, Heart, MessageCircle, Calendar, ChevronRight } from 'lucide-react';
import { getPrototypeAvatarUrl } from '@/lib/prototype-assets';

const ContactProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = getMember(id || '');
  const platform = usePlatform();

  if (!member) {
    return (
      <AppLayout>
        <div className="prototype-screen p-6 text-center text-[var(--proto-text)] font-medium min-h-touch flex items-center justify-center">Контакт не найден</div>
      </AppLayout>
    );
  }

  const parentIds = member.relations.filter((r) => r.type === 'parent').map((r) => r.memberId);
  const childIds = member.relations.filter((r) => r.type === 'child').map((r) => r.memberId);
  const parents = parentIds.map((mid) => getMember(mid)).filter(Boolean);
  const children = childIds.map((mid) => getMember(mid)).filter(Boolean);
  const displayName = member.nickname || `${member.firstName} ${member.lastName}`.trim();

  const formatDate = (d: string) => {
    try {
      const [y, m, day] = d.split('-');
      return day && m && y ? `${day}.${m}.${y}` : d;
    } catch {
      return d;
    }
  };

  const goToRelative = (relId: string) => {
    platform.hapticFeedback('light');
    navigate(ROUTES.classic.profile(relId));
  };

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)] flex flex-col">
        <TopBar title={displayName} onBack={() => navigate(-1)} light />
        <div className="mx-auto max-w-full w-full flex-1 px-3 sm:px-4 sm:max-w-md md:max-w-2xl lg:max-w-4xl overflow-x-hidden">
          <div className="relative w-full" style={{ minHeight: '50vh' }}>
            <img src={getPrototypeAvatarUrl(member.id, currentUserId)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <p className="text-white/80 text-sm">
                {member.city || ''}{member.city && member.birthDate ? ' · ' : ''}{member.birthDate ? `Род. ${formatDate(member.birthDate)}` : ''}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <button className="px-6 py-2 rounded-full border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                  Подписаться
                </button>
                <button className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <Heart className="h-4 w-4" />
                </button>
                <button className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 py-6 space-y-6">
            {(member.birthDate || member.deathDate) && (
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                {member.birthDate && (
                  <div className="flex-shrink-0 px-5 py-3 rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] min-w-[140px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-3.5 w-3.5 text-[var(--proto-active)]" />
                      <span className="text-xs text-[var(--proto-text-muted)] font-medium">{member.birthDate.slice(0, 4)}</span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--proto-text)]">Дата рождения</p>
                    <p className="text-xs text-[var(--proto-text-muted)]">{formatDate(member.birthDate)}</p>
                  </div>
                )}
                {member.deathDate && (
                  <div className="flex-shrink-0 px-5 py-3 rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] min-w-[140px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-3.5 w-3.5 text-[var(--proto-text-muted)]" />
                      <span className="text-xs text-[var(--proto-text-muted)] font-medium">{member.deathDate.slice(0, 4)}</span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--proto-text)]">Дата ухода</p>
                    <p className="text-xs text-[var(--proto-text-muted)]">{formatDate(member.deathDate)}</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-[var(--proto-active)] uppercase tracking-wider mb-3">Семья</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => parents[0] && goToRelative(parents[0]!.id)}
                  disabled={parents.length === 0}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/30 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-[var(--proto-bg)] shrink-0">
                    <Users className="h-5 w-5 m-auto text-[var(--proto-active)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--proto-text)]">
                      {parents.length === 0 ? 'Родители не указаны' : parents.map(p => p!.nickname || p!.firstName).join(', ')}
                    </p>
                    <p className="text-xs text-[var(--proto-text-muted)]">{parents.length > 0 ? `Родител${parents.length > 1 ? 'и' : 'ь'}` : ''}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--proto-text-muted)]" />
                </button>
                <button
                  type="button"
                  onClick={() => children[0] && goToRelative(children[0]!.id)}
                  disabled={children.length === 0}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/30 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-[var(--proto-bg)] shrink-0">
                    <Users className="h-5 w-5 m-auto text-[var(--proto-active)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--proto-text)]">
                      {children.length === 0 ? 'Дети не указаны' : children.map(c => c!.nickname || c!.firstName).join(', ')}
                    </p>
                    <p className="text-xs text-[var(--proto-text-muted)]">{children.length > 0 ? `Дет${children.length > 1 ? 'и' : 'ь'}` : ''}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--proto-text-muted)]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ContactProfile;
