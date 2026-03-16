import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { setDemoMode } from '@/lib/demoMode';
import { BrandLogoCircle } from '@/components/BrandLogoCircle';

const DemoLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (loading) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 650));
    setDemoMode(true);
    navigate(ROUTES.classic.feed, { replace: true });
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F8F5F1] flex flex-col items-center justify-center px-4 overflow-x-hidden relative">
      <div className="absolute top-4 right-4">
        <BrandLogoCircle className="h-11 w-11 border-[#E5E1DC] bg-[#F0EDE8]" />
      </div>
      <div className="w-full max-w-[360px]">
        <p className="text-center tracking-[0.35em] text-[#A39B8A] font-semibold text-2xl mb-2">ANGELO</p>
        <p className="text-center text-sm text-[#6B6560] mb-8">Войдите в семейный альбом</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#6B6560] mb-1">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-[#E5E1DC] bg-white/60 px-3 h-12">
              <span className="text-[#6B6560]">✉</span>
              <input
                readOnly
                value="alexey@petrov.ru"
                className="w-full bg-transparent outline-none text-sm text-[#333333]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#6B6560] mb-1">Пароль</label>
            <div className="flex items-center gap-2 rounded-xl border border-[#E5E1DC] bg-white/60 px-3 h-12">
              <span className="text-[#6B6560]">🔒</span>
              <input
                readOnly
                value="••••••••"
                className="w-full bg-transparent outline-none text-sm text-[#333333]"
              />
              <span className="text-[#6B6560]">👁</span>
            </div>
          </div>

          <button
            type="button"
            onClick={login}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-[#A39B8A] text-white text-base font-semibold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60"
          >
            {loading ? 'Входим…' : 'Войти'}
          </button>

          <button type="button" className="w-full text-center text-sm text-[#A39B8A] font-semibold hover:underline">
            Нет аккаунта? Зарегистрируйтесь
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.demoPreview)}
          className="mt-8 w-full text-center text-xs text-[#6B6560] hover:underline"
        >
          Назад к просмотру
        </button>
      </div>
    </div>
  );
};

export default DemoLogin;

