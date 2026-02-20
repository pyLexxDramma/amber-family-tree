import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { currentSubscription, plans } from '@/data/mock-subscriptions';
import { Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

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
      <TopBar title="Подписка" />
      <div className="px-6 pt-4 pb-4 page-enter">
        <p className="section-title text-primary mb-6">Управление подпиской</p>

        <div className="content-card mx-0 mb-6 p-6 page-enter-stagger">
          <p className="editorial-caption text-muted-foreground mb-3">Текущий план</p>
          <h2 className="editorial-title text-2xl mb-1">{currentPlan.name}</h2>
          <p className="text-sm font-light text-muted-foreground">
            {currentPlan.price === 0 ? 'Бесплатно' : `${currentPlan.price} ₽/мес`}
          </p>
        </div>

        {/* Places */}
        <div className="mx-6 mb-4">
          <div className="flex items-baseline justify-between mb-3">
            <p className="editorial-caption text-muted-foreground">Места</p>
            <p className="text-xs font-light text-muted-foreground">{currentSubscription.usedPlaces} из {currentPlan.maxPlaces}</p>
          </div>
          <div className="h-px bg-border relative overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-foreground/40 transition-all duration-500"
              style={{ width: `${(currentSubscription.usedPlaces / currentPlan.maxPlaces) * 100}%` }}
            />
          </div>
          <button onClick={() => navigate(ROUTES.classic.places)} className="mt-2 text-xs font-light text-muted-foreground hover:text-foreground transition-colors underline">
            Управление местами
          </button>
        </div>

        {/* Plans */}
        <div className="px-6 mb-8">
          <p className="editorial-caption text-muted-foreground mb-6">Тарифы</p>
          <div className="space-y-4">
            {plans.map(plan => {
              const isCurrent = plan.id === currentSubscription.planId;
              return (
                <div key={plan.id} className={`content-card p-6 ${isCurrent ? 'ring-2 ring-primary/40' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="editorial-title text-xl">{plan.name}</h3>
                      <p className="text-sm font-light text-muted-foreground mt-1">
                        {plan.price === 0 ? 'Бесплатно' : `${plan.price} ₽/мес`}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="editorial-caption text-muted-foreground border-b border-foreground/30 pb-0.5">текущий</span>
                    )}
                  </div>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs font-light text-muted-foreground">
                        <Check className="h-3 w-3 text-foreground/40" /> {f}
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && (
                    <button
                      onClick={handleUpgrade}
                      className="w-full h-11 border border-foreground/20 text-sm font-light tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300"
                    >
                      Выбрать тариф
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment overlay */}
        {paymentState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
            <div className="p-8 text-center max-w-xs">
              {paymentState === 'processing' && (
                <>
                  <div className="h-10 w-10 border border-foreground/30 border-t-transparent animate-spin mx-auto mb-4" />
                  <p className="text-sm font-light tracking-wide">Обработка...</p>
                </>
              )}
              {paymentState === 'success' && (
                <>
                  <p className="editorial-title text-2xl mb-2">Оплата прошла</p>
                  <p className="text-sm font-light text-muted-foreground mb-6">Подписка активирована</p>
                  <button onClick={() => { setPaymentState(null); navigate(ROUTES.classic.places); }} className="w-full h-11 border border-foreground/20 text-sm font-light tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300 mb-2">
                    Управление местами
                  </button>
                  <button onClick={() => setPaymentState(null)} className="w-full h-11 text-sm font-light text-muted-foreground">
                    Вернуться в ленту
                  </button>
                </>
              )}
              {paymentState === 'error' && (
                <>
                  <p className="editorial-title text-2xl mb-2">Оплата не прошла</p>
                  <p className="text-sm font-light text-muted-foreground mb-6">Попробуйте ещё раз или выберите другой способ</p>
                  <button onClick={() => setPaymentState(null)} className="w-full h-11 border border-foreground/20 text-sm font-light tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300 mb-2">
                    Повторить оплату
                  </button>
                  <button onClick={() => setPaymentState(null)} className="w-full h-11 text-sm font-light text-muted-foreground">
                    Назад к тарифам
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="px-6">
          <button onClick={() => navigate(ROUTES.classic.settings)} className="w-full flex items-center gap-4 py-4 border-b border-border/30 hover:opacity-70 transition-opacity">
            <span className="text-sm font-light tracking-wide flex-1 text-left">Настройки</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
          </button>
          <button onClick={() => navigate(ROUTES.classic.help)} className="w-full flex items-center gap-4 py-4 border-b border-border/30 last:border-b-0 hover:opacity-70 transition-opacity">
            <span className="text-sm font-light tracking-wide flex-1 text-left">Помощь и поддержка</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default StorePage;
