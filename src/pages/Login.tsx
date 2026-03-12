import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/integrations/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

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
      return;
    }
    navigate('/confirm-code', { state: { contact: value, mode: 'login' } });
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F8F5F1] flex flex-col px-4 pt-4 pb-8 overflow-x-hidden">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center h-10 w-10 rounded-full text-[#333333] hover:bg-[#E5E1DC] transition-colors mb-8"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="font-serif text-2xl font-bold text-[#333333] mb-1">Вход</h1>
      <p className="text-sm text-[#6B6560] mb-8">Введите ваши данные для входа</p>

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
