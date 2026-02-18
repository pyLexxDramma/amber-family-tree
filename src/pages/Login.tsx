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
      <div className="relative z-10 flex min-h-screen flex-col px-6 pt-6">
      <button onClick={() => navigate(-1)} className="mb-12 flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-xs tracking-widest uppercase font-light">Назад</span>
      </button>

      <h1 className="editorial-title text-3xl mb-2">Вход</h1>

      <div className="space-y-8 mt-8">
        <div>
          <Label htmlFor="contact" className="text-xs tracking-wider uppercase font-light text-muted-foreground">
            Телефон или email
          </Label>
          <Input
            id="contact"
            placeholder="+7 999 123 45 67 или you@email.com"
            value={value}
            onChange={e => { setValue(e.target.value); setError(''); }}
            className="mt-2 rounded-none border-0 border-b border-border bg-transparent px-0 text-sm font-light focus-visible:ring-0 focus-visible:border-foreground"
          />
          {error && <p className="text-destructive text-xs mt-2 font-light">{error}</p>}
        </div>
        <button onClick={handleSubmit} className="w-full h-12 bg-foreground text-background text-sm font-light tracking-widest uppercase hover:bg-foreground/80 transition-all duration-300">
          Получить код
        </button>
        <p className="text-center text-sm font-light text-muted-foreground">
          Нет аккаунта?{' '}
          <button type="button" onClick={() => navigate('/register')} className="underline hover:text-foreground transition-colors">
            Создать
          </button>
        </p>
      </div>
      </div>
    </div>
  );
};

export default Login;
