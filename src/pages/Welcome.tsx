import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-2 mb-12">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
          <span className="text-4xl">🕊️</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Angelo</h1>
        <p className="text-muted-foreground text-base italic">your family album</p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button size="lg" className="w-full text-base rounded-xl h-12" onClick={() => navigate('/tree')}>
          Посмотреть без входа
        </Button>
        <Button size="lg" variant="outline" className="w-full text-base rounded-xl h-12 opacity-60" onClick={() => navigate('/login')}>
          Sign In
        </Button>
        <Button size="lg" variant="outline" className="w-full text-base rounded-xl h-12 opacity-60" onClick={() => navigate('/register')}>
          Create Account
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground text-center max-w-xs">
        Демо: регистрация и код отключены. Нажмите «Посмотреть без входа», чтобы открыть приложение.
      </p>

      <div className="mt-auto pt-12 pb-8">
        <button className="text-xs text-muted-foreground underline-offset-2 hover:underline">
          Terms &amp; Privacy
        </button>
      </div>
    </div>
  );
};

export default Welcome;
