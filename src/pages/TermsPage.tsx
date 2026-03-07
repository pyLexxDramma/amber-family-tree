import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/LanguageContext';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title={t('termsOfUse')} onBack={() => navigate(ROUTES.classic.settings, { replace: true })} light />
        <div className="mx-auto max-w-full px-4 pt-4 pb-8 sm:max-w-md md:max-w-2xl lg:max-w-4xl">
          <div className="text-base font-medium text-[var(--proto-text)] space-y-4">
            <p>Добро пожаловать в Angelo — семейную сеть для хранения воспоминаний и общения с близкими.</p>
            <p>
              Используя приложение, вы соглашаетесь с настоящими условиями. Не используйте сервис, если вы с ними не согласны.
            </p>
            <h2 className="text-lg font-bold mt-6">1. Принятие условий</h2>
            <p>Регистрируясь или используя Angelo, вы подтверждаете, что прочитали и принимаете эти условия.</p>
            <h2 className="text-lg font-bold mt-6">2. Использование сервиса</h2>
            <p>
              Вы обязуетесь использовать Angelo только в законных целях, не нарушать права других пользователей и не
              загружать контент, который является незаконным или оскорбительным.
            </p>
            <h2 className="text-lg font-bold mt-6">3. Контент и ответственность</h2>
            <p>
              Вы несёте ответственность за контент, который публикуете. Angelo предоставляет инструменты для хранения и
              обмена семейными материалами в рамках выбранных вами настроек приватности.
            </p>
            <h2 className="text-lg font-bold mt-6">4. Изменения</h2>
            <p>
              Мы можем обновлять условия использования. О существенных изменениях мы уведомим через приложение или по
              указанной вами почте.
            </p>
            <p className="mt-8 text-[var(--proto-text-muted)]">Дата последнего обновления: 2025.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TermsPage;
