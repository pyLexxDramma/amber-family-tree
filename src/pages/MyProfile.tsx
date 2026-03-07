import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { getCurrentUserForDisplay } from '@/data/demo-profile-storage';
import { currentUserId } from '@/data/mock-members';
import { getPrototypeAvatarUrl } from '@/lib/prototype-assets';
import { currentSubscription, plans } from '@/data/mock-subscriptions';
import { Newspaper, Image, Settings, HelpCircle, CreditCard, ChevronRight, Pencil, Send } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

const MyProfile: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUserForDisplay();
  const plan = plans.find(p => p.id === currentSubscription.planId);

  const sections = [
    { label: 'Мои публикации', icon: Newspaper, path: `${ROUTES.classic.feed}?filter=my` },
    { label: 'Публикации со мной', icon: Image, path: `${ROUTES.classic.feed}?filter=with-me` },
    { label: 'Моё медиа', icon: Image, path: ROUTES.classic.myMedia },
    { label: 'Подписка', icon: CreditCard, path: ROUTES.classic.store },
    { label: 'Настройки', icon: Settings, path: ROUTES.classic.settings },
    { label: 'Помощь и поддержка', icon: HelpCircle, path: ROUTES.classic.help },
  ];

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title="Мой профиль" onBack={() => navigate(ROUTES.classic.family)} light right={
          <button type="button" onClick={() => navigate(ROUTES.classic.invite)} className="h-10 w-10 rounded-full flex items-center justify-center text-[var(--proto-text)] hover:bg-[var(--proto-border)] transition-colors" aria-label="Поделиться">
            <Send className="h-5 w-5" />
          </button>
        } />
        <div className="mx-auto max-w-full px-4 pt-4 pb-4 sm:max-w-md md:max-w-2xl lg:max-w-4xl">
          <div className="relative mb-8 overflow-hidden rounded-xl bg-[var(--proto-card)] flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
            <img src={getPrototypeAvatarUrl(currentUserId, currentUserId)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-white/70 text-xs font-medium mb-1">{plan?.name === 'Free' ? 'Бесплатный' : plan?.name === 'Premium' ? 'Премиум' : plan?.name} · план</p>
              <h1 className="font-serif text-2xl font-semibold text-white">{user.firstName} {user.lastName}</h1>
              <p className="text-white/80 text-sm mt-1">{user.city}</p>
            </div>
          </div>

          {user.about && (
            <div className="mb-6">
              <p className="text-sm text-[var(--proto-text-muted)]">{user.about}</p>
            </div>
          )}

          <button
            onClick={() => navigate(ROUTES.classic.editMyProfile)}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/30 transition-colors text-left mb-4"
          >
            <Pencil className="h-5 w-5 shrink-0 text-[var(--proto-active)]" strokeWidth={1.8} />
            <span className="text-[15px] font-medium text-[var(--proto-text)] flex-1">Редактировать профиль</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--proto-text-muted)]" />
          </button>

          <div className="space-y-1">
            {sections.map(s => (
              <button
                key={s.label}
                onClick={() => navigate(s.path)}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/30 transition-colors text-left"
              >
                <s.icon className="h-5 w-5 shrink-0 text-[var(--proto-active)]" strokeWidth={1.8} />
                <span className="text-[15px] font-medium text-[var(--proto-text)] flex-1 text-left">{s.label}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--proto-text-muted)]" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MyProfile;
