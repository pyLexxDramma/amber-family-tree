import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ROUTES } from '@/constants/routes';
import { api } from '@/integrations/api';
import { isMockUploadUrl } from '@/integrations/mockApi';
import { toast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';

const CreateMemberProfile: React.FC = () => {
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
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

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    e.currentTarget.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 20 * 1_000_000) {
      setAvatarError('Макс. 20 МБ');
      return;
    }
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      const presign = await api.media.presign({ filename: file.name, content_type: file.type, file_size_bytes: file.size });
      if (!isMockUploadUrl(presign.upload_url)) {
        const putRes = await fetch(presign.upload_url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
        if (!putRes.ok) throw new Error('upload failed');
      }
      setAvatarUrl(presign.url);
    } catch {
      setAvatarError('Не удалось загрузить');
    } finally {
      setAvatarUploading(false);
    }
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
      if (avatarUrl) {
        await api.family.updateMember(member.id, { avatar: avatarUrl });
      }
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
          <div className="flex justify-center mb-6">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp"
              className="sr-only"
              onChange={handleAvatarSelect}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="relative block"
            >
              <div className="h-24 w-24 rounded-full bg-[var(--proto-card)] border border-[var(--proto-border)] flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-serif text-[var(--proto-text-muted)]">?</span>
                )}
              </div>
              <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--proto-active)] text-white">
                <Camera className="h-3.5 w-3.5" aria-hidden />
              </span>
            </button>
            {avatarError && <p className="text-red-600 text-xs mt-1 text-center">{avatarError}</p>}
            {avatarUploading && <p className="text-[var(--proto-text-muted)] text-xs mt-1 text-center">Загрузка…</p>}
          </div>
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
