import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { ROUTES } from '@/constants/routes';
import { ArrowLeft, Bell, Lock, Palette, Globe, User, FileText, LogOut, Sun, Moon, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePrivacyVisibility, type PrivacyVisibility } from '@/contexts/PrivacyVisibilityContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useLanguage();
  const { visibility, setVisibility } = usePrivacyVisibility();
  const [mounted, setMounted] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogout = () => {
    navigate(ROUTES.home, { replace: true });
  };

  const isDark = mounted && theme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  const privacyLabel: Record<PrivacyVisibility, string> = {
    all: t('privacyAll'),
    family: t('privacyFamily'),
    only_me: t('privacyOnlyMe'),
  };

  const langLabel = locale === 'ru' ? t('langRu') : t('langEn');

  return (
    <div className="min-h-screen bg-background px-0 pt-6 pb-8 page-enter">
      <button onClick={() => navigate(-1)} className="touch-target mb-8 flex items-center gap-2 rounded-xl border-2 border-primary/50 text-foreground/90 hover:text-primary hover:bg-primary/10 hover:border-primary/70 transition-colors px-3 py-2 font-semibold shadow-sm">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-base tracking-wide">{t('back')}</span>
      </button>

      <h1 className="editorial-title text-3xl font-bold text-foreground mb-8 px-3">{t('settings')}</h1>

      <p className="section-title text-primary mb-3 px-3 text-lg">{t('profile')}</p>
      <div className="space-y-3 mb-6">
        <button onClick={() => navigate(ROUTES.classic.myProfile)} className="content-card w-full flex items-center gap-4 min-h-[96px] py-5 px-5 hover:border-primary/30 transition-colors text-left">
          <User className="h-6 w-6 text-primary" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-base font-bold tracking-wide text-foreground">{t('profileDesc')}</p>
            <p className="text-sm font-medium text-foreground/85 mt-0.5">{t('profileDescLong')}</p>
          </div>
        </button>
      </div>

      <p className="section-title text-primary mb-3 px-3 text-lg">{t('security')}</p>
      <div className="space-y-3 mb-6">
        <button onClick={handleLogout} className="content-card w-full flex items-center gap-4 min-h-[96px] py-5 px-5 hover:border-primary/30 transition-colors text-left">
          <LogOut className="h-6 w-6 text-primary" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-base font-bold tracking-wide text-foreground">{t('logout')}</p>
          </div>
        </button>
      </div>

      <p className="section-title text-primary mb-3 px-3 text-lg">{t('documents')}</p>
      <div className="space-y-3 mb-8">
        <button onClick={() => navigate(ROUTES.classic.terms)} className="content-card w-full flex items-center gap-4 min-h-[96px] py-5 px-5 hover:border-primary/30 transition-colors text-left">
          <FileText className="h-6 w-6 text-primary" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-base font-bold tracking-wide text-foreground">{t('termsOfUse')}</p>
          </div>
        </button>
        <button onClick={() => navigate(ROUTES.classic.privacy)} className="content-card w-full flex items-center gap-4 min-h-[96px] py-5 px-5 hover:border-primary/30 transition-colors text-left">
          <FileText className="h-6 w-6 text-primary" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-base font-bold tracking-wide text-foreground">{t('privacyPolicy')}</p>
          </div>
        </button>
      </div>

      <p className="section-title text-primary mb-3 px-3 text-lg">{t('other')}</p>
      <div className="space-y-3">
        <div className="content-card flex items-center gap-4 min-h-[96px] py-5 px-5">
          <Palette className="h-6 w-6 text-primary" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-base font-bold tracking-wide text-foreground">{t('theme')}</p>
            <p className="text-sm font-medium text-foreground/85 mt-0.5 flex items-center gap-1.5">
              {mounted && (isDark ? <><Moon className="h-4 w-4" /> {t('themeDark')}</> : <><Sun className="h-4 w-4" /> {t('themeLight')}</>)}
            </p>
          </div>
          <Switch checked={isDark} onCheckedChange={toggleTheme} />
        </div>

        <div className="content-card flex items-center gap-4 min-h-[96px] py-5 px-5">
          <Bell className="h-6 w-6 text-primary" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-base font-bold tracking-wide text-foreground">{t('notifications')}</p>
            <p className="text-sm font-medium text-foreground/85 mt-0.5">{t('notificationsDesc')}</p>
          </div>
          <Switch />
        </div>

        <button type="button" onClick={() => setPrivacyOpen(true)} className="content-card w-full flex items-center gap-4 min-h-[96px] py-5 px-5 hover:border-primary/30 transition-colors text-left">
          <Lock className="h-6 w-6 text-primary" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-base font-bold tracking-wide text-foreground">{t('privacy')}</p>
            <p className="text-sm font-medium text-foreground/85 mt-0.5">{privacyLabel[visibility]}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-foreground/60 shrink-0" />
        </button>

        <button type="button" onClick={() => setLanguageOpen(true)} className="content-card w-full flex items-center gap-4 min-h-[96px] py-5 px-5 hover:border-primary/30 transition-colors text-left">
          <Globe className="h-6 w-6 text-primary" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-base font-bold tracking-wide text-foreground">{t('language')}</p>
            <p className="text-sm font-medium text-foreground/85 mt-0.5">{langLabel}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-foreground/60 shrink-0" />
        </button>
      </div>

      <Dialog open={languageOpen} onOpenChange={setLanguageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('selectLanguage')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            {(['ru', 'en'] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => { setLocale(loc); setLanguageOpen(false); }}
                className={`touch-target min-h-[48px] rounded-xl border-2 px-4 text-left font-medium transition-colors ${locale === loc ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50 text-foreground'}`}
              >
                {loc === 'ru' ? t('langRu') : t('langEn')}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('selectPrivacy')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            {(['all', 'family', 'only_me'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => { setVisibility(v); setPrivacyOpen(false); }}
                className={`touch-target min-h-[48px] rounded-xl border-2 px-4 text-left font-medium transition-colors ${visibility === v ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50 text-foreground'}`}
              >
                {privacyLabel[v]}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
