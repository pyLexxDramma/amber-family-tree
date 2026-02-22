import React from 'react';
import { mockMembers, currentUserId } from '@/data/mock-members';
import { getDemoMemberPhotoUrl } from '@/lib/demo-photos';
import { useDemoWithPhotos } from '@/hooks/useDemoWithPhotos';
import { User } from 'lucide-react';
import type { FamilyMember } from '@/types';

const generationLabels: Record<number, string> = {
  1: 'Дедушки и бабушки',
  2: 'Родители',
  3: 'Наше поколение',
};

interface MiniTreeProps {
  onSelectPerson: (memberId: string) => void;
}

export const MiniTree: React.FC<MiniTreeProps> = ({ onSelectPerson }) => {
  const demoWithPhotos = useDemoWithPhotos();
  const generations: Record<number, FamilyMember[]> = {};
  mockMembers.forEach((m) => {
    (generations[m.generation] ||= []).push(m);
  });

  return (
    <div className="animate-in fade-in duration-300">
      <p className="editorial-caption text-muted-foreground/70 mb-4 text-base">Семейное дерево</p>
      <div className="space-y-8">
        {[1, 2, 3].map((gen) => (
          <div key={gen}>
            <p className="text-xs font-light text-muted-foreground/60 uppercase tracking-wider mb-3">
              {generationLabels[gen]}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(generations[gen] || []).map((m) => {
                const isCurrent = m.id === currentUserId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectPerson(m.id)}
                    className="relative overflow-hidden rounded-xl aspect-square border-2 border-border/40 hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 bg-muted shadow-sm"
                  >
                    {demoWithPhotos ? (
                      <img
                        src={getDemoMemberPhotoUrl(m.id)}
                        alt=""
                        className="h-full w-full object-cover"
                        style={{ filter: m.isActive ? 'sepia(0.06)' : 'grayscale(0.5)' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 flex items-center justify-center ${demoWithPhotos ? 'hidden' : ''}`}>
                      <User className={`h-12 w-12 ${m.isActive ? 'text-primary/70' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <span className="absolute bottom-2 left-2 right-2 text-sm text-white font-medium truncate">
                      {m.nickname || m.firstName}
                    </span>
                    {isCurrent && (
                      <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-white shadow" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground/50 mt-6 italic">
        Нажмите на человека — скажите «расскажи про него»
      </p>
    </div>
  );
}
