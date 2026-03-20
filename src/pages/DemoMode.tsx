import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { isDemoMode, setDemoMode } from '@/lib/demoMode';
import { mockPublications } from '@/data/mock-publications';
import { BrandLogoCircle } from '@/components/BrandLogoCircle';

const DEMO_VIDEO_ASSETS = import.meta.glob('../../_ref/Демо/**/*.{webm,mp4}', { eager: true, import: 'default', query: '?url' }) as Record<string, string>;
const demoVideoUrl =
  DEMO_VIDEO_ASSETS['../../_ref/Демо/Медиа для демо аккаунта + описание/Медиа для демо аккаунта + описание/Демо от маркетологов ZDES.mp4']
  ?? DEMO_VIDEO_ASSETS['../../_ref/Демо/Демо от маркетологов ZDES.webm']
  ?? `${import.meta.env.BASE_URL}demo/media/${encodeURIComponent('Демо от маркетологов ZDES.mp4')}`;

const DemoMode: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F8F5F1] overflow-x-hidden relative">
      <div className="absolute top-4 right-4 z-10">
        <BrandLogoCircle className="h-11 w-11 border-[#E5E1DC] bg-[#F0EDE8]" />
      </div>
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="rounded-2xl bg-[#F0EDE8] border border-[#E5E1DC] p-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-brand text-3xl font-bold text-[#333333] leading-tight">Angelo</p>
              <p className="text-sm text-[#6B6560] mt-1">Демо-режим: видео + публикации + медиа</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setDemoMode(true); navigate(ROUTES.classic.tree); }}
                className="h-11 px-4 rounded-xl bg-[#A39B8A] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.99] transition-all"
              >
                Войти в демо
              </button>
              <button
                type="button"
                onClick={() => { setDemoMode(false); navigate(ROUTES.home, { replace: true }); }}
                className="h-11 px-4 rounded-xl border-2 border-[#E5E1DC] bg-transparent text-[#333333] text-sm font-semibold hover:bg-white/40 transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
          {!isDemoMode() && (
            <p className="text-xs text-[#6B6560] mt-3">
              Подсказка: демо включается локально (в браузере) и не требует логина.
            </p>
          )}
        </div>

        {demoVideoUrl ? (
          <div className="mt-5 rounded-2xl bg-[#F0EDE8] border border-[#E5E1DC] overflow-hidden">
            <div className="px-5 pt-4 pb-3">
              <p className="text-sm font-semibold text-[#333333]">Демо от маркетологов</p>
              <p className="text-xs text-[#6B6560] mt-1">Видео с голосовым комментарием</p>
            </div>
            <video className="w-full bg-black" controls playsInline preload="metadata" src={demoVideoUrl} />
          </div>
        ) : null}

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm font-semibold text-[#333333]">Публикации демо-аккаунта</p>
            <button
              type="button"
              onClick={() => navigate(ROUTES.classic.feed)}
              className="text-sm font-semibold text-[#A39B8A] hover:underline"
            >
              Открыть ленту
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mockPublications
              .filter(p => p.type === 'photo' || p.type === 'video' || p.type === 'audio')
              .slice(0, 8)
              .map((p) => {
                const cover = p.media.find(m => m.type === 'photo')?.url || p.media.find(m => m.thumbnail)?.thumbnail || '';
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => navigate(ROUTES.classic.publication(p.id))}
                    className="rounded-2xl bg-[#F0EDE8] border border-[#E5E1DC] overflow-hidden text-left hover:border-[#A39B8A]/50 transition-colors"
                  >
                    <div className="aspect-[4/3] bg-[#E5E1DC] overflow-hidden">
                      {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-[#333333] line-clamp-1">{p.title || 'Без названия'}</p>
                      <p className="text-xs text-[#6B6560] line-clamp-2 mt-1">{p.text}</p>
                    </div>
                  </button>
                );
              })}
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => navigate(ROUTES.classic.tree)}
              className="h-11 rounded-xl bg-[#F0EDE8] border border-[#E5E1DC] text-[#333333] text-sm font-semibold hover:border-[#A39B8A]/50 transition-colors"
            >
              Дерево
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.classic.feed)}
              className="h-11 rounded-xl bg-[#F0EDE8] border border-[#E5E1DC] text-[#333333] text-sm font-semibold hover:border-[#A39B8A]/50 transition-colors"
            >
              Лента
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.classic.myMedia)}
              className="h-11 rounded-xl bg-[#F0EDE8] border border-[#E5E1DC] text-[#333333] text-sm font-semibold hover:border-[#A39B8A]/50 transition-colors"
            >
              Медиа
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.classic.settings)}
              className="h-11 rounded-xl bg-[#F0EDE8] border border-[#E5E1DC] text-[#333333] text-sm font-semibold hover:border-[#A39B8A]/50 transition-colors"
            >
              Настройки
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoMode;

