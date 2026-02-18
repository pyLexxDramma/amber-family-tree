import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    if (code.length < 4) { setError('Please enter the full code'); return; }
    if (code === '0000') { setError('Invalid or expired code'); return; }
    if (mode === 'register') navigate('/onboarding');
    else navigate('/tree');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pt-6">
      <button onClick={() => navigate(-1)} className="mb-12 flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-xs tracking-widest uppercase font-light">Back</span>
      </button>

      <h1 className="editorial-title text-3xl mb-2">Enter Code</h1>
      <p className="text-sm font-light text-muted-foreground mb-12">
        We sent a code to <span className="text-foreground">{contact}</span>
      </p>

      <div className="flex flex-col items-center gap-8">
        <InputOTP maxLength={6} value={code} onChange={v => { setCode(v); setError(''); }}>
          <InputOTPGroup>
            {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
          </InputOTPGroup>
        </InputOTP>

        {error && <p className="text-destructive text-sm font-light">{error}</p>}

        <button onClick={handleConfirm} className="w-full h-12 bg-foreground text-background text-sm font-light tracking-widest uppercase hover:bg-foreground/80 transition-all duration-300">
          Confirm
        </button>

        <div className="text-center text-sm font-light text-muted-foreground">
          {resendTimer > 0 ? (
            <span>Resend code in {resendTimer}s</span>
          ) : (
            <button className="underline hover:text-foreground transition-colors" onClick={() => setResendTimer(30)}>
              Resend code
            </button>
          )}
        </div>
        <button className="text-xs font-light text-muted-foreground/50 underline hover:text-foreground transition-colors" onClick={() => navigate(-1)}>
          Change phone/email
        </button>
      </div>
    </div>
  );
};

export default ConfirmCode;
