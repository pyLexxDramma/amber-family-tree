import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { AvatarPlaceholder } from '@/components/AvatarPlaceholder';
import { getCurrentUser } from '@/data/mock-members';
import { currentSubscription, plans } from '@/data/mock-subscriptions';
import { Newspaper, Image, Settings, HelpCircle, CreditCard, ChevronRight } from 'lucide-react';

const MyProfile: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const plan = plans.find(p => p.id === currentSubscription.planId);

  const sections = [
    { label: 'My Posts', icon: Newspaper, path: '/feed' },
    { label: 'Posts with Me', icon: Image, path: '/feed' },
    { label: 'My Media', icon: Image, path: '/feed' },
    { label: 'Subscription', icon: CreditCard, path: '/store' },
    { label: 'Settings', icon: Settings, path: '/settings' },
    { label: 'Help & FAQ', icon: HelpCircle, path: '/help' },
  ];

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>

        <div className="flex flex-col items-center mb-6 rounded-2xl bg-card p-5">
          <AvatarPlaceholder name={`${user.firstName} ${user.lastName}`} size="xl" />
          <h2 className="text-lg font-bold mt-3">{user.firstName} {user.lastName}</h2>
          <p className="text-sm text-muted-foreground">{user.city}</p>
          <p className="text-xs text-muted-foreground mt-2 text-center max-w-[250px]">{user.about}</p>
          <div className="mt-3 flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-3 py-1">
            <CreditCard className="h-3 w-3" /> {plan?.name} Plan
          </div>
        </div>

        <div className="space-y-1">
          {sections.map(s => (
            <button key={s.label} onClick={() => navigate(s.path)} className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-card transition-colors">
              <s.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium flex-1 text-left">{s.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default MyProfile;
