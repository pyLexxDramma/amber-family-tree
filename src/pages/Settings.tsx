import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { ROUTES } from '@/constants/routes';
import { ArrowLeft, Bell, Lock, Palette, Globe, User, FileText, LogOut, Sun, Moon, ChevronRight, Layout } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePrivacyVisibility, type PrivacyVisibility } from '@/contexts/PrivacyVisibilityContext';
import { useUIVariant, type UIVariant } from '@/contexts/UIVariantContext';

const VARIANT_LABELS: Record<UIVariant, string> = {
  current: 'Текущий',
  classic: 'Классический архив',
  living: 'Живая история',
  calendar: 'Календарь воспоминаний',
  journal: 'Журнал + Плеер',
  minimal: 'Минимализм',
  retro: 'Ретро',
};

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useLanguage();
  const { visibility, setVisibility } = usePrivacyVisibility();
  const { variant } = useUIVariant();
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
    <div className="min-h-screen bg-background px-4 pt-6 pb-8">
      <button onClick={() => navigate(-1)} className="touch-target mb-8 flex items-center justify-center h-10 w-10 -ml-2 rounded-full bg-card text-foreground hover:bg-secondary transition-colors shadow-sm">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="font-serif text-2xl font-bold text-foreground mb-8">{t('settings')}</h1>

      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">{t('profile')}</p>
      <div className="space-y-2 mb-6">
        <button onClick={() => navigate(ROUTES.classic.myProfile)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/30 shadow-sm hover:shadow-md hover:border-primary/20 transition-all text-left">
          <div className="h-10 w-10 rounded-full bg-[hsl(28,55%,42%)]/15 flex items-center justify-center shrink-0"><User className="h-5 w-5 text-[hsl(28,55%,42%)]" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{t('profileDesc')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t('profileDescLong')}</p>
          </div>
        </button>
      </div>

      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">{t('security')}</p>
      <div className="space-y-2 mb-6">
        <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/30 shadow-sm hover:shadow-md hover:border-primary/20 transition-all text-left">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0"><LogOut className="h-5 w-5 text-destructive" /></div>
          <p className="text-sm font-semibold text-foreground">{t('logout')}</p>
        </button>
      </div>

      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">{t('documents')}</p>
      <div className="space-y-2 mb-8">
        <button onClick={() => navigate(ROUTES.classic.terms)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/30 shadow-sm hover:shadow-md hover:border-primary/20 transition-all text-left">
          <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0"><FileText className="h-5 w-5 text-primary" /></div>
          <p className="text-sm font-semibold text-foreground">{t('termsOfUse')}</p>
        </button>
        <button onClick={() => navigate(ROUTES.classic.privacy)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/30 shadow-sm hover:shadow-md hover:border-primary/20 transition-all text-left">
          <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0"><FileText className="h-5 w-5 text-primary" /></div>
          <p className="text-sm font-semibold text-foreground">{t('privacyPolicy')}</p>
        </button>
      </div>

      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">{t('other')}</p>
      <div className="space-y-2">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/30 shadow-sm">
          <div className="h-10 w-10 rounded-full bg-[hsl(280,50%,55%)]/15 flex items-center justify-center shrink-0"><Palette className="h-5 w-5 text-[hsl(280,50%,55%)]" /></div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{t('theme')}</p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              {mounted && (isDark ? <><Moon className="h-3.5 w-3.5" /> {t('themeDark')}</> : <><Sun className="h-3.5 w-3.5" /> {t('themeLight')}</>)}
            </p>
          </div>
          <Switch checked={isDark} onCheckedChange={toggleTheme} />
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/30 shadow-sm">
          <div className="h-10 w-10 rounded-full bg-[hsl(38,65%,52%)]/15 flex items-center justify-center shrink-0"><Bell className="h-5 w-5 text-[hsl(38,65%,52%)]" /></div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{t('notifications')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t('notificationsDesc')}</p>
          </div>
          <Switch />
        </div>

        <button type="button" onClick={() => setPrivacyOpen(true)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/30 shadow-sm hover:shadow-md hover:border-primary/20 transition-all text-left">
          <div className="h-10 w-10 rounded-full bg-[hsl(160,45%,45%)]/15 flex items-center justify-center shrink-0"><Lock className="h-5 w-5 text-[hsl(160,45%,45%)]" /></div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{t('privacy')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{privacyLabel[visibility]}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>

        <button type="button" onClick={() => setLanguageOpen(true)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/30 shadow-sm hover:shadow-md hover:border-primary/20 transition-all text-left">
          <div className="h-10 w-10 rounded-full bg-[hsl(210,55%,50%)]/15 flex items-center justify-center shrink-0"><Globe className="h-5 w-5 text-[hsl(210,55%,50%)]" /></div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{t('language')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{langLabel}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>

        <button type="button" onClick={() => navigate(ROUTES.classic.demoVariants)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/30 shadow-sm hover:shadow-md hover:border-primary/20 transition-all text-left">
          <div className="h-10 w-10 rounded-full bg-[hsl(340,50%,50%)]/15 flex items-center justify-center shrink-0"><Layout className="h-5 w-5 text-[hsl(340,50%,50%)]" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Вариант оформления</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate" title={VARIANT_LABELS[variant]}>Выбрано: {VARIANT_LABELS[variant]}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
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
