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
      <div className="relative z-10 flex min-h-screen flex-col px-6 pt-6">
      <button onClick={() => navigate(-1)} className="mb-12 flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-xs tracking-widest uppercase font-light">Назад</span>
      </button>

      <h1 className="editorial-title text-3xl mb-2">Создать аккаунт</h1>

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
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 text-sm font-light cursor-pointer">
            <Checkbox checked={terms} onCheckedChange={v => setTerms(!!v)} className="mt-0.5" />
            <span>Я принимаю условия использования</span>
          </label>
          <label className="flex items-start gap-3 text-sm font-light cursor-pointer">
            <Checkbox checked={privacy} onCheckedChange={v => setPrivacy(!!v)} className="mt-0.5" />
            <span>Я согласен на обработку персональных данных</span>
          </label>
          <label className="flex items-start gap-3 text-sm font-light cursor-pointer">
            <Checkbox checked={dataProcessing} onCheckedChange={v => setDataProcessing(!!v)} className="mt-0.5" />
            <span>Я согласен на обработку данных (политика конфиденциальности)</span>
          </label>
        </div>

        {error && <p className="text-destructive text-xs font-light">{error}</p>}

        <button onClick={handleSubmit} className="w-full h-12 bg-foreground text-background text-sm font-light tracking-widest uppercase hover:bg-foreground/80 transition-all duration-300">
          Получить код
        </button>
        <p className="text-center text-sm font-light text-muted-foreground">
          Уже есть аккаунт?{' '}
          <button type="button" onClick={() => navigate('/login')} className="underline hover:text-foreground transition-colors">
            Войти
          </button>
        </p>
      </div>
      </div>
    </div>
  );
};

export default Register;
