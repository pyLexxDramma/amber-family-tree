import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { Bell, Lock, Palette, Globe, User, FileText, LogOut, Sun, Moon, ChevronRight } from 'lucide-react';
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
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title={t('settings')} onBack={() => navigate(-1)} light />
        <div className="mx-auto max-w-full px-3 pt-4 pb-8 sm:max-w-md sm:px-5 md:max-w-2xl lg:max-w-4xl overflow-x-hidden">
          <p className="text-xs font-semibold text-[var(--proto-active)] uppercase tracking-wider mb-3">{t('profile')}</p>
          <div className="space-y-2 mb-6">
            <button onClick={() => navigate(ROUTES.classic.myProfile)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/20 transition-all text-left">
              <div className="h-10 w-10 rounded-full bg-[var(--proto-active)]/15 flex items-center justify-center shrink-0"><User className="h-5 w-5 text-[var(--proto-active)]" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--proto-text)]">{t('profileDesc')}</p>
                <p className="text-xs text-[var(--proto-text-muted)] mt-0.5">{t('profileDescLong')}</p>
              </div>
            </button>
          </div>

          <p className="text-xs font-semibold text-[var(--proto-active)] uppercase tracking-wider mb-3">{t('security')}</p>
          <div className="space-y-2 mb-6">
            <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-red-500/30 transition-all text-left">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0"><LogOut className="h-5 w-5 text-red-600" /></div>
              <p className="text-sm font-semibold text-[var(--proto-text)]">{t('logout')}</p>
            </button>
          </div>

          <p className="text-xs font-semibold text-[var(--proto-active)] uppercase tracking-wider mb-3">{t('documents')}</p>
          <div className="space-y-2 mb-8">
            <button onClick={() => navigate(ROUTES.classic.terms)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/20 transition-all text-left">
              <div className="h-10 w-10 rounded-full bg-[var(--proto-active)]/15 flex items-center justify-center shrink-0"><FileText className="h-5 w-5 text-[var(--proto-active)]" /></div>
              <p className="text-sm font-semibold text-[var(--proto-text)]">{t('termsOfUse')}</p>
            </button>
            <button onClick={() => navigate(ROUTES.classic.privacy)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/20 transition-all text-left">
              <div className="h-10 w-10 rounded-full bg-[var(--proto-active)]/15 flex items-center justify-center shrink-0"><FileText className="h-5 w-5 text-[var(--proto-active)]" /></div>
              <p className="text-sm font-semibold text-[var(--proto-text)]">{t('privacyPolicy')}</p>
            </button>
          </div>

          <p className="text-xs font-semibold text-[var(--proto-active)] uppercase tracking-wider mb-3">{t('other')}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)]">
              <div className="h-10 w-10 rounded-full bg-[var(--proto-active)]/15 flex items-center justify-center shrink-0"><Palette className="h-5 w-5 text-[var(--proto-active)]" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--proto-text)]">{t('theme')}</p>
                <p className="text-xs text-[var(--proto-text-muted)] mt-0.5 flex items-center gap-1.5">
                  {mounted && (isDark ? <><Moon className="h-3.5 w-3.5" /> {t('themeDark')}</> : <><Sun className="h-3.5 w-3.5" /> {t('themeLight')}</>)}
                </p>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)]">
              <div className="h-10 w-10 rounded-full bg-[var(--proto-active)]/15 flex items-center justify-center shrink-0"><Bell className="h-5 w-5 text-[var(--proto-active)]" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--proto-text)]">{t('notifications')}</p>
                <p className="text-xs text-[var(--proto-text-muted)] mt-0.5">{t('notificationsDesc')}</p>
              </div>
              <Switch />
            </div>

            <button type="button" onClick={() => setPrivacyOpen(true)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/20 transition-all text-left">
              <div className="h-10 w-10 rounded-full bg-[var(--proto-active)]/15 flex items-center justify-center shrink-0"><Lock className="h-5 w-5 text-[var(--proto-active)]" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--proto-text)]">{t('privacy')}</p>
                <p className="text-xs text-[var(--proto-text-muted)] mt-0.5">{privacyLabel[visibility]}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--proto-text-muted)] shrink-0" />
            </button>

            <button type="button" onClick={() => setLanguageOpen(true)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/20 transition-all text-left">
              <div className="h-10 w-10 rounded-full bg-[var(--proto-active)]/15 flex items-center justify-center shrink-0"><Globe className="h-5 w-5 text-[var(--proto-active)]" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--proto-text)]">{t('language')}</p>
                <p className="text-xs text-[var(--proto-text-muted)] mt-0.5">{langLabel}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--proto-text-muted)] shrink-0" />
            </button>
          </div>
        </div>
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
                className={`touch-target min-h-[48px] rounded-xl border-2 px-4 text-left font-medium transition-colors ${locale === loc ? 'border-[var(--proto-active)] bg-[var(--proto-active)]/10 text-[var(--proto-active)]' : 'border-[var(--proto-border)] hover:border-[var(--proto-active)]/50 text-[var(--proto-text)]'}`}
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
                className={`touch-target min-h-[48px] rounded-xl border-2 px-4 text-left font-medium transition-colors ${visibility === v ? 'border-[var(--proto-active)] bg-[var(--proto-active)]/10 text-[var(--proto-active)]' : 'border-[var(--proto-border)] hover:border-[var(--proto-active)]/50 text-[var(--proto-text)]'}`}
              >
                {privacyLabel[v]}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Settings;
