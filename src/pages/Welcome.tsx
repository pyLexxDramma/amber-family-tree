import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { setDemoMode } from '@/lib/demoMode';
import { BrandLogoCircle } from '@/components/BrandLogoCircle';
import { api } from '@/integrations/api';

const REFERENCE_EMAIL = 'alina.fadeeva@angelo-demo.ru';
const REFERENCE_CODE = '000000';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'splash' | 'intro' | 'landing'>('splash');
  const [splashDone, setSplashDone] = useState(false);
  const [introStep, setIntroStep] = useState(0);

  useEffect(() => {
    const shown = sessionStorage.getItem('angelo-splash-shown');
    if (shown === '1') {
      const introShown = sessionStorage.getItem('angelo-intro-shown');
      setPhase(introShown === '1' ? 'landing' : 'intro');
      setSplashDone(true);
      return;
    }
    const t = setTimeout(() => {
      setSplashDone(true);
      sessionStorage.setItem('angelo-splash-shown', '1');
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (splashDone && phase === 'splash') {
      const t = setTimeout(() => {
        const introShown = sessionStorage.getItem('angelo-intro-shown');
        setPhase(introShown === '1' ? 'landing' : 'intro');
      }, 400);
      return () => clearTimeout(t);
    }
  }, [splashDone, phase]);

  const handleTestProfileLogin = async () => {
    setDemoMode(false);
    try {
      const res = await api.auth.verify(REFERENCE_EMAIL, REFERENCE_CODE);
      localStorage.setItem('token', res.access_token);
      navigate(ROUTES.classic.feed);
    } catch {
      navigate('/login', { state: { prefill: REFERENCE_EMAIL } });
    }
  };

  const handleSkipIntro = () => {
    sessionStorage.setItem('angelo-intro-shown', '1');
    setPhase('landing');
  };

  const handleNextIntro = () => {
    if (introStep < 2) {
      setIntroStep(s => s + 1);
    } else {
      handleSkipIntro();
    }
  };

  if (phase === 'splash') {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#F8F5F1] flex items-center justify-center overflow-hidden">
        <div
          className={`transition-all duration-1000 ease-out flex items-center justify-center ${
            splashDone ? 'opacity-0 scale-[2.5]' : 'opacity-100 scale-75'
          }`}
          style={{ width: 'min(85vw, 360px)' }}
        >
          <img
            src={`${import.meta.env.BASE_URL}favicon.png`}
            alt=""
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    );
  }

  if (phase === 'intro') {
    const slides = [
      {
        title: 'Ваше семейное дерево и хроника',
        text: 'Angelo помогает собрать родственников в одной живой схеме: кто кому кем приходится, какие связи и поколения.',
        image: `${import.meta.env.BASE_URL}prototype/tree-hero.png`,
      },
      {
        title: 'Истории в ленте и таймлайне',
        text: 'Фотографии, видео и воспоминания складываются в единую ленту и таймлайн по годам — от первых шагов до важных событий.',
        image: `${import.meta.env.BASE_URL}prototype/feed.jpeg`,
      },
      {
        title: 'Общий семейный альбом',
        text: 'Каждый член семьи добавляет свои моменты, а вы управляете доступом: кому что показывать и что сохранить только для близких.',
        image: `${import.meta.env.BASE_URL}prototype/publication.jpeg`,
      },
    ] as const;
    const slide = slides[introStep] ?? slides[0];

    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#F8F5F1] flex flex-col items-center justify-between p-6 overflow-x-hidden">
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[420px]">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="font-brand text-3xl sm:text-4xl font-bold text-[#333333]">Angelo</h1>
            <BrandLogoCircle className="h-10 w-10 border-[#E5E1DC] bg-[#F0EDE8] shrink-0" />
          </div>
          <div className="w-full max-w-[260px] h-px bg-[#E5E1DC] mb-6" />
          <div className="w-full rounded-3xl bg-[#F0EDE8] border border-[#E5E1DC] overflow-hidden mb-5">
            {slide.image ? (
              <div className="aspect-[4/3] bg-[#E5E1DC] overflow-hidden">
                <img src={slide.image} alt="" className="w-full h-full object-cover" />
              </div>
            ) : null}
            <div className="p-4 space-y-2">
              <p className="font-serif text-lg font-semibold text-[#333333]">{slide.title}</p>
              <p className="text-sm text-[#6B6560] leading-relaxed">{slide.text}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 mb-5">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === introStep ? 'w-6 bg-[#A39B8A]' : 'w-2.5 bg-[#D8D2CA]'
                }`}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2 w-full">
            <button
              type="button"
              onClick={handleNextIntro}
              className="w-full py-3.5 rounded-2xl bg-[#A39B8A] text-white font-semibold text-base hover:opacity-90 transition-opacity"
            >
              {introStep < 2 ? 'Далее' : 'Перейти к входу'}
            </button>
            <button
              type="button"
              onClick={handleSkipIntro}
              className="w-full py-2 text-sm text-[#6B6560] font-medium hover:underline"
            >
              Пропустить рассказ, перейти к входу
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F8F5F1] flex flex-col items-center justify-between p-6 overflow-x-hidden">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[360px]">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="font-brand text-4xl sm:text-5xl font-bold text-[#333333]">Angelo</h1>
          <BrandLogoCircle className="h-12 w-12 border-[#E5E1DC] bg-[#F0EDE8] shrink-0" />
        </div>
        <div className="w-full max-w-[200px] h-px bg-[#E5E1DC] my-4" />
        <p className="font-serif text-lg text-[#6B6560] tracking-wide">твой семейный альбом</p>

        <div className="flex flex-col gap-3 w-full mt-10">
          <button
            onClick={() => { setDemoMode(false); navigate('/login'); }}
            className="w-full py-3.5 rounded-2xl bg-[#A39B8A] text-white font-semibold text-base hover:opacity-90 transition-opacity"
          >
            Войти
          </button>
          <button
            onClick={() => { setDemoMode(false); navigate('/register'); }}
            className="w-full py-3 rounded-2xl bg-[#F0EDE8] border-2 border-[#E5E1DC] text-[#333333] font-semibold text-base hover:border-[#A39B8A]/50 transition-colors"
          >
            Создать аккаунт
          </button>
          <button
            type="button"
            onClick={handleTestProfileLogin}
            className="w-full py-2 text-sm text-[#A39B8A] font-medium hover:underline"
          >
            Войти в тестовый профиль
          </button>
        </div>
      </div>

      <footer className="py-4">
        <Link
          to={ROUTES.classic.terms}
          className="text-xs text-[#6B6560] hover:text-[#A39B8A] transition-colors"
        >
          Условия
        </Link>
        <span className="text-[#E5E1DC] mx-2">/</span>
        <Link
          to={ROUTES.classic.privacy}
          className="text-xs text-[#6B6560] hover:text-[#A39B8A] transition-colors"
        >
          Политика
        </Link>
      </footer>
    </div>
  );
};

export default Welcome;
