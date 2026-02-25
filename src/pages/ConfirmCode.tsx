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
    <div className="flex min-h-screen flex-col bg-background px-6 pt-6">
      <button onClick={() => navigate(-1)} className="touch-target mb-10 flex items-center justify-center h-10 w-10 -ml-2 rounded-full bg-card text-foreground hover:bg-secondary transition-colors shadow-sm">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Подтвердите вход</h1>
      <p className="text-sm font-medium text-muted-foreground mb-8">
        Мы отправили код на <span className="text-foreground font-semibold">{contact || '…'}</span>
      </p>

      <div className="flex flex-col items-center gap-8">
        <div className="p-5 rounded-2xl bg-card border border-border/40 w-full max-w-[280px] shadow-sm">
          <InputOTP maxLength={6} value={code} onChange={v => { setCode(v); setError(''); }}>
            <InputOTPGroup className="justify-center gap-2">
              {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} className="rounded-xl border border-border bg-background h-12 w-10 text-lg font-semibold" />)}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && <p className="text-destructive text-sm font-semibold">{error}</p>}

        <button onClick={handleConfirm} className="w-full h-12 rounded-2xl bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
          Подтвердить
        </button>

        <div className="text-center text-sm text-muted-foreground">
          {resendTimer > 0 ? (
            <span>Отправить код ещё раз через {resendTimer} с</span>
          ) : (
            <button type="button" className="underline text-primary hover:text-primary/80 transition-colors font-semibold" onClick={() => setResendTimer(30)}>
              Отправить код ещё раз
            </button>
          )}
        </div>
        <button type="button" className="touch-target text-sm text-primary/80 hover:text-primary transition-colors py-2 px-3 rounded-lg" onClick={() => navigate(-1)}>
          Изменить номер или email
        </button>
      </div>
    </div>
  );
};

export default ConfirmCode;
