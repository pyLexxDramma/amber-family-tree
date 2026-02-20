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
      <div className="min-h-screen bg-background px-0 pt-6 pb-8 page-enter">
        <button onClick={() => navigate(-1)} className="touch-target mb-6 flex items-center gap-2 rounded-xl border-2 border-primary/50 text-foreground/90 hover:text-primary hover:bg-primary/10 hover:border-primary/70 transition-colors px-3 py-2 font-semibold shadow-sm">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm tracking-wide">Назад</span>
        </button>
        <h1 className="hero-title text-2xl mb-2 px-3">Создать публикацию</h1>
        <p className="text-sm font-medium text-muted-foreground mb-6 px-3">Что хотите добавить?</p>
        <div className="flex flex-col gap-3 page-enter-stagger">
          {types.map(t => (
            <button key={t.id} onClick={() => setType(t.id)} className="content-card w-full flex flex-row items-center justify-center gap-4 min-h-[96px] p-5 transition-all duration-300 hover:border-primary/40">
              <t.icon className="h-8 w-8 text-primary" />
              <span className="text-sm font-semibold text-foreground">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-0 pt-4 pb-8 page-enter">
      <button onClick={() => setType(null)} className="touch-target mb-4 flex items-center gap-2 text-muted-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-primary/5 px-3 py-1">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-medium tracking-wide">Сменить тип</span>
      </button>
      <h1 className="hero-title text-xl mb-4 px-3">{type.charAt(0).toUpperCase() + type.slice(1)}</h1>

      <div className="space-y-4 page-enter-stagger">
        <div className="content-card p-5 rounded-2xl min-h-[96px]">
          <Label className="text-sm font-semibold text-foreground">Заголовок (необязательно)</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} className="mt-2 rounded-xl border-2" placeholder="Название..." />
        </div>
        <div className="content-card p-5 rounded-2xl min-h-[96px]">
          <Label className="text-sm font-semibold text-foreground">Описание</Label>
          <Textarea value={text} onChange={e => setText(e.target.value)} className="mt-2 rounded-xl border-2 min-h-[80px]" placeholder="Расскажите историю..." />
        </div>
        <div className="content-card p-5 rounded-2xl min-h-[96px] flex gap-3 items-end">
          <div className="flex-1">
            <Label className="text-sm font-semibold text-foreground">Дата события</Label>
            <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="mt-2 rounded-xl border-2" />
          </div>
          <div className="flex items-center gap-2 pb-0.5">
            <Switch checked={approximate} onCheckedChange={setApproximate} />
            <span className="text-xs font-medium text-muted-foreground">приблизительно</span>
          </div>
        </div>
        <div className="content-card p-5 rounded-2xl min-h-[96px]">
          <Label className="text-sm font-semibold text-foreground">Место</Label>
          <Input value={place} onChange={e => setPlace(e.target.value)} className="mt-2 rounded-xl border-2" placeholder="Где это было?" />
        </div>
        <div className="content-card p-5 rounded-2xl min-h-[96px]">
          <Label className="text-sm font-semibold text-foreground">Тема *</Label>
          <Select value={topicTag} onValueChange={v => { setTopicTag(v); setTagError(''); }}>
            <SelectTrigger className="mt-2 rounded-xl border-2 h-12"><SelectValue placeholder="Выберите тему" /></SelectTrigger>
            <SelectContent>{topicTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          {tagError && <p className="text-destructive text-sm font-medium mt-1">{tagError}</p>}
        </div>

        {type !== 'text' && (
          <div className="content-card p-5 rounded-2xl min-h-[96px]">
            <Label className="text-sm font-semibold text-foreground">Файлы</Label>
            <div className="mt-2 space-y-2">
              {files.map((f, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-xl p-3 text-sm border-2 ${f.error ? 'border-destructive/50 bg-destructive/5' : 'border-border/50'}`}>
                  <div className="flex-1">
                    <p className="font-semibold">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{(f.size / 1_000_000).toFixed(1)} MB</p>
                    {f.error && <p className="text-xs text-destructive flex items-center gap-1 mt-0.5"><AlertTriangle className="h-3 w-3" />{f.error}</p>}
                  </div>
                  <button onClick={() => setFiles(fs => fs.filter((_,j) => j !== i))} className="rounded-lg p-1 hover:bg-muted"><X className="h-4 w-4 text-muted-foreground" /></button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="rounded-xl border-2 mt-2" onClick={addMockFile}>
                <Upload className="h-3.5 w-3.5 mr-1" /> Добавить файл (мок)
              </Button>
            </div>
          </div>
        )}

        <div className="content-card p-5 rounded-2xl min-h-[96px]">
          <p className="text-sm font-semibold text-foreground mb-1">Видимость</p>
          <p className="text-xs font-medium text-muted-foreground">Всем участникам семьи. Нажмите, чтобы настроить.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 rounded-2xl h-12 border-2 font-semibold" onClick={() => navigate(-1)}>Отмена</Button>
          <Button className="flex-1 rounded-2xl h-12 font-semibold" onClick={handlePublish} disabled={files.some(f => !!f.error)}>Опубликовать</Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePublication;
