import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ROUTES } from '@/constants/routes';
import { api } from '@/integrations/api';
import type { FamilyMember } from '@/types';
import { getPrototypeAvatarUrl } from '@/lib/prototype-assets';
import { currentUserId } from '@/data/mock-members';
import { toast } from '@/hooks/use-toast';

const emotionsAll = ['Радость', 'Счастье', 'Любовь', 'Тепло', 'Восторг', 'Гордость', 'Покой', 'Уют', 'Веселье', 'Благодарность'] as const;

const DemoAddPhoto: React.FC = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [pickedEmotions, setPickedEmotions] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [place, setPlace] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    api.family.listMembers().then(setMembers).catch(() => {});
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const publish = () => {
    toast({ title: 'Демо-режим', description: 'Публикация не сохраняется, но экран работает как в демо.' });
    navigate(ROUTES.classic.feed, { replace: true });
  };

  const people = useMemo(() => members.slice(0, 6), [members]);

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <div className="mx-auto max-w-full px-4 pt-6 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
          <div className="flex items-center gap-3 mb-5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)] hover:border-[var(--proto-active)]/40 transition-colors"
              aria-label="Назад"
            >
              ←
            </button>
            <h1 className="text-xl font-semibold text-[var(--proto-text)]">Новая фотография</h1>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.currentTarget.files?.[0];
              e.currentTarget.value = '';
              if (!f) return;
              if (photoUrl) URL.revokeObjectURL(photoUrl);
              setPhotoUrl(URL.createObjectURL(f));
            }}
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] overflow-hidden mb-4"
            style={{ aspectRatio: '16/9' }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-[var(--proto-text-muted)]">
                Нажмите, чтобы выбрать фото
              </div>
            )}
          </button>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-[var(--proto-border)] p-4">
              <label className="block text-xs font-semibold text-[var(--proto-text-muted)] mb-2">Описание</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full min-h-[88px] rounded-xl bg-[var(--proto-bg)] border border-[var(--proto-border)] px-3 py-2 text-sm text-[var(--proto-text)] focus:outline-none focus:border-[var(--proto-active)]/50"
                placeholder="Описание"
              />
              <label className="block text-xs font-semibold text-[var(--proto-text-muted)] mt-4 mb-2">Место</label>
              <input
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="w-full h-11 rounded-xl bg-[var(--proto-bg)] border border-[var(--proto-border)] px-3 text-sm text-[var(--proto-text)] focus:outline-none focus:border-[var(--proto-active)]/50"
                placeholder="Место"
              />
            </div>

            <div className="rounded-2xl bg-white border border-[var(--proto-border)] p-4">
              <p className="text-sm font-semibold text-[var(--proto-text)] mb-3">Кто на фото?</p>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {people.map((m) => {
                  const active = picked.includes(m.id);
                  const av = m.avatar ?? getPrototypeAvatarUrl(m.id, currentUserId);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPicked((prev) => active ? prev.filter(x => x !== m.id) : [...prev, m.id])}
                      className="shrink-0 flex flex-col items-center gap-2 w-[64px]"
                    >
                      <span className={`h-12 w-12 rounded-full overflow-hidden border ${active ? 'border-[#A39B8A]' : 'border-[var(--proto-border)]'}`}>
                        <img src={av} alt="" className="h-full w-full object-cover" />
                      </span>
                      <span className="text-[11px] text-[var(--proto-text)] line-clamp-1">{m.firstName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-[var(--proto-border)] p-4">
              <p className="text-sm font-semibold text-[var(--proto-text)] mb-3">Эмоции и чувства</p>
              <div className="flex flex-wrap gap-2">
                {emotionsAll.map((e) => {
                  const active = pickedEmotions.includes(e);
                  return (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setPickedEmotions((prev) => active ? prev.filter(x => x !== e) : [...prev, e])}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                        active ? 'bg-[#A39B8A] text-white border-[#A39B8A]' : 'bg-[var(--proto-bg)] text-[var(--proto-text)] border-[var(--proto-border)] hover:border-[var(--proto-active)]/40'
                      }`}
                    >
                      {e}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={publish}
              className="w-full h-12 rounded-2xl bg-[#A39B8A] text-white text-base font-semibold hover:opacity-90 active:scale-[0.99] transition-all"
            >
              Опубликовать
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DemoAddPhoto;

