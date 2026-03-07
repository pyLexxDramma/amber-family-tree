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
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
      <TopBar title="Подписка" onBack={() => navigate(-1)} light />
      <div className="mx-auto max-w-full px-4 pt-4 pb-4 sm:max-w-md md:max-w-2xl lg:max-w-4xl">
        <p className="text-sm font-semibold text-[var(--proto-active)] uppercase tracking-wider mb-6">Управление подпиской</p>

        <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] mb-6 p-6 min-h-[96px]">
          <p className="text-xs text-[var(--proto-text-muted)] mb-3">Текущий план</p>
          <h2 className="font-serif text-2xl font-bold text-[var(--proto-text)] mb-1">{currentPlan.name}</h2>
          <p className="text-base font-medium text-[var(--proto-text)]">
            {currentPlan.price === 0 ? 'Бесплатно' : `${currentPlan.price} ₽/мес`}
          </p>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-xs text-[var(--proto-text-muted)]">Места</p>
            <p className="text-sm font-medium text-[var(--proto-text)]">{currentSubscription.usedPlaces} из {currentPlan.maxPlaces}</p>
          </div>
          <div className="h-px bg-[var(--proto-border)] relative overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[var(--proto-active)] transition-all duration-500"
              style={{ width: `${(currentSubscription.usedPlaces / currentPlan.maxPlaces) * 100}%` }}
            />
          </div>
          <button onClick={() => navigate(ROUTES.classic.places)} className="mt-2 text-base font-medium text-[var(--proto-active)] hover:underline">
            Управление местами
          </button>
        </div>

        <div className="px-0 mb-8">
          <p className="text-xs text-[var(--proto-text-muted)] mb-6 text-base">Тарифы</p>
          <div className="space-y-4">
            {plans.map(plan => {
              const isCurrent = plan.id === currentSubscription.planId;
              return (
                <div key={plan.id} className={`rounded-xl bg-[var(--proto-card)] border p-6 min-h-[96px] ${isCurrent ? 'ring-2 ring-[var(--proto-active)]/40 border-[var(--proto-active)]' : 'border-[var(--proto-border)]'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[var(--proto-text)]">{plan.name}</h3>
                      <p className="text-base font-medium text-[var(--proto-text)] mt-1">
                        {plan.price === 0 ? 'Бесплатно' : `${plan.price} ₽/мес`}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="text-sm font-semibold text-[var(--proto-active)] border-b border-[var(--proto-active)]/50 pb-0.5 uppercase tracking-wider">текущий</span>
                    )}
                  </div>
                  <ul className="space-y-2.5 mb-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-base font-medium text-[var(--proto-text)]">
                        <Check className="h-4 w-4 text-[var(--proto-active)] shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && (
                    <button
                      onClick={handleUpgrade}
                      className="w-full min-h-[48px] py-3 border-2 border-[var(--proto-active)] text-[var(--proto-active)] text-base font-semibold tracking-widest uppercase hover:bg-[var(--proto-active)] hover:text-white transition-all duration-300 rounded-2xl"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--proto-bg)]/90 backdrop-blur-sm">
            <div className="p-8 text-center max-w-xs bg-[var(--proto-card)] border border-[var(--proto-border)] rounded-xl">
              {paymentState === 'processing' && (
                <>
                  <div className="h-10 w-10 border-2 border-[var(--proto-active)]/30 border-t-[var(--proto-active)] animate-spin rounded-full mx-auto mb-4" />
                  <p className="text-base font-semibold tracking-wide text-[var(--proto-text)]">Обработка...</p>
                </>
              )}
              {paymentState === 'success' && (
                <>
                  <p className="font-serif text-2xl font-bold text-[var(--proto-text)] mb-2">Оплата прошла</p>
                  <p className="text-base font-medium text-[var(--proto-text-muted)] mb-6">Подписка активирована</p>
                  <button onClick={() => { setPaymentState(null); navigate(ROUTES.classic.places); }} className="w-full min-h-[48px] py-3 border-2 border-[var(--proto-active)] text-[var(--proto-active)] text-base font-semibold tracking-widest uppercase hover:bg-[var(--proto-active)] hover:text-white transition-all duration-300 mb-2 rounded-xl">
                    Управление местами
                  </button>
                  <button onClick={() => setPaymentState(null)} className="w-full min-h-[48px] py-3 text-base font-medium text-[var(--proto-text-muted)]">
                    Вернуться в ленту
                  </button>
                </>
              )}
              {paymentState === 'error' && (
                <>
                  <p className="font-serif text-2xl font-bold text-[var(--proto-text)] mb-2">Оплата не прошла</p>
                  <p className="text-base font-medium text-[var(--proto-text-muted)] mb-6">Попробуйте ещё раз или выберите другой способ</p>
                  <button onClick={() => setPaymentState(null)} className="w-full min-h-[48px] py-3 border-2 border-[var(--proto-active)] text-[var(--proto-active)] text-base font-semibold tracking-widest uppercase hover:bg-[var(--proto-active)] hover:text-white transition-all duration-300 mb-2 rounded-xl">
                    Повторить оплату
                  </button>
                  <button onClick={() => setPaymentState(null)} className="w-full min-h-[48px] py-3 text-base font-medium text-[var(--proto-text-muted)]">
                    Назад к тарифам
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Links */}
        <div>
          <button onClick={() => navigate(ROUTES.classic.settings)} className="w-full flex items-center gap-4 py-4 border-b border-[var(--proto-border)] hover:opacity-90 transition-opacity min-h-touch">
            <span className="text-base font-semibold tracking-wide text-[var(--proto-text)] flex-1 text-left">Настройки</span>
            <ChevronRight className="h-5 w-5 text-[var(--proto-text-muted)]" />
          </button>
          <button onClick={() => navigate(ROUTES.classic.help)} className="w-full flex items-center gap-4 py-4 border-b border-[var(--proto-border)] last:border-b-0 hover:opacity-90 transition-opacity min-h-touch">
            <span className="text-base font-semibold tracking-wide text-[var(--proto-text)] flex-1 text-left">Помощь и поддержка</span>
            <ChevronRight className="h-5 w-5 text-[var(--proto-text-muted)]" />
          </button>
        </div>
      </div>
      </div>
    </AppLayout>
  );
};

export default StorePage;
