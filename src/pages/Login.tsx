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
    if (value.trim().toLowerCase() === 'notfound@test.com') {
      setError('Пользователь не найден');
      return;
    }
    setError('');
    navigate('/confirm-code', { state: { contact: value, mode: 'login' } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pt-6">
      <button onClick={() => navigate(-1)} className="touch-target mb-10 flex items-center justify-center h-10 w-10 -ml-2 rounded-full bg-card text-foreground hover:bg-secondary transition-colors shadow-sm">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Вход</h1>
      <p className="text-sm text-muted-foreground mb-10">Введите ваши данные для входа</p>

      <div className="space-y-6">
        <div>
          <Label htmlFor="contact" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Телефон или email
          </Label>
          <Input
            id="contact"
            placeholder="+7 999 123 45 67 или you@email.com"
            value={value}
            onChange={e => { setValue(e.target.value); setError(''); }}
            className="mt-2 rounded-2xl border border-border bg-card text-foreground text-base h-12 focus-visible:border-primary/50 focus-visible:ring-primary/20"
          />
          {error && <p className="text-destructive text-sm mt-2 font-medium">{error}</p>}
        </div>
        <button onClick={handleSubmit} className="touch-target w-full h-12 rounded-2xl bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md shadow-primary/20">
          Получить код
        </button>
        <p className="text-center text-sm text-muted-foreground">
          Нет аккаунта?{' '}
          <button type="button" onClick={() => navigate('/register')} className="text-primary font-semibold hover:underline">
            Создать
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
