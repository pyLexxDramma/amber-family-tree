import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { getCurrentUserForDisplay } from '@/data/demo-profile-storage';
import { setDemoProfilePatch, type DemoProfilePatch } from '@/data/demo-profile-storage';
import { ROUTES } from '@/constants/routes';
import { isDemoMode } from '@/lib/demoMode';
import { api } from '@/integrations/api';
import { Camera } from 'lucide-react';
import type { FamilyMember } from '@/types';
import { getProfileExtras, setProfileExtras } from '@/lib/localUserData';

const field = (u: FamilyMember & { first_name?: string; last_name?: string }) => ({
  firstName: u.firstName ?? u.first_name ?? '',
  lastName: u.lastName ?? u.last_name ?? '',
  middleName: u.middleName ?? '',
  birthDate: u.birthDate ?? '',
  city: u.city ?? '',
  about: u.about ?? '',
});

const EditMyProfile: React.FC = () => {
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const isDemo = isDemoMode();
  const [user, setUser] = useState<FamilyMember | null>(null);
  const [form, setForm] = useState<DemoProfilePatch>(() => (isDemo ? field(getCurrentUserForDisplay()) : {}));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [extras, setExtras] = useState<{ phone: string; email: string }>({ phone: '', email: '' });

  useEffect(() => {
    if (isDemo) {
      const u = getCurrentUserForDisplay();
      setForm(field(u));
      const ex = getProfileExtras(u.id);
      setExtras({ phone: ex.phone ?? '', email: ex.email ?? '' });
    } else {
      api.profile.getMyProfile().then(u => {
        setUser(u);
        setForm(field(u));
        setAvatarUrl((u as { avatar?: string }).avatar ?? null);
        const ex = getProfileExtras(u.id);
        setExtras({ phone: ex.phone ?? '', email: ex.email ?? '' });
      });
    }
  }, [isDemo]);

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
      const putRes = await fetch(presign.upload_url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!putRes.ok) throw new Error('upload failed');
      setAvatarUrl(presign.url);
    } catch {
      setAvatarError('Не удалось загрузить');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    if (isDemo) {
      const u = getCurrentUserForDisplay();
      setDemoProfilePatch({
        firstName: form.firstName?.trim() || undefined,
        lastName: form.lastName?.trim() || undefined,
        middleName: form.middleName?.trim() || undefined,
        birthDate: form.birthDate?.trim() || undefined,
        city: form.city?.trim() || undefined,
        about: form.about?.trim() || undefined,
      });
      setProfileExtras(u.id, { phone: extras.phone, email: extras.email });
      navigate(ROUTES.classic.myProfile);
      return;
    }
    setSaving(true);
    try {
      if (user) setProfileExtras(user.id, { phone: extras.phone, email: extras.email });
      await api.profile.updateMyProfile({
        firstName: form.firstName?.trim() || undefined,
        lastName: form.lastName?.trim() || undefined,
        middleName: form.middleName?.trim() || undefined,
        birthDate: form.birthDate?.trim() || undefined,
        city: form.city?.trim() || undefined,
        about: form.about?.trim() || undefined,
        avatar: avatarUrl || undefined,
      });
      navigate(ROUTES.classic.myProfile);
    } catch {
      setSaving(false);
    }
  };

  const avatarSrc = avatarUrl ?? (user && (user as { avatar?: string }).avatar);

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title="Редактировать профиль" onBack={() => navigate(-1)} light />
        <div className="mx-auto max-w-full px-3 pt-4 pb-8 sm:max-w-md sm:px-5 md:max-w-2xl lg:max-w-4xl overflow-x-hidden">
          {isDemo && (
            <p className="text-sm text-[var(--proto-text-muted)] mb-4">В демо изменения сохраняются в браузере и отображаются на странице «О себе».</p>
          )}
          {!isDemo && (
            <div className="flex justify-center mb-6">
              <div className="relative">
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
                  <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-serif text-foreground/30">?</span>
                    )}
                  </div>
                  <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
                    <Camera className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </button>
                {avatarError && <p className="text-destructive text-xs mt-1 text-center">{avatarError}</p>}
                {avatarUploading && <p className="text-muted-foreground text-xs mt-1 text-center">Загрузка…</p>}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-[var(--proto-text-muted)] uppercase tracking-wider">Имя</span>
              <input
                type="text"
                value={form.firstName ?? ''}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-[var(--proto-border)] bg-[var(--proto-card)] px-4 py-3 text-[var(--proto-text)] placeholder:text-[var(--proto-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--proto-active)]"
                placeholder="Имя"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--proto-text-muted)] uppercase tracking-wider">Фамилия</span>
              <input
                type="text"
                value={form.lastName ?? ''}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-[var(--proto-border)] bg-[var(--proto-card)] px-4 py-3 text-[var(--proto-text)] placeholder:text-[var(--proto-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--proto-active)]"
                placeholder="Фамилия"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--proto-text-muted)] uppercase tracking-wider">Отчество</span>
              <input
                type="text"
                value={form.middleName ?? ''}
                onChange={e => setForm(f => ({ ...f, middleName: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-[var(--proto-border)] bg-[var(--proto-card)] px-4 py-3 text-[var(--proto-text)] placeholder:text-[var(--proto-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--proto-active)]"
                placeholder="Отчество"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--proto-text-muted)] uppercase tracking-wider">Живу в</span>
              <input
                type="text"
                value={form.city ?? ''}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-[var(--proto-border)] bg-[var(--proto-card)] px-4 py-3 text-[var(--proto-text)] placeholder:text-[var(--proto-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--proto-active)]"
                placeholder="Город"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--proto-text-muted)] uppercase tracking-wider">Дата рождения</span>
              <input
                type="date"
                value={form.birthDate ?? ''}
                onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-[var(--proto-border)] bg-[var(--proto-card)] px-4 py-3 text-[var(--proto-text)] focus:outline-none focus:ring-2 focus:ring-[var(--proto-active)]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--proto-text-muted)] uppercase tracking-wider">Телефон</span>
              <input
                type="tel"
                value={extras.phone}
                onChange={e => setExtras(x => ({ ...x, phone: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-[var(--proto-border)] bg-[var(--proto-card)] px-4 py-3 text-[var(--proto-text)] placeholder:text-[var(--proto-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--proto-active)]"
                placeholder="+7…"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--proto-text-muted)] uppercase tracking-wider">E-mail</span>
              <input
                type="email"
                value={extras.email}
                onChange={e => setExtras(x => ({ ...x, email: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-[var(--proto-border)] bg-[var(--proto-card)] px-4 py-3 text-[var(--proto-text)] placeholder:text-[var(--proto-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--proto-active)]"
                placeholder="name@email.com"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--proto-text-muted)] uppercase tracking-wider">О себе</span>
              <textarea
                value={form.about ?? ''}
                onChange={e => setForm(f => ({ ...f, about: e.target.value }))}
                rows={4}
                className="mt-1 w-full rounded-xl border border-[var(--proto-border)] bg-[var(--proto-card)] px-4 py-3 text-[var(--proto-text)] placeholder:text-[var(--proto-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--proto-active)] resize-y"
                placeholder="Кратко о себе"
              />
            </label>
          </div>
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 min-h-[48px] rounded-2xl bg-[var(--proto-active)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saving ? 'Сохранение…' : 'Сохранить'}
            </button>
            <button
              onClick={() => navigate(ROUTES.classic.myProfile)}
              disabled={saving}
              className="min-h-[48px] px-6 rounded-2xl border border-[var(--proto-border)] bg-[var(--proto-card)] font-medium text-[var(--proto-text)] hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default EditMyProfile;
