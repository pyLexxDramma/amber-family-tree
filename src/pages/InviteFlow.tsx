import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Input } from '@/components/ui/input';
import { mockInvitations } from '@/data/mock-invitations';
import { getMember } from '@/data/mock-members';
import { ArrowLeft, Copy, Share2, Check, Send } from 'lucide-react';
import { usePlatform } from '@/platform/PlatformContext';

const InviteFlow: React.FC = () => {
  const navigate = useNavigate();
  const platform = usePlatform();
  const [copied, setCopied] = useState(false);
  const mockLink = 'https://angelo.app/invite/xyz789';
  const [view, setView] = useState<'invite' | 'list'>('invite');

  const handleCopy = () => {
    navigator.clipboard.writeText(mockLink);
    setCopied(true);
    platform.hapticFeedback('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => platform.shareLink(mockLink, 'Join our family on Angelo!');

  if (view === 'list') {
    return (
      <div className="min-h-screen bg-background px-6 pt-6 pb-8">
        <button onClick={() => setView('invite')} className="mb-8 flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs tracking-widest uppercase font-light">Back</span>
        </button>

        <h1 className="editorial-title text-2xl mb-8">Invitations</h1>

        <div className="space-y-0">
          {mockInvitations.map(inv => {
            const from = getMember(inv.fromId);
            return (
              <div key={inv.id} className="flex items-center gap-4 py-4 border-b border-border/30 last:border-b-0">
                <div className="flex-1">
                  <p className="text-sm font-light tracking-wide">{inv.toEmail || inv.toPhone}</p>
                  <p className="text-xs font-light text-muted-foreground/50 mt-0.5">
                    from {from?.firstName} · {new Date(inv.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="editorial-caption text-muted-foreground">{inv.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 pt-6 pb-8">
      <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-xs tracking-widest uppercase font-light">Back</span>
      </button>

      <h1 className="editorial-title text-2xl mb-2">Invite Family</h1>
      <p className="text-sm font-light text-muted-foreground mb-10">Share this link to invite someone to your family</p>

      <div className="mb-10">
        <p className="editorial-caption text-muted-foreground mb-3">Invitation link</p>
        <Input
          value={mockLink}
          readOnly
          className="rounded-none border-0 border-b border-border bg-transparent px-0 text-sm font-light focus-visible:ring-0 mb-4"
        />
        <div className="flex gap-3">
          <button onClick={handleCopy} className="flex-1 h-11 border border-foreground/20 text-sm font-light tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300 flex items-center justify-center gap-2">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={handleShare} className="flex-1 h-11 border border-foreground/20 text-sm font-light tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300 flex items-center justify-center gap-2">
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
        </div>
      </div>

      <button
        onClick={() => navigate(ROUTES.classic.family)}
        className="w-full h-12 bg-foreground text-background text-sm font-light tracking-widest uppercase hover:bg-foreground/80 transition-all duration-300 mb-4"
      >
        Done
      </button>
      <button
        onClick={() => setView('list')}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
      >
        <Send className="h-3.5 w-3.5" />
        <span className="tracking-wider">View sent invitations</span>
      </button>
    </div>
  );
};

export default InviteFlow;
