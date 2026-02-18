import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { currentSubscription, plans } from '@/data/mock-subscriptions';
import { CreditCard, Check, Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StorePage: React.FC = () => {
  const navigate = useNavigate();
  const [paymentState, setPaymentState] = useState<null | 'processing' | 'success' | 'error'>(null);
  const currentPlan = plans.find(p => p.id === currentSubscription.planId)!;

  const handleUpgrade = () => {
    setPaymentState('processing');
    setTimeout(() => setPaymentState(Math.random() > 0.3 ? 'success' : 'error'), 1500);
  };

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold mb-4">Store</h1>

        {/* Current subscription */}
        <div className="rounded-2xl bg-card p-4 mb-4">
          <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold">{currentPlan.name}</p>
              <p className="text-sm text-muted-foreground">{currentPlan.price === 0 ? 'Free' : `$${currentPlan.price}/mo`}</p>
            </div>
            <CreditCard className="h-8 w-8 text-primary/30" />
          </div>
        </div>

        {/* Places */}
        <div className="rounded-2xl bg-card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Family Places</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden mb-1">
            <div className="h-full bg-primary rounded-full" style={{ width: `${(currentSubscription.usedPlaces / currentPlan.maxPlaces) * 100}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{currentSubscription.usedPlaces} of {currentPlan.maxPlaces} places used</p>
        </div>

        {/* Plans comparison */}
        <h2 className="text-lg font-bold mb-3">Plans</h2>
        <div className="space-y-3 mb-6">
          {plans.map(plan => (
            <div key={plan.id} className={`rounded-2xl p-4 ${plan.id === currentSubscription.planId ? 'bg-primary/5 border-2 border-primary' : 'bg-card'}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">{plan.price === 0 ? 'Free forever' : `$${plan.price}/month`}</p>
                </div>
                {plan.id === currentSubscription.planId && <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">Current</span>}
              </div>
              <ul className="space-y-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              {plan.id !== currentSubscription.planId && (
                <Button className="w-full mt-3 rounded-xl" onClick={handleUpgrade}>Upgrade to {plan.name}</Button>
              )}
            </div>
          ))}
        </div>

        {/* Payment state overlay */}
        {paymentState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="rounded-2xl bg-card p-6 shadow-lg text-center max-w-xs">
              {paymentState === 'processing' && <>
                <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
                <p className="font-medium">Processing payment...</p>
              </>}
              {paymentState === 'success' && <>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"><Check className="h-6 w-6 text-primary" /></div>
                <p className="font-bold text-lg">Payment Successful!</p>
                <p className="text-sm text-muted-foreground mt-1">Welcome to Premium</p>
                <Button className="mt-4 rounded-xl" onClick={() => setPaymentState(null)}>Done</Button>
              </>}
              {paymentState === 'error' && <>
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3"><span className="text-2xl">✕</span></div>
                <p className="font-bold text-lg">Payment Failed</p>
                <p className="text-sm text-muted-foreground mt-1">Please try again</p>
                <Button className="mt-4 rounded-xl" onClick={() => setPaymentState(null)}>Close</Button>
              </>}
            </div>
          </div>
        )}

        {/* Settings & Help links */}
        <div className="space-y-1">
          <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-card transition-colors">
            <span className="text-sm font-medium flex-1 text-left">Settings</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => navigate('/help')} className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-card transition-colors">
            <span className="text-sm font-medium flex-1 text-left">Help & FAQ</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default StorePage;
