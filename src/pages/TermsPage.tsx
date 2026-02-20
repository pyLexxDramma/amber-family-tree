import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/LanguageContext';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background px-0 pt-6 pb-8 page-enter">
      <button
        onClick={() => navigate(ROUTES.classic.settings, { replace: true })}
        className="touch-target mb-8 flex items-center gap-2 rounded-xl border-2 border-primary/50 text-foreground/90 hover:text-primary hover:bg-primary/10 hover:border-primary/70 transition-colors px-3 py-2 font-semibold shadow-sm"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-base tracking-wide">{t('back')}</span>
      </button>

      <h1 className="editorial-title text-3xl font-bold text-foreground mb-6 px-3">{t('termsOfUse')}</h1>

      <div className="editorial-body text-base font-medium text-foreground/90 px-3 space-y-4">
        <p>Добро пожаловать в Angelo — семейную сеть для хранения воспоминаний и общения с близкими.</p>
        <p>
          Используя приложение, вы соглашаетесь с настоящими условиями. Не используйте сервис, если вы с ними не согласны.
        </p>
        <h2 className="text-lg font-bold text-foreground mt-6">1. Принятие условий</h2>
        <p>Регистрируясь или используя Angelo, вы подтверждаете, что прочитали и принимаете эти условия.</p>
        <h2 className="text-lg font-bold text-foreground mt-6">2. Использование сервиса</h2>
        <p>
          Вы обязуетесь использовать Angelo только в законных целях, не нарушать права других пользователей и не
          загружать контент, который является незаконным или оскорбительным.
        </p>
        <h2 className="text-lg font-bold text-foreground mt-6">3. Контент и ответственность</h2>
        <p>
          Вы несёте ответственность за контент, который публикуете. Angelo предоставляет инструменты для хранения и
          обмена семейными материалами в рамках выбранных вами настроек приватности.
        </p>
        <h2 className="text-lg font-bold text-foreground mt-6">4. Изменения</h2>
        <p>
          Мы можем обновлять условия использования. О существенных изменениях мы уведомим через приложение или по
          указанной вами почте.
        </p>
        <p className="mt-8 text-foreground/80">Дата последнего обновления: 2025.</p>
      </div>
    </div>
  );
};

export default TermsPage;
