import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/LanguageContext';

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title={t('privacyPolicy')} onBack={() => navigate(ROUTES.classic.settings, { replace: true })} light />
        <div className="mx-auto max-w-full px-4 pt-4 pb-8 sm:max-w-md md:max-w-2xl lg:max-w-4xl">
          <div className="text-base font-medium text-[var(--proto-text)] space-y-4">
            <p>Angelo заботится о конфиденциальности ваших данных и данных вашей семьи.</p>
            <h2 className="text-lg font-bold mt-6">1. Какие данные мы собираем</h2>
            <p>
              Мы храним данные, которые вы указываете при регистрации и в профиле (имя, контакты), а также контент, который
              вы загружаете: фото, видео, тексты и метаданные, связанные с семейными событиями.
            </p>
            <h2 className="text-lg font-bold mt-6">2. Как мы используем данные</h2>
            <p>
              Данные используются для работы сервиса: отображение дерева семьи, ленты, профилей и медиа только в рамках
              ваших настроек видимости. Мы не передаём ваши материалы третьим лицам в рекламных или маркетинговых целях.
            </p>
            <h2 className="text-lg font-bold mt-6">3. Кто видит ваш контент</h2>
            <p>
              Видимость контента настраивается вами: только вы, члены вашей семьи (приглашённые в дерево) или выбранные
              группы. По умолчанию контент доступен только участникам вашей семьи в приложении.
            </p>
            <h2 className="text-lg font-bold mt-6">4. Безопасность и хранение</h2>
            <p>
              Мы применяем технические меры для защиты данных. Вы можете в любой момент запросить экспорт или удаление
              своих данных через настройки или обратившись в поддержку.
            </p>
            <h2 className="text-lg font-bold mt-6">5. Контакты</h2>
            <p>По вопросам персональных данных и политики конфиденциальности обращайтесь через раздел «Помощь» в приложении.</p>
            <p className="mt-8 text-[var(--proto-text-muted)]">Дата последнего обновления: 2025.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PrivacyPage;
