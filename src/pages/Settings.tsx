import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { ArrowLeft, Bell, Lock, Palette, Globe, User, FileText, LogOut } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate(ROUTES.home, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background px-6 pt-6 pb-8">
      <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-xs tracking-widest uppercase font-light">Назад</span>
      </button>

      <h1 className="editorial-title text-2xl mb-8">Настройки</h1>

      {/* По ТЗ: Профиль */}
      <p className="editorial-caption text-muted-foreground mb-2">Профиль</p>
      <div className="space-y-0 mb-6">
        <button onClick={() => navigate(ROUTES.classic.myProfile)} className="w-full flex items-center gap-4 py-4 border-b border-border/30 hover:opacity-70 transition-opacity text-left">
          <User className="h-4 w-4 text-muted-foreground/40" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-sm font-light tracking-wide">Имя и фото</p>
            <p className="text-xs font-light text-muted-foreground/50 mt-0.5">Изменить имя, аватар</p>
          </div>
        </button>
      </div>

      {/* По ТЗ: Безопасность */}
      <p className="editorial-caption text-muted-foreground mb-2">Безопасность</p>
      <div className="space-y-0 mb-6">
        <button onClick={handleLogout} className="w-full flex items-center gap-4 py-4 border-b border-border/30 hover:opacity-70 transition-opacity text-left">
          <LogOut className="h-4 w-4 text-muted-foreground/40" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-sm font-light tracking-wide">Выйти из аккаунта</p>
          </div>
        </button>
      </div>

      {/* По ТЗ: Документы */}
      <p className="editorial-caption text-muted-foreground mb-2">Документы</p>
      <div className="space-y-0 mb-8">
        <button className="w-full flex items-center gap-4 py-4 border-b border-border/30 hover:opacity-70 transition-opacity text-left">
          <FileText className="h-4 w-4 text-muted-foreground/40" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-sm font-light tracking-wide">Условия использования</p>
          </div>
        </button>
        <button className="w-full flex items-center gap-4 py-4 border-b border-border/30 last:border-b-0 hover:opacity-70 transition-opacity text-left">
          <FileText className="h-4 w-4 text-muted-foreground/40" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-sm font-light tracking-wide">Политика конфиденциальности</p>
          </div>
        </button>
      </div>

      <p className="editorial-caption text-muted-foreground mb-2">Другое</p>
      <div className="space-y-0">
        {[
          { icon: Bell, label: 'Уведомления', desc: 'Push и email' },
          { icon: Lock, label: 'Приватность', desc: 'Кто видит ваш контент' },
          { icon: Palette, label: 'Внешний вид', desc: 'Тема и отображение' },
          { icon: Globe, label: 'Язык', desc: 'Язык приложения' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-4 py-5 border-b border-border/30 last:border-b-0">
            <item.icon className="h-4 w-4 text-muted-foreground/40" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-sm font-light tracking-wide">{item.label}</p>
              <p className="text-xs font-light text-muted-foreground/50 mt-0.5">{item.desc}</p>
            </div>
            <Switch />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
