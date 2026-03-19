import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { usePlatform } from '@/platform/PlatformContext';
import { Heart, Calendar, Pencil } from 'lucide-react';
import { getPrototypeAvatarUrl } from '@/lib/prototype-assets';
import type { FamilyMember } from '@/types';
import { api } from '@/integrations/api';
import { toast } from '@/hooks/use-toast';
import { useAvatarFallback } from '@/lib/demoMode';
import { getLocalNickname, setLocalNickname } from '@/lib/localUserData';

class ContactProfileErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: unknown) {
    console.error('ContactProfile crashed', err);
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <AppLayout>
        <div className="prototype-screen min-h-screen bg-[var(--proto-bg)] flex items-center justify-center p-6">
          <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5 text-center max-w-sm">
            <p className="text-sm font-semibold text-[var(--proto-text)]">Не удалось открыть профиль</p>
            <p className="text-xs text-[var(--proto-text-muted)] mt-2">Обновите страницу. Если повторится — посмотрите консоль браузера.</p>
          </div>
        </div>
      </AppLayout>
    );
  }
}

const ContactProfileInner: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const platform = usePlatform();
  const [member, setMember] = useState<FamilyMember | null | undefined>(undefined);
  const [me, setMe] = useState<FamilyMember | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [localNick, setLocalNick] = useState('');
  const [nickEditing, setNickEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) {
        setMember(null);
        return;
      }
      try {
        const m = await api.family.getMember(id);
        if (cancelled) return;
        setMember(m);
      } catch {
        if (cancelled) return;
        setMember(null);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    api.profile.getMyProfile().then(setMe).catch(() => setMe(null));
    api.auth.me().then(u => setCurrentUserId(u?.id ?? null)).catch(() => setCurrentUserId(null));
  }, []);

  useEffect(() => {
    if (!me || !member || !member.id) return;
    const v = getLocalNickname(me.id, member.id);
    setLocalNick(v ?? '');
  }, [me, member?.id]);

  const savedNick = me && member ? getLocalNickname(me.id, member.id) : null;

  if (member === undefined) {
    return (
      <AppLayout>
        <div className="prototype-screen p-6 text-center text-[var(--proto-text)] font-medium min-h-touch flex items-center justify-center">Загрузка…</div>
      </AppLayout>
    );
  }

  if (member === null) {
    return (
      <AppLayout>
        <div className="prototype-screen p-6 text-center text-[var(--proto-text)] font-medium min-h-touch flex items-center justify-center">Контакт не найден</div>
      </AppLayout>
    );
  }

  const fullName = `${member.firstName} ${member.lastName}`.trim() || 'Профиль';
  const useFallback = useAvatarFallback();
  const heroSrc = (member as { avatar?: string }).avatar || (useFallback ? getPrototypeAvatarUrl(member.id) : '');
  const initials = fullName ? fullName.trim().slice(0, 2).toUpperCase() : 'U';

  const formatDate = (d: string) => {
    try {
      const [y, m, day] = d.split('-');
      return day && m && y ? `${day}.${m}.${y}` : d;
    } catch {
      return d;
    }
  };

  const canEdit = me && (member.id === me.id || member.managedById === currentUserId || me.role === 'admin');
  const openMemberPosts = () => navigate(`${ROUTES.classic.feed}?author=${member.id}&view=posts`);
  const openMemberWith = () => navigate(`${ROUTES.classic.feed}?with=${member.id}&view=posts`);
  const openMemberMedia = () => navigate(`${ROUTES.classic.feed}?author=${member.id}&view=media`);
  const openMemberMediaWith = () => navigate(`${ROUTES.classic.feed}?with=${member.id}&view=media`);

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)] flex flex-col">
        <TopBar title={fullName} onBack={() => navigate(-1)} light />
        <div className="mx-auto max-w-full w-full flex-1 px-3 sm:px-4 sm:max-w-md md:max-w-2xl lg:max-w-4xl overflow-x-hidden">
          <div className="relative w-full" style={{ minHeight: '50vh' }}>
            {heroSrc ? (
              <img src={heroSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-[#F0EDE8] to-[#E5E1DC] flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-black/10 flex items-center justify-center text-[#6B6560] text-3xl font-semibold">
                  {initials}
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <p className="text-white/80 text-sm">
                {member.city || ''}{member.city && member.birthDate ? ' · ' : ''}{member.birthDate ? `Род. ${formatDate(member.birthDate)}` : ''}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    platform.hapticFeedback('light');
                    setIsSubscribed(v => !v);
                    toast({ title: isSubscribed ? 'Вы отписались' : 'Вы подписались' });
                  }}
                  className="px-6 py-2 rounded-full border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  {isSubscribed ? 'Вы подписаны' : 'Подписаться'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    platform.hapticFeedback('light');
                    setLiked(v => !v);
                    toast({ title: liked ? 'Лайк убран' : 'Лайк поставлен' });
                  }}
                  className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  aria-label="Лайк"
                >
                  <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 py-6 space-y-6">
            {canEdit && (
              <button
                type="button"
                onClick={() => navigate(member.id === me!.id ? ROUTES.classic.editMyProfile : ROUTES.classic.editMemberProfile(member.id))}
                className="w-full h-11 rounded-2xl bg-[var(--proto-card)] border-2 border-[var(--proto-border)] text-[var(--proto-text)] text-sm font-semibold hover:border-[var(--proto-active)]/40 transition-colors flex items-center justify-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Редактировать профиль
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={openMemberPosts}
                className="h-11 rounded-2xl bg-[var(--proto-card)] border-2 border-[var(--proto-border)] text-[var(--proto-text)] text-xs font-semibold hover:border-[var(--proto-active)]/40 transition-colors"
              >
                Публикации
              </button>
              <button
                type="button"
                onClick={openMemberWith}
                className="h-11 rounded-2xl bg-[var(--proto-card)] border-2 border-[var(--proto-border)] text-[var(--proto-text)] text-xs font-semibold hover:border-[var(--proto-active)]/40 transition-colors"
              >
                Публикации со мной
              </button>
              <button
                type="button"
                onClick={openMemberMedia}
                className="h-11 rounded-2xl bg-[var(--proto-card)] border-2 border-[var(--proto-border)] text-[var(--proto-text)] text-xs font-semibold hover:border-[var(--proto-active)]/40 transition-colors"
              >
                Медиа
              </button>
              <button
                type="button"
                onClick={openMemberMediaWith}
                className="h-11 rounded-2xl bg-[var(--proto-active)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Медиа со мной
              </button>
            </div>

            {me && me.id !== member.id && (
              <div className="rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-4">
                <p className="text-xs font-semibold text-[var(--proto-active)] uppercase tracking-wider mb-2">Ник (виден только вам)</p>
                {nickEditing ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={localNick}
                      onChange={(e) => setLocalNick(e.target.value)}
                      className="flex-1 min-w-0 h-11 rounded-xl border border-[var(--proto-border)] bg-white px-4 text-[var(--proto-text)] placeholder:text-[var(--proto-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--proto-active)]/30"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLocalNickname(me.id, member.id, localNick);
                        setNickEditing(false);
                        toast({ title: localNick.trim() ? 'Ник сохранён' : 'Ник удалён' });
                      }}
                      className="h-11 px-4 rounded-xl bg-[var(--proto-active)] text-white text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
                    >
                      Сохранить
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <div className="flex-1 min-w-0 h-11 rounded-xl border border-[var(--proto-border)] bg-[var(--proto-bg)] px-4 flex items-center text-[var(--proto-text)]">
                      {savedNick || '—'}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLocalNick(savedNick ?? '');
                        setNickEditing(true);
                      }}
                      className="h-11 px-4 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)] text-sm font-semibold hover:border-[var(--proto-active)]/40 transition-colors shrink-0"
                    >
                      Изменить
                    </button>
                  </div>
                )}
              </div>
            )}
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

          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const ContactProfile: React.FC = () => (
  <ContactProfileErrorBoundary>
    <ContactProfileInner />
  </ContactProfileErrorBoundary>
);

export default ContactProfile;
