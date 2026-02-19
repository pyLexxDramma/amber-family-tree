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
    else navigate(ROUTES.classic.feed);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0">
        <img src="/bg-3.png" alt="" className="h-full w-full object-cover photo-bg-blur" />
        <div className="absolute inset-0 overlay-light" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col px-6 pt-6">
      <button onClick={() => navigate(-1)} className="mb-12 flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-xs tracking-widest uppercase font-light">Назад</span>
      </button>

      <h1 className="editorial-title text-3xl mb-2">Подтвердите вход</h1>
      <p className="text-sm font-light text-muted-foreground mb-10">
        Мы отправили код на <span className="text-foreground">{contact || '…'}</span>
      </p>

      <div className="flex flex-col items-center gap-8">
        <InputOTP maxLength={6} value={code} onChange={v => { setCode(v); setError(''); }}>
          <InputOTPGroup>
            {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
          </InputOTPGroup>
        </InputOTP>

        {error && <p className="text-destructive text-sm font-light">{error}</p>}

        <button onClick={handleConfirm} className="w-full h-12 bg-foreground text-background text-sm font-light tracking-widest uppercase hover:bg-foreground/80 transition-all duration-300">
          Подтвердить
        </button>

        <div className="text-center text-sm font-light text-muted-foreground">
          {resendTimer > 0 ? (
            <span>Отправить код ещё раз через {resendTimer} с</span>
          ) : (
            <button type="button" className="underline hover:text-foreground transition-colors" onClick={() => setResendTimer(30)}>
              Отправить код ещё раз
            </button>
          )}
        </div>
        <button type="button" className="text-xs font-light text-muted-foreground/70 underline hover:text-foreground transition-colors" onClick={() => navigate(-1)}>
          Изменить номер или email
        </button>
      </div>
      </div>
    </div>
  );
};

export default ConfirmCode;
