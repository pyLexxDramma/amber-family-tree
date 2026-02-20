import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background: семейные фото, частично размыто и приглушено */}
      <div className="absolute inset-0">
        <img
          src="/welcome-bg.png"
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: 'sepia(0.25) brightness(0.5) saturate(1.05) blur(2px)' }}
        />
        <div className="absolute inset-0 gradient-hero" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-8">
        <div className="flex flex-col items-center gap-2 mb-16">
          <h1 className="editorial-title text-5xl text-white tracking-tight drop-shadow-lg">Angelo</h1>
          <p className="text-white/70 text-sm font-extralight border-b border-white/20 pb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            твой семейный альбом
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={() => navigate('/login')}
            className="w-full h-12 rounded-xl border-2 border-white/30 text-white/90 text-sm font-light tracking-widest uppercase hover:border-white/50 hover:bg-white/10 transition-all duration-300"
          >
            Войти
          </button>
          <button
            onClick={() => navigate('/register')}
            className="w-full h-12 rounded-xl border-2 border-white/30 text-white/90 text-sm font-light tracking-widest uppercase hover:border-white/50 hover:bg-white/10 transition-all duration-300"
          >
            Создать аккаунт
          </button>
        </div>

        <p className="mt-8 text-xs text-white/40 text-center">
          <button type="button" onClick={() => navigate(`${ROUTES.classic.tree}?demo=full`)} className="underline underline-offset-2 hover:text-white/70 transition-colors">
            Демо
          </button>
        </p>
      </div>

      <div className="relative z-10 mt-auto pb-8 pt-12 flex gap-4 text-xs font-extralight text-white/40">
        <button type="button" className="hover:text-white/70 transition-colors">Условия</button>
        <span>/</span>
        <button type="button" className="hover:text-white/70 transition-colors">Политика</button>
      </div>
    </div>
  );
};

export default Welcome;
