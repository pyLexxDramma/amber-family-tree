import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ROUTES } from '@/constants/routes';
import { api } from '@/integrations/api';
import { toast } from '@/hooks/use-toast';

const EditMemberProfile: React.FC = () => {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    api.family.getMember(id).then(m => {
      setForm({
        firstName: m.firstName ?? '',
        lastName: m.lastName ?? '',
        middleName: m.middleName ?? '',
        birthDate: m.birthDate ?? '',
        deathDate: m.deathDate ?? '',
        city: m.city ?? '',
        about: m.about ?? '',
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Обязательное поле';
    if (!form.lastName.trim()) e.lastName = 'Обязательное поле';
    if (!form.birthDate.trim()) e.birthDate = 'Обязательное поле';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!id || !validate()) return;
    setSaving(true);
    setErrors({});
    try {
      await api.family.updateMember(id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        middleName: form.middleName.trim() || undefined,
        birthDate: form.birthDate.trim(),
        deathDate: form.deathDate.trim() || undefined,
        city: form.city.trim() || undefined,
        about: form.about.trim() || undefined,
      });
      toast({ title: 'Профиль обновлён' });
      navigate(ROUTES.classic.profile(id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось сохранить';
      const is403 = typeof err === 'object' && err !== null && 'status' in err && (err as { status?: number }).status === 403;
      toast({ title: is403 ? 'Нет прав на редактирование' : msg, variant: 'destructive' });
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

  if (loading) {
    return (
      <AppLayout>
        <div className="prototype-screen p-6 text-center text-[var(--proto-text-muted)]">Загрузка…</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title="Редактировать профиль" onBack={() => navigate(-1)} light />
        <div className="mx-auto max-w-full px-4 pt-4 pb-24 sm:max-w-md">
          <div className="space-y-4">
            {field('lastName', 'Фамилия', true)}
            {field('firstName', 'Имя', true)}
            {field('middleName', 'Отчество')}
            {field('birthDate', 'Дата рождения', true, 'date')}
            {field('deathDate', 'Дата смерти', false, 'date')}
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
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default EditMemberProfile;
