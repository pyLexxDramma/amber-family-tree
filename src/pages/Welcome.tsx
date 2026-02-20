import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/welcome-bg.png"
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: 'sepia(0.25) brightness(0.5) saturate(1.05) blur(2px)' }}
        />
        <div className="absolute inset-0 gradient-hero" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-8 w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-20 animate-fade-in-up">
          <h1 className="hero-title text-6xl sm:text-7xl text-white tracking-tight drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)]">Angelo</h1>
          <p className="text-white/90 text-lg font-medium border-b border-white/30 pb-1 tracking-wide">
            твой семейный альбом
          </p>
        </div>

        <div className="flex w-full flex-col gap-4 animate-fade-in-up">
          <button
            onClick={() => navigate('/login')}
            className="touch-target w-full min-h-[56px] rounded-2xl border-2 border-white/40 text-white text-lg font-semibold tracking-wide bg-white/10 hover:bg-white/20 hover:border-white/60 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-black/25 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-black/20"
          >
            Войти
          </button>
          <button
            onClick={() => navigate('/register')}
            className="touch-target w-full min-h-[56px] rounded-2xl border-2 border-white/40 text-white text-lg font-semibold tracking-wide bg-white/10 hover:bg-white/20 hover:border-white/60 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-black/25 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-black/20"
          >
            Создать аккаунт
          </button>
        </div>

        <p className="mt-10 text-base text-white/60 text-center">
          <button
            type="button"
            onClick={() => navigate(`${ROUTES.classic.tree}?demo=full`)}
            className="touch-target inline-block py-3 px-4 rounded-xl underline underline-offset-4 hover:text-white hover:bg-white/15 transition-all duration-200 hover:scale-105"
          >
            Демо
          </button>
        </p>
      </div>

      <div className="relative z-10 mt-auto pb-10 pt-14 flex gap-5 text-base font-medium text-white/50">
        <button type="button" className="touch-target inline-flex items-center px-3 py-2 rounded-lg hover:text-white/90 hover:bg-white/10 transition-colors">Условия</button>
        <span className="self-center" aria-hidden>/</span>
        <button type="button" className="touch-target inline-flex items-center px-3 py-2 rounded-lg hover:text-white/90 hover:bg-white/10 transition-colors">Политика</button>
      </div>
    </div>
  );
};

export default Welcome;
