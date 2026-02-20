import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [dataProcessing, setDataProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!value.trim()) { setError('Введите телефон или email'); return; }
    if (!value.includes('@') && !/^\+?\d{7,}$/.test(value.replace(/\s/g, ''))) { setError('Некорректный формат телефона или email'); return; }
    if (!terms || !privacy || !dataProcessing) { setError('Необходимо принять все условия'); return; }
    setError('');
    navigate('/confirm-code', { state: { contact: value, mode: 'register' } });
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0">
        <img src="/bg-1.png" alt="" className="h-full w-full object-cover photo-bg-blur" />
        <div className="absolute inset-0 overlay-light" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col px-6 pt-6 page-enter">
      <button onClick={() => navigate(-1)} className="touch-target mb-12 flex items-center gap-2 min-h-touch min-w-[80px] -ml-2 rounded-xl border-2 border-primary/50 text-foreground/90 hover:text-primary hover:bg-primary/10 hover:border-primary/70 transition-colors px-3 py-2 font-semibold shadow-sm">
        <ArrowLeft className="h-5 w-5 shrink-0" />
        <span className="text-sm tracking-wide">Назад</span>
      </button>

      <h1 className="hero-title text-3xl sm:text-4xl mb-2">Создать аккаунт</h1>

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
        </div>

        <div className="space-y-5">
          <label className="flex items-center gap-3 text-base font-normal cursor-pointer min-h-touch">
            <Checkbox checked={terms} onCheckedChange={v => setTerms(!!v)} className="size-5 shrink-0" />
            <span>Я принимаю условия использования</span>
          </label>
          <label className="flex items-center gap-3 text-base font-normal cursor-pointer min-h-touch">
            <Checkbox checked={privacy} onCheckedChange={v => setPrivacy(!!v)} className="size-5 shrink-0" />
            <span>Я согласен на обработку персональных данных</span>
          </label>
          <label className="flex items-center gap-3 text-base font-normal cursor-pointer min-h-touch">
            <Checkbox checked={dataProcessing} onCheckedChange={v => setDataProcessing(!!v)} className="size-5 shrink-0" />
            <span>Я согласен на обработку данных (политика конфиденциальности)</span>
          </label>
        </div>

        {error && <p className="text-destructive text-sm font-medium">{error}</p>}

        <button onClick={handleSubmit} className="touch-target w-full min-h-[52px] rounded-xl bg-foreground text-background text-base font-medium tracking-wide hover:bg-foreground/90 active:opacity-95 transition-all duration-200">
          Получить код
        </button>
        <p className="text-center text-base font-normal text-muted-foreground">
          Уже есть аккаунт?{' '}
          <button type="button" onClick={() => navigate('/login')} className="touch-target inline-block py-1 px-2 rounded underline underline-offset-2 hover:text-foreground font-medium">
            Войти
          </button>
        </p>
      </div>
      </div>
    </div>
  );
};

export default Register;
