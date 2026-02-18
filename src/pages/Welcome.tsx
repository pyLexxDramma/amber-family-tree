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
          style={{ filter: 'sepia(0.3) brightness(0.5)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-8">
        <div className="flex flex-col items-center gap-3 mb-16">
          <h1 className="editorial-title text-5xl text-white tracking-tight">Angelo</h1>
          <p className="text-white/50 text-base italic font-serif">your family album</p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={() => navigate('/tree')}
            className="w-full h-12 border border-white/40 text-white text-sm font-light tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300"
          >
            View Demo
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full h-12 border border-white/20 text-white/50 text-sm font-light tracking-widest uppercase hover:border-white/40 hover:text-white/80 transition-all duration-300"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="w-full h-12 border border-white/20 text-white/50 text-sm font-light tracking-widest uppercase hover:border-white/40 hover:text-white/80 transition-all duration-300"
          >
            Create Account
          </button>
        </div>

        <p className="mt-6 text-xs text-white/30 text-center max-w-xs font-light">
          Demo mode — registration is disabled. Tap "View Demo" to explore.
        </p>
      </div>

      <div className="relative z-10 mt-auto pb-8 pt-12">
        <button className="text-xs text-white/25 tracking-wider uppercase hover:text-white/50 transition-colors">
          Terms &amp; Privacy
        </button>
      </div>
    </div>
  );
};

export default Welcome;
