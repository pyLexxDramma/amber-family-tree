import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { setDemoMode } from '@/lib/demoMode';
import { BrandLogoCircle } from '@/components/BrandLogoCircle';
import { api } from '@/integrations/api';

import familyIcon from '@/assets/intro-icons/family.png';
import treeIcon from '@/assets/intro-icons/tree.png';
import sparklesIcon from '@/assets/intro-icons/sparkles.png';

const INTRO_SLIDES = [
  {
    title: 'Сохраняйте семейные моменты',
    text: 'Безопасное облачное хранение для фотографий и видео всей семьи. Делитесь воспоминаниями только с близкими.',
    iconSrc: familyIcon,
  },
  {
    title: 'Объединяйте поколения',
    text: 'Создавайте генеалогическое древо, сохраняйте истории и традиции рода. Связь с корнями для ваших детей.',
    iconSrc: treeIcon,
  },
  {
    title: 'Умный AI-помощник',
    text: 'Angelo AI автоматически распознаёт лица, места и события. Находите нужные фото голосом или текстом.',
    iconSrc: sparklesIcon,
  },
] as const;

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
    const slide = INTRO_SLIDES[introStep] ?? INTRO_SLIDES[0];
    return (
      <div className="min-h-screen min-h-[100svh] bg-[#F5EDE0] flex flex-col">
        <div className="pt-[calc(env(safe-area-inset-top)+28px)] px-6 flex justify-end">
          <button
            type="button"
            onClick={handleSkipIntro}
            className="text-sm font-medium text-[#6B6560] hover:text-[#333333] transition-colors"
          >
            Пропустить
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center text-center px-8">
          <div className="mt-[clamp(90px,18vh,190px)]">
            <img
              src={slide.iconSrc}
              alt=""
              className="w-[clamp(150px,38vw,200px)] h-[clamp(150px,38vw,200px)]"
              style={{ imageRendering: 'auto' }}
            />
          </div>
          <h2 className="mt-10 text-[clamp(26px,7vw,34px)] font-bold text-[#333333] leading-tight">
            {slide.title}
          </h2>
          <p className="mt-5 text-[clamp(16px,4.6vw,20px)] text-[#6B6560] leading-relaxed max-w-[360px]">
            {slide.text}
          </p>
        </div>

        <div className="px-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
          <div className="flex items-center justify-center gap-2 mb-5">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === introStep ? 'bg-[#D49A6C]' : 'bg-[#CFC6BB]'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleNextIntro}
            className="w-full h-14 rounded-2xl bg-[#D49A6C] text-white text-base font-semibold hover:opacity-90 active:scale-[0.99] transition-all"
          >
            {introStep < 2 ? 'Далее' : 'Начать'}
          </button>
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
