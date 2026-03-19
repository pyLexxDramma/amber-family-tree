import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ROUTES } from '@/constants/routes';
import { api } from '@/integrations/api';
import { toast } from '@/hooks/use-toast';

const CreateMemberProfile: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    birthDate: '',
    deathDate: '',
    city: '',
    about: '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Обязательное поле';
    if (!form.lastName.trim()) e.lastName = 'Обязательное поле';
    if (!form.birthDate.trim()) e.birthDate = 'Обязательное поле';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setErrors({});
    try {
      const member = await api.family.createMember({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        middle_name: form.middleName.trim() || null,
        birth_date: form.birthDate.trim(),
        death_date: form.deathDate.trim() || null,
        city: form.city.trim() || null,
        about: form.about.trim() || null,
      });
      toast({ title: 'Профиль создан' });
      navigate(ROUTES.classic.profile(member.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось создать профиль';
      const is403 = typeof err === 'object' && err !== null && 'status' in err && (err as { status?: number }).status === 403;
      toast({ title: is403 ? 'Только админ может создавать профили' : msg, variant: 'destructive' });
      setErrors({ _save: msg });
    } finally {
      setSaving(false);
    }
  };

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
          className="mt-2 rounded-xl border border-[var(--proto-border)] bg-[var(--proto-card)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--proto-active)]/30"
          placeholder="Кратко о человеке (по желанию)"
        />
      ) : (
        <Input
          id={key}
          type={type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="mt-2 rounded-xl border border-[var(--proto-border)] bg-[var(--proto-card)] px-4 h-11"
        />
      )}
      {errors[key] && <p className="text-red-600 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title="Создать профиль" onBack={() => navigate(-1)} light />
        <div className="mx-auto max-w-full px-4 pt-4 pb-24 sm:max-w-md">
          <p className="text-sm text-[var(--proto-text-muted)] mb-6">
            Профиль ребёнка или умершего родственника, который не может создать свой. Создавать может только админ семьи.
          </p>
          <div className="space-y-4">
            {field('lastName', 'Фамилия', true)}
            {field('firstName', 'Имя', true)}
            {field('middleName', 'Отчество')}
            {field('birthDate', 'Дата рождения', true, 'date')}
            {field('deathDate', 'Дата смерти (если применимо)', false, 'date')}
            {field('city', 'Город')}
            {field('about', 'О человеке')}
          </div>
          {errors._save && <p className="text-red-600 text-sm mt-4">{errors._save}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="mt-6 w-full h-12 rounded-2xl bg-[var(--proto-active)] text-white text-base font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Создание…' : 'Создать'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateMemberProfile;
