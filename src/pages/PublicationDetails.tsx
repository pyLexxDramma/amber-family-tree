import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockPublications } from '@/data/mock-publications';
import { getMember } from '@/data/mock-members';
import { AvatarPlaceholder } from '@/components/AvatarPlaceholder';
import { TopicTag } from '@/components/TopicTag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreVertical, Heart, MessageCircle, UserPlus, MapPin, Calendar, Play, FileText, Mic, Edit, Trash2, EyeOff } from 'lucide-react';

const PublicationDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pub = mockPublications.find(p => p.id === id);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);

  if (!pub) return <div className="p-6 text-center text-muted-foreground">Publication not found</div>;

  const author = getMember(pub.authorId);

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur px-4 py-3 border-b border-border">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
        <DropdownMenu>
          <DropdownMenuTrigger><MoreVertical className="h-5 w-5" /></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
            <DropdownMenuItem><EyeOff className="h-4 w-4 mr-2" /> Unpublish</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-4 pt-4">
        {/* Author block */}
        <div className="flex items-center gap-3 mb-4">
          <AvatarPlaceholder name={author ? `${author.firstName} ${author.lastName}` : ''} size="md" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{author?.firstName} {author?.lastName}</p>
            <p className="text-xs text-muted-foreground">{new Date(pub.publishDate).toLocaleDateString()}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs"><UserPlus className="h-3 w-3 mr-1" /> Co-author</Button>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{pub.eventDate}</span>
          {pub.place && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{pub.place}</span>}
        </div>

        {/* Title & text */}
        <h1 className="text-xl font-bold mb-2">{pub.title}</h1>
        <p className="text-sm text-foreground/80 leading-relaxed mb-4">{pub.text}</p>

        {/* Media */}
        {pub.media.length > 0 && (
          <div className="mb-4">
            {/* Photos */}
            {pub.media.filter(m => m.type === 'photo').length > 0 && (
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {pub.media.filter(m => m.type === 'photo').map(m => (
                  <div key={m.id} className="aspect-square rounded-xl overflow-hidden bg-muted">
                    <img src={m.thumbnail || m.url} alt={m.name} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            {/* Videos */}
            {pub.media.filter(m => m.type === 'video').map(m => (
              <div key={m.id} className="mb-2 flex items-center gap-3 rounded-xl bg-card p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Play className="h-5 w-5 text-primary" /></div>
                <div className="flex-1"><p className="text-sm font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.duration ? `${Math.floor(m.duration/60)}:${String(m.duration%60).padStart(2,'0')}` : ''}</p></div>
              </div>
            ))}
            {/* Audio */}
            {pub.media.filter(m => m.type === 'audio').map(m => (
              <div key={m.id} className="mb-2 flex items-center gap-3 rounded-xl bg-card p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/50"><Mic className="h-5 w-5 text-accent-foreground" /></div>
                <div className="flex-1"><p className="text-sm font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.duration ? `${Math.floor(m.duration/60)}:${String(m.duration%60).padStart(2,'0')}` : ''}</p></div>
              </div>
            ))}
          </div>
        )}

        {/* Participants */}
        {pub.participantIds.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Participants</p>
            <div className="flex flex-wrap gap-1.5">
              {pub.participantIds.map(pid => { const m = getMember(pid); return m ? <span key={pid} className="text-xs bg-secondary rounded-full px-2 py-0.5">{m.firstName}</span> : null; })}
            </div>
          </div>
        )}

        <TopicTag tag={pub.topicTag} />

        {/* Likes & comments */}
        <div className="flex items-center gap-4 mt-4 mb-4 border-t border-b border-border py-3">
          <button onClick={() => setLiked(!liked)} className={`flex items-center gap-1 text-sm ${liked ? 'text-primary' : 'text-muted-foreground'}`}>
            <Heart className={`h-4 w-4 ${liked ? 'fill-primary' : ''}`} /> {pub.likes.length + (liked ? 1 : 0)}
          </button>
          <span className="flex items-center gap-1 text-sm text-muted-foreground"><MessageCircle className="h-4 w-4" /> {pub.comments.length}</span>
        </div>

        {/* Comments list */}
        <div className="space-y-3 mb-4">
          {pub.comments.map(c => {
            const ca = getMember(c.authorId);
            return (
              <div key={c.id} className="flex gap-2">
                <AvatarPlaceholder name={ca ? `${ca.firstName} ${ca.lastName}` : ''} size="sm" />
                <div>
                  <p className="text-xs font-semibold">{ca?.firstName}</p>
                  <p className="text-sm text-foreground/80">{c.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add comment */}
        <div className="flex gap-2">
          <Input placeholder="Write a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} className="flex-1 rounded-xl" />
          <Button size="sm" className="rounded-xl" disabled={!newComment.trim()}>Send</Button>
        </div>
      </div>
    </div>
  );
};

export default PublicationDetails;
