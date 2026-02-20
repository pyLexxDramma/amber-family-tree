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
    <div className="min-h-screen bg-background px-6 pt-6 pb-8 page-enter">
      <button onClick={() => navigate(-1)} className="touch-target mb-8 flex items-center gap-2 text-muted-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-primary/5 px-2 py-1 -ml-2">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-medium tracking-wide">Назад</span>
      </button>

      <h1 className="editorial-title text-2xl mb-8">Настройки</h1>

      <p className="section-title text-primary mb-3">Профиль</p>
      <div className="space-y-3 mb-6">
        <button onClick={() => navigate(ROUTES.classic.myProfile)} className="content-card w-full flex items-center gap-4 py-4 px-4 hover:border-primary/30 transition-colors text-left">
          <User className="h-5 w-5 text-primary/70" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-[15px] font-semibold tracking-wide text-foreground">Имя и фото</p>
            <p className="text-xs font-medium text-muted-foreground/70 mt-0.5">Изменить имя, аватар</p>
          </div>
        </button>
      </div>

      <p className="section-title text-primary mb-3">Безопасность</p>
      <div className="space-y-3 mb-6">
        <button onClick={handleLogout} className="content-card w-full flex items-center gap-4 py-4 px-4 hover:border-primary/30 transition-colors text-left">
          <LogOut className="h-5 w-5 text-primary/70" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-[15px] font-semibold tracking-wide text-foreground">Выйти из аккаунта</p>
          </div>
        </button>
      </div>

      <p className="section-title text-primary mb-3">Документы</p>
      <div className="space-y-3 mb-8">
        <button className="content-card w-full flex items-center gap-4 py-4 px-4 hover:border-primary/30 transition-colors text-left">
          <FileText className="h-5 w-5 text-primary/70" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-[15px] font-semibold tracking-wide text-foreground">Условия использования</p>
          </div>
        </button>
        <button className="content-card w-full flex items-center gap-4 py-4 px-4 hover:border-primary/30 transition-colors text-left">
          <FileText className="h-5 w-5 text-primary/70" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-[15px] font-semibold tracking-wide text-foreground">Политика конфиденциальности</p>
          </div>
        </button>
      </div>

      <p className="section-title text-primary mb-3">Другое</p>
      <div className="space-y-3">
        <div className="content-card flex items-center gap-4 py-5 px-4">
          <Palette className="h-5 w-5 text-primary/70" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-[15px] font-semibold tracking-wide text-foreground">Тема</p>
            <p className="text-xs font-medium text-muted-foreground/70 mt-0.5 flex items-center gap-1.5">
              {mounted && (isDark ? <><Moon className="h-3 w-3" /> Тёмная</> : <><Sun className="h-3 w-3" /> Светлая</>)}
            </p>
          </div>
          <Switch checked={isDark} onCheckedChange={toggleTheme} />
        </div>
        {[
          { icon: Bell, label: 'Уведомления', desc: 'Push и email' },
          { icon: Lock, label: 'Приватность', desc: 'Кто видит ваш контент' },
          { icon: Globe, label: 'Язык', desc: 'Язык приложения' },
        ].map(item => (
          <div key={item.label} className="content-card flex items-center gap-4 py-5 px-4">
            <item.icon className="h-5 w-5 text-primary/70" strokeWidth={1.8} />
            <div className="flex-1">
              <p className="text-[15px] font-semibold tracking-wide text-foreground">{item.label}</p>
              <p className="text-xs font-medium text-muted-foreground/70 mt-0.5">{item.desc}</p>
            </div>
            <Switch />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
