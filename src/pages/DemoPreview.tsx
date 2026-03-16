import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

type Slide = {
  title: string;
  body: string;
  cta: string;
  icon: React.ReactNode;
};

const DemoPreview: React.FC = () => {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);

  const slides: Slide[] = useMemo(() => ([
    {
      title: 'Сохраняйте семейные моменты',
      body: 'Безопасное облачное хранение для фотографий и видео всей семьи. Делитесь воспоминаниями только с близкими.',
      cta: 'Далее',
      icon: (
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#A39B8A]/10 text-[#A39B8A]">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 7a2 2 0 1 1 4 0v3H9V7a0 0 0 0 0-2 0v3H5V7a2 2 0 1 1 4 0Zm6 0a2 2 0 1 1 4 0v3h-2V7a0 0 0 0 0-2 0v3h-2V7Z" opacity=".0" />
            <path d="M8.5 11a2.5 2.5 0 1 1 5 0v1h3a3 3 0 0 1 0 6H7.5a3 3 0 0 1 0-6h1v-1Zm2.5-1a1.5 1.5 0 0 0-1.5 1.5V12h3v-1.5A1.5 1.5 0 0 0 11 10Z" opacity=".0" />
            <path d="M8 11a3 3 0 0 1 6 0v1h2a3 3 0 1 1 0 6H8a3 3 0 1 1 0-6h0v-1Z" opacity=".0" />
            <path d="M7.5 10.5c.66 0 1.27.2 1.78.55A3.5 3.5 0 0 1 12.5 9a3.5 3.5 0 0 1 3.22 2.05c.5-.35 1.12-.55 1.78-.55a3.5 3.5 0 1 1 0 7H7.5a3.5 3.5 0 1 1 0-7Z" />
          </svg>
        </span>
      ),
    },
    {
      title: 'Объединяйте поколения',
      body: 'Создавайте генеалогическое древо, храните истории и традиции рода. Связь с корнями для ваших детей.',
      cta: 'Далее',
      icon: (
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#A39B8A]/10 text-[#A39B8A]">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 5h6v6H7V5Zm8 8h2v6h-6v-2h4v-4Zm-8 4h4v2H5v-6h2v4Zm8-12h4v6h-4V5Z" />
          </svg>
        </span>
      ),
    },
    {
      title: 'Умный AI‑помощник',
      body: 'Angelo AI автоматически распознаёт лица, места и события. Находите нужные фото голосом или текстом.',
      cta: 'Начать',
      icon: (
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#A39B8A]/10 text-[#A39B8A]">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l1.1 3.4L16.7 6.5l-3 2.1 1.1 3.4-2.8-2.1L9.2 12l1.1-3.4-3-2.1 3.6-1.1L12 2Zm7 7 0.7 2.1L22 12l-2.3.9L19 15l-1.4-1.6L15.5 14l1.1-1.9L15.5 10l2.1.6L19 9Zm-14 0 0.7 2.1L8 12l-2.3.9L5 15l-1.4-1.6L1.5 14l1.1-1.9L1.5 10l2.1.6L5 9Z" />
          </svg>
        </span>
      ),
    },
  ]), []);

  const goNext = () => {
    if (idx >= slides.length - 1) {
      navigate(ROUTES.demoLogin);
      return;
    }
    setIdx((v) => Math.min(slides.length - 1, v + 1));
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F8F5F1] flex flex-col overflow-x-hidden">
      <div className="px-4 pt-6 flex items-center justify-end">
        <button type="button" onClick={() => navigate(ROUTES.demoLogin)} className="text-sm text-[#6B6560] font-medium">
          Пропустить
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {slides[idx].icon}
        <h1 className="mt-8 text-xl font-semibold text-[#333333]">{slides[idx].title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#6B6560] max-w-[320px]">{slides[idx].body}</p>
      </div>

      <div className="px-6 pb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          {slides.map((_, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${i === idx ? 'bg-[#A39B8A]' : 'bg-[#D8D2CA]'}`} />
          ))}
        </div>
        <button
          type="button"
          onClick={goNext}
          className="w-full h-12 rounded-2xl bg-[#A39B8A] text-white text-base font-semibold hover:opacity-90 active:scale-[0.99] transition-all"
        >
          {slides[idx].cta}
        </button>
      </div>
    </div>
  );
};

export default DemoPreview;

