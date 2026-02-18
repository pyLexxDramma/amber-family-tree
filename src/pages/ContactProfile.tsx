import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMember } from '@/data/mock-members';
import { ArrowLeft, Send, TreePine, Users, Trash2 } from 'lucide-react';

const ContactProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = getMember(id || '');

  if (!member) return <div className="p-6 text-center text-muted-foreground font-light">Member not found</div>;

  const relationLabel = member.relations[0]?.type || 'Family member';

  const actions = [
    { label: 'Invite to Angelo', icon: Send },
    { label: 'Add to Tree', icon: TreePine },
    { label: 'Add to Group', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
        <img
          src={`https://picsum.photos/seed/contact${member.id}/600/450`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: member.isActive ? 'sepia(0.1)' : 'grayscale(0.7) sepia(0.1)' }}
        />
        <div className="absolute inset-0 editorial-overlay-top" />
        <div className="absolute inset-0 editorial-overlay" />

        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors z-10">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="editorial-caption text-white/40 mb-1">{relationLabel}</p>
          <h1 className="editorial-title text-white text-3xl">{member.firstName} {member.lastName}</h1>
          {member.nickname && (
            <p className="text-white/50 text-sm font-light italic mt-1">"{member.nickname}"</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs tracking-wider uppercase font-light ${member.isActive ? 'text-white/50' : 'text-white/30'}`}>
              {member.isActive ? 'Active' : 'Inactive'}
            </span>
            {member.city && (
              <>
                <span className="text-white/20">·</span>
                <span className="text-white/40 text-xs font-light">{member.city}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-6 pb-8">
        {member.about && (
          <p className="editorial-body text-foreground/70 text-sm mb-8">{member.about}</p>
        )}

        <p className="editorial-caption text-muted-foreground mb-4">Actions</p>
        <div className="space-y-0 mb-8">
          {actions.map(a => (
            <button
              key={a.label}
              className="w-full flex items-center gap-4 py-4 border-b border-border/30 last:border-b-0 hover:opacity-70 transition-opacity text-left"
            >
              <a.icon className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
              <span className="text-sm font-light tracking-wide">{a.label}</span>
            </button>
          ))}
          <button className="w-full flex items-center gap-4 py-4 hover:opacity-70 transition-opacity text-left">
            <Trash2 className="h-4 w-4 text-destructive/50" strokeWidth={1.5} />
            <span className="text-sm font-light tracking-wide text-destructive/70">Delete Contact</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactProfile;
