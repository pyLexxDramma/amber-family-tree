import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera } from 'lucide-react';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ lastName: '', firstName: '', middleName: '', birthDate: '', city: '', about: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.lastName.trim()) e.lastName = 'Обязательное поле';
    if (!form.firstName.trim()) e.firstName = 'Обязательное поле';
    if (!form.birthDate) e.birthDate = 'Обязательное поле';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) navigate(ROUTES.classic.tree); };

  const field = (key: keyof typeof form, label: string, required = false, type = 'text') => (
    <div>
      <Label htmlFor={key} className="text-xs tracking-wider uppercase font-light text-muted-foreground">
        {label}{required && ' *'}
      </Label>
      {key === 'about' ? (
        <Textarea
          id={key}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="mt-2 rounded-none border-0 border-b border-border bg-transparent px-0 text-sm font-light focus-visible:ring-0 focus-visible:border-foreground resize-none"
          placeholder="Коротко о себе (по желанию)"
        />
      ) : (
        <Input
          id={key}
          type={type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="mt-2 rounded-none border-0 border-b border-border bg-transparent px-0 text-sm font-light focus-visible:ring-0 focus-visible:border-foreground"
        />
      )}
      {errors[key] && <p className="text-destructive text-xs mt-1 font-light">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pt-8 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex rounded-full bg-foreground/15 p-1">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">1 шаг</span>
        </div>
        <div className="h-0.5 flex-1 max-w-[80px] bg-foreground/20 rounded" />
        <span className="text-xs font-light text-muted-foreground">2 шаг</span>
      </div>
      <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Давайте настроим профиль</h1>
      <p className="text-muted-foreground text-sm font-light mb-8">Заполните основные данные — так близкие узнают вас в дереве</p>

      <div className="flex justify-center my-8">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            <span className="text-2xl font-serif text-foreground/30">?</span>
          </div>
          <button type="button" className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-xs font-light">
            <Camera className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {field('lastName', 'Фамилия', true)}
        {field('firstName', 'Имя', true)}
        {field('middleName', 'Отчество')}
        {field('birthDate', 'Дата рождения', true, 'date')}
        {field('city', 'Живу в')}
        {field('about', 'О себе')}
      </div>

      <div className="mt-12 flex gap-4">
        <button
          type="button"
          onClick={() => navigate(ROUTES.classic.tree)}
          className="touch-target flex-1 min-h-[52px] rounded-2xl border-2 border-foreground/25 text-base font-medium hover:bg-foreground hover:text-background transition-all duration-200"
        >
          Пропустить
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="touch-target flex-1 min-h-[52px] rounded-2xl bg-primary text-primary-foreground text-base font-medium hover:bg-primary/90 active:opacity-95 transition-all duration-200 shadow-md"
        >
          Далее
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
