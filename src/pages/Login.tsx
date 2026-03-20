import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/integrations/api';
import { BrandLogoCircle } from '@/components/BrandLogoCircle';
import { ROUTES } from '@/constants/routes';
import { REFERENCE_DEMO_EMAIL, REFERENCE_DEMO_CODE, useMockUiAfterReferenceLogin } from '@/constants/reference-profile';
import { setDemoMode } from '@/lib/demoMode';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as { prefill?: string })?.prefill;
  const [value, setValue] = useState(prefill ?? '');
  const [error, setError] = useState('');
  const [isTestLogin, setIsTestLogin] = useState(false);

  useEffect(() => {
    if (prefill) setValue(prefill);
  }, [prefill]);

  const handleSubmit = async () => {
    if (!value.trim()) { setError('Введите телефон или email'); return; }
    if (!value.includes('@') && !/^\+?\d{7,}$/.test(value.replace(/\s/g, ''))) {
      setError('Некорректный формат');
      return;
    }
    setError('');
    try {
      await api.auth.sendCode(value.trim());
    } catch {
      setError('Не удалось отправить код');
    }
    navigate('/confirm-code', { state: { contact: value.trim(), mode: 'login' } });
  };

  const handleTestProfileLogin = async () => {
    setIsTestLogin(true);
    setError('');
    setDemoMode(false);
    try {
      const res = await api.auth.verify(REFERENCE_DEMO_EMAIL, REFERENCE_DEMO_CODE);
      localStorage.setItem('token', res.access_token);
      setDemoMode(useMockUiAfterReferenceLogin());
      navigate(ROUTES.classic.feed);
    } catch {
      setError('Не удалось войти в тестовый профиль');
    } finally {
      setIsTestLogin(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F8F5F1] flex flex-col px-4 pt-4 pb-8 overflow-x-hidden relative">
      <div className="absolute top-4 right-4">
        <BrandLogoCircle className="h-11 w-11 border-[#E5E1DC] bg-[#F0EDE8]" />
      </div>
      <button
        onClick={() => navigate('/')}
        className="flex items-center justify-center h-10 w-10 rounded-full text-[#333333] hover:bg-[#E5E1DC] transition-colors mb-8"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="font-serif text-2xl font-bold text-[#333333] mb-1">Вход</h1>
      <p className="text-sm text-[#6B6560] mb-6">Введите ваши данные для входа</p>

      <button
        type="button"
        onClick={handleTestProfileLogin}
        disabled={isTestLogin}
        className="w-full py-2.5 rounded-xl border border-[#A39B8A]/50 text-[#A39B8A] font-medium text-sm hover:bg-[#A39B8A]/10 transition-colors mb-6 disabled:opacity-60"
      >
        {isTestLogin ? 'Вход…' : 'Войти в тестовый профиль'}
      </button>

      <p className="text-xs text-[#6B6560] mb-4">Любой другой email — новый пустой профиль</p>

      <div className="space-y-6">
        <div>
          <Label htmlFor="contact" className="text-xs font-medium text-[#6B6560] uppercase tracking-wider">
            Телефон или email
          </Label>
          <Input
            id="contact"
            placeholder="+7 999 123 45 67 или you@email.com"
            value={value}
            onChange={e => { setValue(e.target.value); setError(''); }}
            className="mt-2 rounded-xl border-2 border-[#E5E1DC] bg-[#F0EDE8] text-[#333333] text-base h-12 placeholder:text-[#6B6560] focus-visible:border-[#A39B8A] focus-visible:ring-[#A39B8A]/20"
          />
          {error && <p className="text-red-600 text-sm mt-2 font-medium">{error}</p>}
        </div>
        <button
          onClick={handleSubmit}
          className="w-full h-12 rounded-xl bg-[#A39B8A] text-white text-base font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Получить код
        </button>
        <p className="text-center text-sm text-[#6B6560]">
          Нет аккаунта?{' '}
          <button type="button" onClick={() => navigate('/register')} className="text-[#A39B8A] font-semibold hover:underline">
            Создать
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
