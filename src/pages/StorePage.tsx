import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StorePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)] flex flex-col">
        <TopBar title="Магазин" onBack={() => navigate(-1)} light />
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <AlertTriangle className="h-16 w-16 text-[var(--proto-text-muted)] mb-4" strokeWidth={1.5} />
          <p className="text-base font-medium text-[var(--proto-text-muted)] text-center">
            Раздел в процессе разработки
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default StorePage;
