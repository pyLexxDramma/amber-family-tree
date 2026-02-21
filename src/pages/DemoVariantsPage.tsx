import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { useUIVariant, type UIVariant } from '@/contexts/UIVariantContext';
import { Check, BookOpen, History, Calendar, Headphones, Layout } from 'lucide-react';

/** Превью: положите в public файлы «вариант 1.jpeg», «вариант 2.jpeg», «вариант 3.jpeg» (или variant1.jpg и т.д.) */
const VARIANT_PREVIEWS: Record<UIVariant, string | null> = {
  current: null,
  classic: '/вариант 1.jpeg',
  living: '/вариант 2.jpeg',
  calendar: '/вариант 3.jpeg',
  journal: null,
};

const VARIANTS: { id: UIVariant; title: string; subtitle: string; icon: React.ElementType }[] = [
  { id: 'current', title: 'Текущий интерфейс', subtitle: 'То, как приложение выглядит сейчас', icon: Layout },
  { id: 'classic', title: 'Классический семейный архив', subtitle: 'Обложка журнала · Витрина (лента альбомов)', icon: BookOpen },
  { id: 'living', title: 'Живая история', subtitle: 'Разворот с мемуарами · Просмотр фото с подписью', icon: History },
  { id: 'calendar', title: 'Календарь воспоминаний', subtitle: 'Интерактивная хронология · Лента по годам', icon: Calendar },
  { id: 'journal', title: 'Журнал + Плеер', subtitle: 'Озвучка для слабовидящих · Просмотр с аудио', icon: Headphones },
];

export default function DemoVariantsPage() {
  const navigate = useNavigate();
  const { variant, setVariant } = useUIVariant();

  return (
    <AppLayout>
      <TopBar title="Варианты интерфейса" onBack={() => navigate(-1)} />
      <div className="px-6 pt-4 pb-8 page-enter">
        <p className="section-title text-primary mb-2">Для клиента</p>
        <p className="text-base text-muted-foreground mb-6">Выберите вариант оформления. Изменения применяются сразу.</p>

        <div className="space-y-4">
          {VARIANTS.map(({ id, title, subtitle, icon: Icon }) => {
            const preview = VARIANT_PREVIEWS[id];
            const isSelected = variant === id;
            return (
              <VariantCard
                key={id}
                id={id}
                title={title}
                subtitle={subtitle}
                Icon={Icon}
                preview={preview}
                isSelected={isSelected}
                onSelect={() => setVariant(id)}
              />
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

function VariantCard({
  id,
  title,
  subtitle,
  Icon,
  preview,
  isSelected,
  onSelect,
}: {
  id: UIVariant;
  title: string;
  subtitle: string;
  Icon: React.ElementType;
  preview: string | null;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = preview && !imgFailed;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`content-card w-full overflow-hidden text-left transition-all duration-200 ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      <div className="flex gap-4 p-4">
        <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-muted/80 flex items-center justify-center overflow-hidden">
          {showImg ? (
            <img src={preview!} alt="" className="w-full h-full object-cover" onError={() => setImgFailed(true)} />
          ) : (
            <Icon className="h-9 w-9 text-primary/60" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground truncate">{title}</p>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{subtitle}</p>
          {isSelected && (
            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary">
              <Check className="h-4 w-4" /> Выбрано
            </p>
          )}
        </div>
        {isSelected && (
          <div className="flex-shrink-0 rounded-full bg-primary/20 p-1.5">
            <Check className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
    </button>
  );
}
