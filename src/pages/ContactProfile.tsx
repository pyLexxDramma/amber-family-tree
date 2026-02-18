import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMember } from '@/data/mock-members';
import { AvatarPlaceholder } from '@/components/AvatarPlaceholder';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, TreePine, Users, Trash2 } from 'lucide-react';

const ContactProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = getMember(id || '');

  if (!member) return <div className="p-6 text-center text-muted-foreground">Member not found</div>;

  const relationLabel = member.relations[0]?.type || 'Family member';

  return (
    <div className="min-h-screen bg-background px-4 pt-4 pb-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted-foreground text-sm">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex flex-col items-center mb-6 rounded-2xl bg-card p-5">
        <AvatarPlaceholder name={`${member.firstName} ${member.lastName}`} size="xl" />
        <h2 className="text-lg font-bold mt-3">{member.firstName} {member.lastName}</h2>
        {member.nickname && <p className="text-sm text-muted-foreground">"{member.nickname}"</p>}
        <p className="text-sm text-muted-foreground capitalize mt-1">{relationLabel}</p>
        <span className={`mt-2 text-xs rounded-full px-2 py-0.5 ${member.isActive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
          {member.isActive ? 'Active' : 'Inactive'}
        </span>
        {member.about && <p className="text-xs text-muted-foreground mt-3 text-center">{member.about}</p>}
      </div>

      <div className="space-y-2">
        <Button variant="outline" className="w-full rounded-xl justify-start"><Send className="h-4 w-4 mr-2" /> Invite to Angelo</Button>
        <Button variant="outline" className="w-full rounded-xl justify-start"><TreePine className="h-4 w-4 mr-2" /> Add to Tree</Button>
        <Button variant="outline" className="w-full rounded-xl justify-start"><Users className="h-4 w-4 mr-2" /> Add to Group</Button>
        <Button variant="outline" className="w-full rounded-xl justify-start text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete Contact</Button>
      </div>
    </div>
  );
};

export default ContactProfile;
