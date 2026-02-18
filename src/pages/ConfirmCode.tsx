import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
    // Mock success
    if (mode === 'register') navigate('/onboarding');
    else navigate('/tree');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pt-4">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-muted-foreground text-sm">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-2xl font-bold mb-1">Enter Code</h1>
      <p className="text-muted-foreground text-sm mb-8">We sent a code to <strong>{contact}</strong></p>

      <div className="flex flex-col items-center gap-6">
        <InputOTP maxLength={6} value={code} onChange={v => { setCode(v); setError(''); }}>
          <InputOTPGroup>
            {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
          </InputOTPGroup>
        </InputOTP>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button className="w-full rounded-xl h-11" onClick={handleConfirm}>Confirm</Button>

        <div className="text-center text-sm text-muted-foreground">
          {resendTimer > 0 ? (
            <span>Resend code in {resendTimer}s</span>
          ) : (
            <button className="text-primary underline" onClick={() => setResendTimer(30)}>Resend code</button>
          )}
        </div>
        <button className="text-xs text-muted-foreground underline" onClick={() => navigate(-1)}>
          Change phone/email
        </button>
      </div>
    </div>
  );
};

export default ConfirmCode;
