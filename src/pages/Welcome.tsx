import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background photo */}
      <div className="absolute inset-0">
        <img
          src="https://picsum.photos/seed/angelowelcome/800/1200"
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: 'sepia(0.2) brightness(0.55) saturate(1.05)' }}
        />
        <div className="absolute inset-0 gradient-hero" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-8">
        <div className="flex flex-col items-center gap-3 mb-16">
          <h1 className="editorial-title text-5xl text-white tracking-tight drop-shadow-lg">Angelo</h1>
          <p className="text-amber-100/90 text-base italic font-serif">альбом вашей семьи</p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-medium tracking-widest uppercase shadow-lg shadow-primary/40 hover:opacity-95 hover:shadow-xl transition-all duration-300"
          >
            Смотреть демо
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full h-12 rounded-xl border-2 border-white/30 text-white/80 text-sm font-light tracking-widest uppercase hover:border-white/50 hover:bg-white/10 transition-all duration-300"
          >
            Войти
          </button>
          <button
            onClick={() => navigate('/register')}
            className="w-full h-12 rounded-xl border-2 border-white/30 text-white/80 text-sm font-light tracking-widest uppercase hover:border-white/50 hover:bg-white/10 transition-all duration-300"
          >
            Создать аккаунт
          </button>
        </div>

        <p className="mt-6 text-xs text-white/40 text-center max-w-xs font-light">
          Режим демо — регистрация отключена. Скажите «демо» или «главная» голосом.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-3 text-xs text-amber-200/90 hover:text-white transition-colors underline underline-offset-2"
        >
          Голосовой режим (демо)
        </button>
      </div>

      <div className="relative z-10 mt-auto pb-8 pt-12">
        <button className="text-xs text-white/25 tracking-wider uppercase hover:text-white/50 transition-colors">
          Условия и конфиденциальность
        </button>
      </div>
    </div>
  );
};

export default Welcome;
