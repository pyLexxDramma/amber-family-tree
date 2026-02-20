import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!value.trim()) { setError('Введите телефон или email'); return; }
    if (!value.includes('@') && !/^\+?\d{7,}$/.test(value.replace(/\s/g, ''))) {
      setError('Некорректный формат');
      return;
    }
    // Мок по ТЗ: «Пользователь не найден»
    if (value.trim().toLowerCase() === 'notfound@test.com') {
      setError('Пользователь не найден');
      return;
    }
    setError('');
    navigate('/confirm-code', { state: { contact: value, mode: 'login' } });
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0">
        <img src="/bg-2.png" alt="" className="h-full w-full object-cover photo-bg-blur" />
        <div className="absolute inset-0 overlay-light" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col px-6 pt-6 page-enter">
      <button onClick={() => navigate(-1)} className="touch-target mb-12 flex items-center gap-2 min-h-touch min-w-[80px] -ml-2 rounded-xl border-2 border-primary/50 text-foreground/90 hover:text-primary hover:bg-primary/10 hover:border-primary/70 transition-colors px-3 py-2 font-semibold shadow-sm">
        <ArrowLeft className="h-5 w-5 shrink-0" />
        <span className="text-sm tracking-wide">Назад</span>
      </button>

      <h1 className="hero-title text-3xl sm:text-4xl mb-2">Вход</h1>

      <div className="space-y-8 mt-10">
        <div>
          <Label htmlFor="contact" className="text-sm font-medium text-foreground/90">
            Телефон или email
          </Label>
          <Input
            id="contact"
            placeholder="+7 999 123 45 67 или you@email.com"
            value={value}
            onChange={e => { setValue(e.target.value); setError(''); }}
            className="mt-3 rounded-xl border border-input bg-background text-base font-normal focus-visible:border-foreground"
          />
          {error && <p className="text-destructive text-sm mt-2 font-medium">{error}</p>}
        </div>
        <button onClick={handleSubmit} className="touch-target w-full min-h-[52px] rounded-xl bg-foreground text-background text-base font-medium tracking-wide hover:bg-foreground/90 active:opacity-95 transition-all duration-200">
          Получить код
        </button>
        <p className="text-center text-base font-normal text-muted-foreground">
          Нет аккаунта?{' '}
          <button type="button" onClick={() => navigate('/register')} className="touch-target inline-block py-1 px-2 rounded underline underline-offset-2 hover:text-foreground font-medium">
            Создать
          </button>
        </p>
      </div>
      </div>
    </div>
  );
};

export default Login;
