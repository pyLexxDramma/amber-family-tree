import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { setDemoMode } from '@/lib/demoMode';
import { BrandLogoCircle } from '@/components/BrandLogoCircle';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F8F5F1] flex flex-col items-center justify-center p-4 overflow-x-hidden relative">
      <div className="absolute top-4 right-4">
        <BrandLogoCircle className="h-11 w-11 border-[#E5E1DC] bg-[#F0EDE8]" />
      </div>
      <div className="w-full max-w-[320px] flex flex-col items-center gap-8">
        <div className="rounded-2xl bg-[#F0EDE8] border border-[#E5E1DC] px-8 py-6 text-center shadow-sm">
          <p className="font-brand text-4xl sm:text-5xl font-bold text-[#333333]">Angelo</p>
          <p className="font-serif text-xl sm:text-2xl text-[#6B6560] mt-1">My Family Album</p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => { setDemoMode(false); navigate('/login'); }}
            className="w-full py-3.5 rounded-2xl bg-[#A39B8A] text-white font-semibold text-base hover:opacity-90 transition-opacity border border-[#A39B8A]"
          >
            Войти
          </button>
          <button
            onClick={() => { setDemoMode(false); navigate('/register'); }}
            className="w-full py-3 rounded-2xl bg-[#F0EDE8] border-2 border-[#E5E1DC] text-[#333333] font-semibold text-base hover:border-[#A39B8A]/50 transition-colors"
          >
            Создать аккаунт
          </button>
        </div>

        <button
          type="button"
          onClick={() => { setDemoMode(false); navigate(ROUTES.demoPreview); }}
          className="w-full max-w-[180px] py-2 rounded-xl border border-[#A39B8A]/50 text-[#A39B8A] font-semibold text-sm hover:bg-[#A39B8A]/10 transition-colors"
        >
          Демо
        </button>
      </div>
    </div>
  );
};

export default Welcome;
