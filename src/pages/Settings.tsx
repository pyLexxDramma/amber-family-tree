import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { ROUTES } from '@/constants/routes';
import { ArrowLeft, Bell, Lock, Palette, Globe, User, FileText, LogOut, Sun, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogout = () => {
    navigate(ROUTES.home, { replace: true });
  };

  const isDark = mounted && theme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <div className="min-h-screen bg-background px-0 pt-6 pb-8 page-enter">
      <button onClick={() => navigate(-1)} className="touch-target mb-8 flex items-center gap-2 rounded-xl border-2 border-primary/50 text-foreground/90 hover:text-primary hover:bg-primary/10 hover:border-primary/70 transition-colors px-3 py-2 font-semibold shadow-sm">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-base tracking-wide">Назад</span>
      </button>

      <h1 className="editorial-title text-3xl font-bold text-foreground mb-8 px-3">Настройки</h1>

      <p className="section-title text-primary mb-3 px-3 text-lg">Профиль</p>
      <div className="space-y-3 mb-6">
        <button onClick={() => navigate(ROUTES.classic.myProfile)} className="content-card w-full flex items-center gap-4 min-h-[96px] py-5 px-5 hover:border-primary/30 transition-colors text-left">
          <User className="h-6 w-6 text-primary" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-base font-bold tracking-wide text-foreground">Имя и фото</p>
            <p className="text-sm font-medium text-foreground/85 mt-0.5">Изменить имя, аватар</p>
          </div>
        </button>
      </div>

      <p className="section-title text-primary mb-3 px-3 text-lg">Безопасность</p>
      <div className="space-y-3 mb-6">
        <button onClick={handleLogout} className="content-card w-full flex items-center gap-4 min-h-[96px] py-5 px-5 hover:border-primary/30 transition-colors text-left">
          <LogOut className="h-6 w-6 text-primary" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-base font-bold tracking-wide text-foreground">Выйти из аккаунта</p>
          </div>
        </button>
      </div>

      <p className="section-title text-primary mb-3 px-3 text-lg">Документы</p>
      <div className="space-y-3 mb-8">
        <button className="content-card w-full flex items-center gap-4 min-h-[96px] py-5 px-5 hover:border-primary/30 transition-colors text-left">
          <FileText className="h-6 w-6 text-primary" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-base font-bold tracking-wide text-foreground">Условия использования</p>
          </div>
        </button>
        <button className="content-card w-full flex items-center gap-4 min-h-[96px] py-5 px-5 hover:border-primary/30 transition-colors text-left">
          <FileText className="h-6 w-6 text-primary" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-base font-bold tracking-wide text-foreground">Политика конфиденциальности</p>
          </div>
        </button>
      </div>

      <p className="section-title text-primary mb-3 px-3 text-lg">Другое</p>
      <div className="space-y-3">
        <div className="content-card flex items-center gap-4 min-h-[96px] py-5 px-5">
          <Palette className="h-6 w-6 text-primary" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-base font-bold tracking-wide text-foreground">Тема</p>
            <p className="text-sm font-medium text-foreground/85 mt-0.5 flex items-center gap-1.5">
              {mounted && (isDark ? <><Moon className="h-4 w-4" /> Тёмная</> : <><Sun className="h-4 w-4" /> Светлая</>)}
            </p>
          </div>
          <Switch checked={isDark} onCheckedChange={toggleTheme} />
        </div>
        {[
          { icon: Bell, label: 'Уведомления', desc: 'Push и email' },
          { icon: Lock, label: 'Приватность', desc: 'Кто видит ваш контент' },
          { icon: Globe, label: 'Язык', desc: 'Язык приложения' },
        ].map(item => (
          <div key={item.label} className="content-card flex items-center gap-4 min-h-[96px] py-5 px-5">
            <item.icon className="h-6 w-6 text-primary" strokeWidth={1.8} />
            <div className="flex-1">
              <p className="text-base font-bold tracking-wide text-foreground">{item.label}</p>
              <p className="text-sm font-medium text-foreground/85 mt-0.5">{item.desc}</p>
            </div>
            <Switch />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
