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
      <div className="px-0 pt-4 pb-4 page-enter">
        <p className="section-title text-primary mb-6 px-3 text-lg">Управление подпиской</p>

        <div className="content-card mx-0 mb-6 p-6 page-enter-stagger min-h-[96px]">
          <p className="editorial-caption text-foreground/80 mb-3 text-base">Текущий план</p>
          <h2 className="editorial-title text-3xl font-bold text-foreground mb-1">{currentPlan.name}</h2>
          <p className="text-base font-medium text-foreground/90">
            {currentPlan.price === 0 ? 'Бесплатно' : `${currentPlan.price} ₽/мес`}
          </p>
        </div>

        {/* Places */}
        <div className="px-3 mb-4">
          <div className="flex items-baseline justify-between mb-3">
            <p className="editorial-caption text-foreground/80 text-base">Места</p>
            <p className="text-sm font-medium text-foreground/90">{currentSubscription.usedPlaces} из {currentPlan.maxPlaces}</p>
          </div>
          <div className="h-px bg-border relative overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-foreground/40 transition-all duration-500"
              style={{ width: `${(currentSubscription.usedPlaces / currentPlan.maxPlaces) * 100}%` }}
            />
          </div>
          <button onClick={() => navigate(ROUTES.classic.places)} className="mt-2 text-base font-medium text-primary hover:text-primary/80 transition-colors underline">
            Управление местами
          </button>
        </div>

        {/* Plans */}
        <div className="px-0 mb-8">
          <p className="editorial-caption text-foreground/80 mb-6 px-3 text-base">Тарифы</p>
          <div className="space-y-4">
            {plans.map(plan => {
              const isCurrent = plan.id === currentSubscription.planId;
              return (
                <div key={plan.id} className={`content-card p-6 min-h-[96px] ${isCurrent ? 'ring-2 ring-primary/40' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="editorial-title text-2xl font-bold text-foreground">{plan.name}</h3>
                      <p className="text-base font-medium text-foreground/90 mt-1">
                        {plan.price === 0 ? 'Бесплатно' : `${plan.price} ₽/мес`}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="text-sm font-semibold text-primary border-b border-primary/50 pb-0.5 uppercase tracking-wider">текущий</span>
                    )}
                  </div>
                  <ul className="space-y-2.5 mb-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-base font-medium text-foreground/90">
                        <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && (
                    <button
                      onClick={handleUpgrade}
                      className="w-full min-h-[48px] py-3 border-2 border-primary text-base font-semibold tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-2xl"
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
                  <p className="text-base font-semibold tracking-wide text-foreground">Обработка...</p>
                </>
              )}
              {paymentState === 'success' && (
                <>
                  <p className="editorial-title text-2xl font-bold text-foreground mb-2">Оплата прошла</p>
                  <p className="text-base font-medium text-foreground/90 mb-6">Подписка активирована</p>
                  <button onClick={() => { setPaymentState(null); navigate(ROUTES.classic.places); }} className="w-full min-h-[48px] py-3 border-2 border-primary text-base font-semibold tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 mb-2 rounded-xl">
                    Управление местами
                  </button>
                  <button onClick={() => setPaymentState(null)} className="w-full min-h-[48px] py-3 text-base font-medium text-foreground/90">
                    Вернуться в ленту
                  </button>
                </>
              )}
              {paymentState === 'error' && (
                <>
                  <p className="editorial-title text-2xl font-bold text-foreground mb-2">Оплата не прошла</p>
                  <p className="text-base font-medium text-foreground/90 mb-6">Попробуйте ещё раз или выберите другой способ</p>
                  <button onClick={() => setPaymentState(null)} className="w-full min-h-[48px] py-3 border-2 border-primary text-base font-semibold tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 mb-2 rounded-xl">
                    Повторить оплату
                  </button>
                  <button onClick={() => setPaymentState(null)} className="w-full min-h-[48px] py-3 text-base font-medium text-foreground/90">
                    Назад к тарифам
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="px-6">
          <button onClick={() => navigate(ROUTES.classic.settings)} className="w-full flex items-center gap-4 py-4 border-b border-border/30 hover:opacity-90 transition-opacity min-h-touch">
            <span className="text-base font-semibold tracking-wide text-foreground flex-1 text-left">Настройки</span>
            <ChevronRight className="h-5 w-5 text-foreground/50" />
          </button>
          <button onClick={() => navigate(ROUTES.classic.help)} className="w-full flex items-center gap-4 py-4 border-b border-border/30 last:border-b-0 hover:opacity-90 transition-opacity min-h-touch">
            <span className="text-base font-semibold tracking-wide text-foreground flex-1 text-left">Помощь и поддержка</span>
            <ChevronRight className="h-5 w-5 text-foreground/50" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default StorePage;
