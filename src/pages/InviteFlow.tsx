import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
      <div className="min-h-screen bg-background px-4 pt-4 pb-8">
        <button onClick={() => setView('invite')} className="mb-4 flex items-center gap-1 text-muted-foreground text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-xl font-bold mb-4">Invitations</h1>
        <div className="space-y-2">
          {mockInvitations.map(inv => {
            const from = getMember(inv.fromId);
            return (
              <div key={inv.id} className="flex items-center gap-3 rounded-2xl bg-card p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{inv.toEmail || inv.toPhone}</p>
                  <p className="text-xs text-muted-foreground">from {from?.firstName} · {new Date(inv.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs rounded-full px-2 py-0.5 ${inv.status === 'accepted' ? 'bg-green-100 text-green-700' : inv.status === 'sent' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {inv.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-4 pb-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted-foreground text-sm">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-xl font-bold mb-2">Invite Family</h1>
      <p className="text-muted-foreground text-sm mb-6">Share this link to invite someone to your family</p>

      <div className="rounded-2xl bg-card p-4 mb-6">
        <p className="text-xs text-muted-foreground mb-2">Invitation link</p>
        <Input value={mockLink} readOnly className="bg-muted text-sm" />
        <div className="flex gap-2 mt-3">
          <Button className="flex-1 rounded-xl" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="outline" className="flex-1 rounded-xl" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
        </div>
      </div>

      <Button variant="outline" className="w-full rounded-xl mb-3" onClick={() => navigate('/family')}>Done</Button>
      <Button variant="ghost" className="w-full text-sm" onClick={() => setView('list')}>
        <Send className="h-3.5 w-3.5 mr-1" /> View sent invitations
      </Button>
    </div>
  );
};

export default InviteFlow;
