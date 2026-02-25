import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { getCurrentUserForDisplay } from '@/data/demo-profile-storage';
import { setDemoProfilePatch, type DemoProfilePatch } from '@/data/demo-profile-storage';
import { ROUTES } from '@/constants/routes';

const EditMyProfile: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUserForDisplay();
  const [form, setForm] = useState<DemoProfilePatch>({
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName ?? '',
    nickname: user.nickname ?? '',
    city: user.city ?? '',
    about: user.about ?? '',
  });

  useEffect(() => {
    const u = getCurrentUserForDisplay();
    setForm({
      firstName: u.firstName,
      lastName: u.lastName,
      middleName: u.middleName ?? '',
      nickname: u.nickname ?? '',
      city: u.city ?? '',
      about: u.about ?? '',
    });
  }, []);

  const handleSave = () => {
    setDemoProfilePatch({
      firstName: form.firstName.trim() || user.firstName,
      lastName: form.lastName.trim() || user.lastName,
      middleName: form.middleName.trim() || undefined,
      nickname: form.nickname.trim() || undefined,
      city: form.city.trim() || undefined,
      about: form.about.trim() || undefined,
    });
    navigate(ROUTES.classic.myProfile);
  };

  return (
    <AppLayout>
      <TopBar title="Редактировать профиль" onBack={() => navigate(ROUTES.classic.myProfile)} />
      <div className="px-4 pt-4 pb-8 page-enter max-w-xl mx-auto">
        <p className="text-sm text-muted-foreground mb-4">В демо изменения сохраняются в браузере и отображаются на странице «О себе».</p>
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Имя</span>
            <input
              type="text"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Имя"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Фамилия</span>
            <input
              type="text"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Фамилия"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Отчество</span>
            <input
              type="text"
              value={form.middleName}
              onChange={e => setForm(f => ({ ...f, middleName: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Отчество"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ник / как к вам обращаться</span>
            <input
              type="text"
              value={form.nickname}
              onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Никнейм"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Город</span>
            <input
              type="text"
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Город"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">О себе</span>
            <textarea
              value={form.about}
              onChange={e => setForm(f => ({ ...f, about: e.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              placeholder="Кратко о себе"
            />
          </label>
        </div>
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 touch-target min-h-[48px] rounded-2xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:opacity-90 transition-opacity"
          >
            Сохранить
          </button>
          <button
            onClick={() => navigate(ROUTES.classic.myProfile)}
            className="touch-target min-h-[48px] px-6 rounded-2xl border border-border bg-background font-medium hover:bg-muted/50 transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default EditMyProfile;
