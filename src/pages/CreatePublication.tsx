import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { topicTags } from '@/data/mock-publications';
import { mockMembers } from '@/data/mock-members';
import { ArrowLeft, Image, Video, Mic, FileText, Type, Upload, X, AlertTriangle } from 'lucide-react';

const MAX_SIZES: Record<string, number> = { photo: 20_000_000, video: 500_000_000, audio: 100_000_000 };

const CreatePublication: React.FC = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [approximate, setApproximate] = useState(false);
  const [place, setPlace] = useState('');
  const [topicTag, setTopicTag] = useState('');
  const [files, setFiles] = useState<{ name: string; size: number; error?: string }[]>([]);
  const [tagError, setTagError] = useState('');

  const types = [
    { id: 'photo', label: 'Photo', icon: Image },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'audio', label: 'Audio', icon: Mic },
    { id: 'document', label: 'Document', icon: FileText },
    { id: 'text', label: 'Text', icon: Type },
  ];

  const addMockFile = () => {
    const size = Math.floor(Math.random() * 600_000_000);
    const maxSize = type ? MAX_SIZES[type] : Infinity;
    const name = `file_${files.length + 1}.${type === 'photo' ? 'jpg' : type === 'video' ? 'mp4' : type === 'audio' ? 'm4a' : 'pdf'}`;
    setFiles(f => [...f, { name, size, error: size > maxSize ? `File too large (max ${Math.floor(maxSize / 1_000_000)}MB)` : undefined }]);
  };

  const handlePublish = () => {
    if (!topicTag) { setTagError('Topic tag is required'); return; }
    // Mock success
    navigate(ROUTES.classic.feed);
  };

  if (!type) {
    return (
      <div className="min-h-screen bg-background px-4 pt-4">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-muted-foreground text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-2xl font-bold mb-2">New Publication</h1>
        <p className="text-muted-foreground text-sm mb-6">What would you like to share?</p>
        <div className="grid grid-cols-2 gap-3">
          {types.map(t => (
            <button key={t.id} onClick={() => setType(t.id)} className="flex flex-col items-center gap-2 rounded-2xl bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <t.icon className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-4 pb-8">
      <button onClick={() => setType(null)} className="mb-4 flex items-center gap-1 text-muted-foreground text-sm">
        <ArrowLeft className="h-4 w-4" /> Change type
      </button>
      <h1 className="text-xl font-bold mb-4">New {type.charAt(0).toUpperCase() + type.slice(1)}</h1>

      <div className="space-y-4">
        <div><Label>Title (optional)</Label><Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1" placeholder="Give it a name..." /></div>
        <div><Label>Description</Label><Textarea value={text} onChange={e => setText(e.target.value)} className="mt-1" placeholder="Tell the story..." /></div>
        <div className="flex gap-3">
          <div className="flex-1"><Label>Event Date</Label><Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="mt-1" /></div>
          <div className="flex items-end gap-2 pb-0.5"><Switch checked={approximate} onCheckedChange={setApproximate} /><span className="text-xs text-muted-foreground">Approx.</span></div>
        </div>
        <div><Label>Place</Label><Input value={place} onChange={e => setPlace(e.target.value)} className="mt-1" placeholder="Where did it happen?" /></div>
        <div>
          <Label>Topic Tag *</Label>
          <Select value={topicTag} onValueChange={v => { setTopicTag(v); setTagError(''); }}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a topic" /></SelectTrigger>
            <SelectContent>{topicTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          {tagError && <p className="text-destructive text-xs mt-0.5">{tagError}</p>}
        </div>

        {/* Files */}
        {type !== 'text' && (
          <div>
            <Label>Files</Label>
            <div className="mt-1 space-y-2">
              {files.map((f, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-xl p-2.5 text-sm ${f.error ? 'bg-destructive/10 border border-destructive/30' : 'bg-card'}`}>
                  <div className="flex-1">
                    <p className="font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{(f.size / 1_000_000).toFixed(1)} MB</p>
                    {f.error && <p className="text-xs text-destructive flex items-center gap-1 mt-0.5"><AlertTriangle className="h-3 w-3" />{f.error}</p>}
                  </div>
                  <button onClick={() => setFiles(fs => fs.filter((_,j) => j !== i))}><X className="h-4 w-4 text-muted-foreground" /></button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="rounded-xl" onClick={addMockFile}>
                <Upload className="h-3.5 w-3.5 mr-1" /> Add file (mock)
              </Button>
            </div>
          </div>
        )}

        {/* Visibility */}
        <div className="rounded-xl bg-card p-3">
          <p className="text-sm font-medium mb-1">Visibility</p>
          <p className="text-xs text-muted-foreground">Visible to all family members. Tap to customize.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => navigate(-1)}>Cancel</Button>
          <Button className="flex-1 rounded-xl h-11" onClick={handlePublish} disabled={files.some(f => !!f.error)}>Publish</Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePublication;
