import React from 'react';
import { mockMembers, currentUserId } from '@/data/mock-members';
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
  const generations: Record<number, FamilyMember[]> = {};
  mockMembers.forEach((m) => {
    (generations[m.generation] ||= []).push(m);
  });

  return (
    <div className="animate-in fade-in duration-300">
      <p className="editorial-caption text-muted-foreground/70 mb-3">Семейное дерево</p>
      <div className="space-y-6">
        {[1, 2, 3].map((gen) => (
          <div key={gen}>
            <p className="text-[11px] font-light text-muted-foreground/60 uppercase tracking-wider mb-2">
              {generationLabels[gen]}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {(generations[gen] || []).map((m) => {
                const isCurrent = m.id === currentUserId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectPerson(m.id)}
                    className="relative overflow-hidden rounded-sm aspect-square border border-border/50 hover:border-foreground/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <img
                      src={`https://picsum.photos/seed/member${m.id}/200/200`}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ filter: m.isActive ? 'sepia(0.06)' : 'grayscale(0.5)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white font-light truncate">
                      {m.nickname || m.firstName}
                    </span>
                    {isCurrent && (
                      <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground/50 mt-4 italic">
        Нажмите на человека — скажите «расскажи про него»
      </p>
    </div>
  );
}
