import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/LanguageContext';

const PrivacyPage: React.FC = () => {
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

      <h1 className="editorial-title text-3xl font-bold text-foreground mb-6 px-3">{t('privacyPolicy')}</h1>

      <div className="editorial-body text-base font-medium text-foreground/90 px-3 space-y-4">
        <p>Angelo заботится о конфиденциальности ваших данных и данных вашей семьи.</p>
        <h2 className="text-lg font-bold text-foreground mt-6">1. Какие данные мы собираем</h2>
        <p>
          Мы храним данные, которые вы указываете при регистрации и в профиле (имя, контакты), а также контент, который
          вы загружаете: фото, видео, тексты и метаданные, связанные с семейными событиями.
        </p>
        <h2 className="text-lg font-bold text-foreground mt-6">2. Как мы используем данные</h2>
        <p>
          Данные используются для работы сервиса: отображение дерева семьи, ленты, профилей и медиа только в рамках
          ваших настроек видимости. Мы не передаём ваши материалы третьим лицам в рекламных или маркетинговых целях.
        </p>
        <h2 className="text-lg font-bold text-foreground mt-6">3. Кто видит ваш контент</h2>
        <p>
          Видимость контента настраивается вами: только вы, члены вашей семьи (приглашённые в дерево) или выбранные
          группы. По умолчанию контент доступен только участникам вашей семьи в приложении.
        </p>
        <h2 className="text-lg font-bold text-foreground mt-6">4. Безопасность и хранение</h2>
        <p>
          Мы применяем технические меры для защиты данных. Вы можете в любой момент запросить экспорт или удаление
          своих данных через настройки или обратившись в поддержку.
        </p>
        <h2 className="text-lg font-bold text-foreground mt-6">5. Контакты</h2>
        <p>По вопросам персональных данных и политики конфиденциальности обращайтесь через раздел «Помощь» в приложении.</p>
        <p className="mt-8 text-foreground/80">Дата последнего обновления: 2025.</p>
      </div>
    </div>
  );
};

export default PrivacyPage;
