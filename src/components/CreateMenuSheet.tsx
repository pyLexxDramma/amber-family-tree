import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Video, Mic, FileText, Type } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

type CreateType = 'photo' | 'video' | 'audio' | 'document' | 'text';

export function CreateMenuSheet(props: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();

  const items: { id: CreateType; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'photo', label: 'Фото', Icon: Image },
    { id: 'video', label: 'Видео', Icon: Video },
    { id: 'audio', label: 'Аудио', Icon: Mic },
    { id: 'document', label: 'Документ', Icon: FileText },
    { id: 'text', label: 'Текст', Icon: Type },
  ];

  const go = (id: CreateType) => {
    props.onOpenChange(false);
    navigate(`${ROUTES.classic.create}?type=${encodeURIComponent(id)}`);
  };

  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-0 bg-[var(--proto-card)] px-5 pb-6 pt-5 text-[var(--proto-text)]"
        style={{ ['--proto-card' as string]: '#F0EDE8', ['--proto-border' as string]: '#E5E1DC', ['--proto-active' as string]: '#A39B8A', ['--proto-text-muted' as string]: '#6B6560', ['--proto-text' as string]: '#2B2622' }}
      >
        <SheetHeader className="text-left">
          <SheetTitle className="font-serif text-xl">Создать</SheetTitle>
        </SheetHeader>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {items.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
              className="rounded-2xl border border-[var(--proto-border)] bg-[var(--proto-bg)] px-4 py-4 text-left transition-colors hover:border-[var(--proto-active)]/50"
              style={{ ['--proto-bg' as string]: '#F7F4EF' }}
            >
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-[var(--proto-border)]/70 flex items-center justify-center text-[var(--proto-active)]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold">{label}</span>
              </div>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

