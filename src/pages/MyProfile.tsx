import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { getCurrentUser } from '@/data/mock-members';
import { currentSubscription, plans } from '@/data/mock-subscriptions';
import { Newspaper, Image, Settings, HelpCircle, CreditCard, ChevronRight } from 'lucide-react';

const MyProfile: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const plan = plans.find(p => p.id === currentSubscription.planId);

  const sections = [
    { label: 'My Publications', icon: Newspaper, path: '/feed' },
    { label: 'Publications with Me', icon: Image, path: '/feed' },
    { label: 'My Media', icon: Image, path: '/feed' },
    { label: 'Subscription', icon: CreditCard, path: '/store' },
    { label: 'Settings', icon: Settings, path: '/settings' },
    { label: 'Help & Support', icon: HelpCircle, path: '/help' },
  ];

  return (
    <AppLayout>
      <div className="pt-4 pb-4">
        {/* Hero-style profile header */}
        <div className="relative mx-6 mb-8 overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <img
            src={`https://picsum.photos/seed/profile${user.id}/600/450`}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'sepia(0.15) brightness(0.85)' }}
          />
          <div className="absolute inset-0 editorial-overlay" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="editorial-caption text-white/40 mb-2">{plan?.name} plan</p>
            <h1 className="editorial-title text-white text-3xl">{user.firstName} {user.lastName}</h1>
            <p className="text-white/50 text-sm font-light mt-1">{user.city}</p>
          </div>
        </div>

        {/* About */}
        {user.about && (
          <div className="px-6 mb-8">
            <p className="editorial-body text-foreground/70 text-sm">{user.about}</p>
          </div>
        )}

        {/* Navigation sections */}
        <div className="px-6">
          {sections.map((s, i) => (
            <button
              key={s.label}
              onClick={() => navigate(s.path)}
              className="w-full flex items-center gap-4 py-4 border-b border-border/30 last:border-b-0 hover:opacity-70 transition-opacity"
            >
              <s.icon className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
              <span className="text-sm font-light tracking-wide flex-1 text-left">{s.label}</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default MyProfile;
