import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { getCurrentUserForDisplay } from '@/data/demo-profile-storage';
import { currentUserId } from '@/data/mock-members';
import { getDemoMemberPhotoUrl } from '@/lib/demo-photos';
import { currentSubscription, plans } from '@/data/mock-subscriptions';
import { Newspaper, Image, Settings, HelpCircle, CreditCard, ChevronRight, User, Pencil } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useDemoWithPhotos } from '@/hooks/useDemoWithPhotos';

const MyProfile: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUserForDisplay();
  const plan = plans.find(p => p.id === currentSubscription.planId);
  const demoWithPhotos = useDemoWithPhotos();

  const sections = [
    { label: 'Мои публикации', icon: Newspaper, path: ROUTES.classic.feed },
    { label: 'Публикации со мной', icon: Image, path: ROUTES.classic.feed },
    { label: 'Моё медиа', icon: Image, path: ROUTES.classic.feed },
    { label: 'Подписка', icon: CreditCard, path: ROUTES.classic.store },
    { label: 'Настройки', icon: Settings, path: ROUTES.classic.settings },
    { label: 'Помощь и поддержка', icon: HelpCircle, path: ROUTES.classic.help },
  ];

  return (
    <AppLayout>
      <div className="pt-4 pb-4 page-enter">
        {/* Hero-style profile header */}
        <div className="relative mx-6 mb-8 overflow-hidden bg-muted/50 flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
          {demoWithPhotos && (
            <img src={getDemoMemberPhotoUrl(currentUserId)} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
          )}
          <div className={`flex items-center justify-center ${demoWithPhotos ? 'hidden' : ''}`}>
            <User className="h-24 w-24 text-foreground" />
          </div>
          <div className="absolute inset-0 editorial-overlay" />
          <div className="absolute bottom-0 left-0 right-0 p-5 photo-card-text">
            <p className="editorial-caption text-white/40 mb-2">{plan?.name === 'Free' ? 'Бесплатный' : plan?.name === 'Premium' ? 'Премиум' : plan?.name} · план</p>
            <h1 className="editorial-title text-white text-3xl">{user.firstName} {user.lastName}</h1>
            <p className="text-white/50 text-sm font-light mt-1">{user.city}</p>
          </div>
        </div>

        {/* About */}
        {user.about && (
          <div className="px-6 mb-6">
            <p className="editorial-body text-foreground/70 text-sm">{user.about}</p>
          </div>
        )}

        <div className="px-6 mb-6">
          <button
            onClick={() => navigate(ROUTES.classic.editMyProfile)}
            className="link-row-warm w-full flex items-center gap-3"
          >
            <Pencil className="h-5 w-5 shrink-0 link-row-icon" strokeWidth={1.8} />
            <span className="text-[15px] font-medium text-foreground flex-1 text-left">Редактировать профиль</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
          </button>
        </div>

        <div className="px-6 space-y-1">
          {sections.map(s => (
            <button
              key={s.label}
              onClick={() => navigate(s.path)}
              className="link-row-warm w-full"
            >
              <s.icon className="h-5 w-5 shrink-0 link-row-icon" strokeWidth={1.8} />
              <span className="text-[15px] font-medium text-foreground flex-1 text-left">{s.label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default MyProfile;
