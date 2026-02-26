import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import loginPageBg from '../../docs/new_ui/login_page1.png';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-welcome relative min-h-screen overflow-hidden">
      <img
        src={loginPageBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />

      <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6 sm:gap-8">
          <div
            className="flex flex-col items-center px-5 sm:px-8 py-4 sm:py-6 relative"
            style={{
              animation: 'float-in 0.8s ease-out both, sign-glow 3s 1s ease-in-out infinite',
              border: '3px solid #c8a46e',
              borderRadius: '18px',
              background: 'radial-gradient(ellipse at center, rgba(60,35,10,0.55) 0%, rgba(40,22,5,0.7) 100%)',
              boxShadow:
                '0 0 15px 3px rgba(200,164,110,0.3), inset 0 0 20px 2px rgba(200,164,110,0.1), 0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div
              className="absolute inset-[3px] rounded-[14px] pointer-events-none"
              style={{ border: '1px solid rgba(200,164,110,0.3)' }}
            />
            <p
              className="font-serif italic text-5xl sm:text-6xl md:text-7xl font-bold"
              style={{
                color: '#f0d48a',
                textShadow: '0 0 10px rgba(240,212,138,0.6), 0 0 30px rgba(200,164,110,0.4), 0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              Angelo
            </p>
            <h1
              className="font-serif italic text-2xl sm:text-3xl md:text-4xl font-bold text-center leading-tight mt-1"
              style={{
                color: '#ffe4a0',
                textShadow: '0 0 12px rgba(255,228,160,0.7), 0 0 40px rgba(200,164,110,0.5), 0 3px 6px rgba(0,0,0,0.6)',
              }}
            >
              My Family Album
            </h1>
          </div>

          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-[260px] sm:max-w-[320px]">
            <button
              onClick={() => navigate('/login')}
              className="welcome-btn touch-target w-full px-8 sm:px-10 py-2.5 sm:py-3 rounded-[50px] font-serif text-xl sm:text-2xl italic text-white tracking-wide border-t border-white/30"
              style={{
                color: 'hsl(38,60%,50%)',
                backgroundImage: 'linear-gradient(to bottom, hsl(28,55%,48%), hsl(28,55%,32%))',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.25), 0 6px 0 hsl(28,55%,24%), 0 8px 16px rgba(0,0,0,0.3)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                animation: 'float-in 0.6s 0.5s ease-out both, glow-amber 4s 1.5s ease-in-out infinite',
              }}
            >
              <span className="text-white">Войти</span>
            </button>

            <button
              onClick={() => navigate('/register')}
              className="welcome-btn touch-target w-full px-8 sm:px-10 py-2 sm:py-2.5 rounded-[50px] font-serif text-lg sm:text-xl italic text-white tracking-wide border-t border-white/25"
              style={{
                color: 'hsl(350,50%,55%)',
                backgroundImage: 'linear-gradient(to bottom, hsl(345,45%,58%), hsl(345,45%,40%))',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 5px 0 hsl(345,45%,32%), 0 7px 14px rgba(0,0,0,0.25)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                animation: 'float-in 0.6s 0.65s ease-out both, glow-rose 4.5s 2s ease-in-out infinite',
              }}
            >
              <span className="text-white">Создать аккаунт</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate(`${ROUTES.classic.feed}?demo=full`)}
            className="welcome-btn touch-target w-full max-w-[260px] sm:max-w-[320px] px-8 sm:px-10 py-2 sm:py-2.5 rounded-[50px] font-serif text-lg sm:text-xl italic text-white tracking-wide border-t border-white/25 mt-10 sm:mt-14"
            style={{
              color: 'hsl(170,40%,45%)',
              backgroundImage: 'linear-gradient(to bottom, hsl(168,40%,48%), hsl(168,40%,30%))',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 5px 0 hsl(168,40%,22%), 0 7px 14px rgba(0,0,0,0.25)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              animation: 'float-in 0.6s 0.8s ease-out both, glow-teal 5s 2.5s ease-in-out infinite',
            }}
          >
            <span className="text-white">Демо</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
