import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowLeft } from 'lucide-react';

const ConfirmCode: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { contact = '', mode = 'login' } = (location.state as { contact?: string; mode?: string }) || {};
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleConfirm = () => {
    if (code.length < 4) { setError('Введите полный код'); return; }
    if (code === '0000') { setError('Неверный код'); return; }
    if (code === '9999') { setError('Время кода истекло'); return; }
    if (mode === 'register') navigate('/onboarding');
    else navigate(ROUTES.classic.tree);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0">
        <img src="/bg-3.png" alt="" className="h-full w-full object-cover photo-bg-blur" />
        <div className="absolute inset-0 overlay-light" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col px-6 pt-6 page-enter">
      <button onClick={() => navigate(-1)} className="touch-target mb-12 flex items-center gap-2 rounded-xl border-2 border-primary/50 text-foreground/90 hover:text-primary hover:bg-primary/10 hover:border-primary/70 transition-colors px-3 py-2 font-semibold shadow-sm -ml-2">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm tracking-wide">Назад</span>
      </button>

      <h1 className="hero-title text-3xl mb-2">Подтвердите вход</h1>
      <p className="text-sm font-medium text-muted-foreground mb-8">
        Мы отправили код на <span className="text-foreground font-semibold">{contact || '…'}</span>
      </p>

      <div className="flex flex-col items-center gap-8 page-enter-stagger">
        <div className="content-card p-4 rounded-2xl w-full max-w-[280px]">
          <InputOTP maxLength={6} value={code} onChange={v => { setCode(v); setError(''); }}>
            <InputOTPGroup className="justify-center gap-2">
              {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} className="rounded-xl border-2 h-12 w-10 text-lg font-semibold" />)}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && <p className="text-destructive text-sm font-semibold">{error}</p>}

        <button onClick={handleConfirm} className="content-card w-full min-h-[52px] rounded-2xl border-2 bg-foreground text-background text-[15px] font-semibold hover:bg-foreground/90 transition-all">
          Подтвердить
        </button>

        <div className="text-center text-sm font-medium text-muted-foreground">
          {resendTimer > 0 ? (
            <span>Отправить код ещё раз через {resendTimer} с</span>
          ) : (
            <button type="button" className="underline hover:text-foreground transition-colors font-semibold" onClick={() => setResendTimer(30)}>
              Отправить код ещё раз
            </button>
          )}
        </div>
        <button type="button" className="touch-target text-sm font-medium text-primary/80 hover:text-primary transition-colors py-2 px-3 rounded-lg" onClick={() => navigate(-1)}>
          Изменить номер или email
        </button>
      </div>
      </div>
    </div>
  );
};

export default ConfirmCode;
