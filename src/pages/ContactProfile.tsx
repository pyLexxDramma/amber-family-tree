import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getMember } from '@/data/mock-members';
import { ArrowLeft, Send, TreePine, Users, Trash2, Newspaper, Image, User } from 'lucide-react';
import { useDemoWithPhotos } from '@/hooks/useDemoWithPhotos';

const ContactProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = getMember(id || '');
  const demoWithPhotos = useDemoWithPhotos();

  if (!member) return <div className="p-6 text-center text-muted-foreground font-light">Контакт не найден</div>;

  const relationLabel = member.relations[0]?.type === 'parent' ? 'Родитель' : member.relations[0]?.type === 'child' ? 'Ребёнок' : member.relations[0]?.type === 'spouse' ? 'Супруг(а)' : member.relations[0]?.type === 'sibling' ? 'Брат/сестра' : 'Член семьи';

  const actions = [
    { label: 'Пригласить', icon: Send },
    { label: 'Добавить на дерево', icon: TreePine },
    { label: 'Добавить в группу', icon: Users },
  ];

  const feedUrl = (params: string) => `${ROUTES.classic.feed}?${params}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative w-full bg-muted/50 flex items-center justify-center overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {demoWithPhotos && (
          <img src={`https://picsum.photos/seed/member${member.id}/800/600`} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
        )}
        <div className={`flex items-center justify-center ${demoWithPhotos ? 'hidden' : ''}`}>
          <User className={`h-24 w-24 ${member.isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
        </div>
        <div className="absolute inset-0 editorial-overlay-top" />
        <div className="absolute inset-0 editorial-overlay" />

        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors z-10">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="editorial-caption text-white/40 mb-1">{relationLabel}</p>
          <h1 className="editorial-title text-white text-3xl">{member.nickname || member.firstName + ' ' + member.lastName}</h1>
          {member.nickname && (
            <p className="text-white/50 text-sm font-light mt-1">{member.firstName} {member.lastName}</p>
          )}
          {!member.nickname && (
            <p className="text-white/60 text-xs font-light mt-2 bg-white/10 inline-block px-2 py-1 rounded">Заполните ник — так контакт отобразится на дереве</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs tracking-wider uppercase font-light ${member.isActive ? 'text-white/50' : 'text-white/30'}`}>
              {member.isActive ? 'Активный' : 'Неактивный'}
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
          <p className="editorial-body text-foreground/70 text-sm mb-6">{member.about}</p>
        )}

        {/* По ТЗ: Публикации контакта, Медиа */}
        <div className="space-y-0 mb-6">
          <button onClick={() => navigate(feedUrl(`author=${member.id}`))} className="w-full flex items-center gap-4 py-4 border-b border-border/30 hover:opacity-70 transition-opacity text-left">
            <Newspaper className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
            <span className="text-sm font-light tracking-wide">Публикации контакта</span>
          </button>
          <button onClick={() => navigate(feedUrl(`participant=${member.id}`))} className="w-full flex items-center gap-4 py-4 border-b border-border/30 hover:opacity-70 transition-opacity text-left">
            <Newspaper className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
            <span className="text-sm font-light tracking-wide">Публикации, где контакт участник</span>
          </button>
          <button onClick={() => navigate(feedUrl(`view=media&author=${member.id}`))} className="w-full flex items-center gap-4 py-4 border-b border-border/30 hover:opacity-70 transition-opacity text-left">
            <Image className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
            <span className="text-sm font-light tracking-wide">Медиа</span>
          </button>
        </div>

        <p className="editorial-caption text-muted-foreground mb-2">Действия</p>
        <div className="space-y-0 mb-6">
          {actions.map(a => (
            <button key={a.label} className="w-full flex items-center gap-4 py-4 border-b border-border/30 last:border-b-0 hover:opacity-70 transition-opacity text-left">
              <a.icon className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
              <span className="text-sm font-light tracking-wide">{a.label}</span>
            </button>
          ))}
          <button className="w-full flex items-center gap-4 py-4 hover:opacity-70 transition-opacity text-left">
            <Trash2 className="h-4 w-4 text-destructive/50" strokeWidth={1.5} />
            <span className="text-sm font-light tracking-wide text-destructive/70">Удалить контакт</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactProfile;
