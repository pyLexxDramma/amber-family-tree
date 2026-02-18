import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { AvatarPlaceholder } from '@/components/AvatarPlaceholder';
import { mockMembers, currentUserId, getMember } from '@/data/mock-members';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, UserPlus, Contact, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FamilyTree: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = getMember(currentUserId)!;
  const generations: Record<number, typeof mockMembers> = {};
  mockMembers.forEach(m => { (generations[m.generation] ||= []).push(m); });

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Family Tree</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="rounded-full">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Contact className="h-4 w-4 mr-2" /> Add from contacts</DropdownMenuItem>
              <DropdownMenuItem><UserPlus className="h-4 w-4 mr-2" /> Create contact</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/invite')}><Send className="h-4 w-4 mr-2" /> Send invite</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Simplified visual tree by generation */}
        {[1, 2, 3].map(gen => (
          <div key={gen} className="mb-6">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
              {gen === 1 ? 'Grandparents' : gen === 2 ? 'Parents' : 'Our Generation'}
            </p>
            <div className="flex flex-wrap gap-3">
              {(generations[gen] || []).map(m => (
                <button key={m.id} onClick={() => navigate(`/profile/${m.id}`)} className={`flex flex-col items-center gap-1 rounded-2xl p-3 transition-colors min-w-[72px] ${m.id === currentUserId ? 'bg-primary/10 ring-2 ring-primary' : 'bg-card hover:bg-card/80'}`}>
                  <AvatarPlaceholder name={`${m.firstName} ${m.lastName}`} size="md" src={m.avatar} />
                  <span className="text-xs font-medium text-foreground truncate max-w-[64px]">{m.nickname || m.firstName}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {/* Connection lines hint */}
        <p className="text-xs text-muted-foreground text-center mt-4 italic">Tap a member to see their profile and connections</p>
      </div>
    </AppLayout>
  );
};

export default FamilyTree;
