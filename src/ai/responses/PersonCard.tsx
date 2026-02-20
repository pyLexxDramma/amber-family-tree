import React from 'react';
import { getMember } from '@/data/mock-members';
import { getDemoMemberPhotoUrl } from '@/lib/demo-photos';

interface PersonCardProps {
  memberId: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({ memberId, isSelected, onSelect }) => {
  const member = getMember(memberId);
  if (!member) return null;

  return (
    <div
      className={`animate-in fade-in duration-300 rounded-xl overflow-hidden border-2 transition-all relative shadow-md ${
        isSelected
          ? 'border-primary shadow-primary/25 ring-2 ring-primary/20'
          : 'border-border/40 hover:border-primary/30'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="relative w-full text-left block"
        style={{ aspectRatio: '4/3' }}
      >
        <img
          src={getDemoMemberPhotoUrl(member.id)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: member.isActive ? 'sepia(0.1)' : 'grayscale(0.5) sepia(0.1)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 photo-card-text">
          <p className="editorial-caption text-white/50 mb-1">
            {member.relations[0]?.type === 'parent' && 'Дедушка'}
            {member.relations[0]?.type === 'spouse' && member.generation === 1 && 'Бабушка'}
            {!member.relations[0]?.type && 'Член семьи'}
          </p>
          <h3 className="editorial-title text-white text-xl">{member.firstName} {member.lastName}</h3>
          {member.nickname && (
            <p className="text-white/60 text-sm font-light italic mt-0.5">«{member.nickname}»</p>
          )}
          {member.city && (
            <p className="text-white/40 text-xs font-light mt-1">{member.city}</p>
          )}
        </div>
      </button>
      <div className={`p-4 transition-colors ${isSelected ? 'bg-primary/5' : 'bg-card/80'}`}>
        {member.about && (
          <p className="editorial-body text-sm text-foreground/80 leading-relaxed">{member.about}</p>
        )}
        {isSelected && (
          <p className="text-[11px] text-primary font-medium mt-2 italic">Скажите: «расскажи про него» или «покажи его фото»</p>
        )}
      </div>
    </div>
  );
}
