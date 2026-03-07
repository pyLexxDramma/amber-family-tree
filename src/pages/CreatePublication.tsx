import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { topicTags } from '@/data/mock-publications';
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
      <AppLayout>
        <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
          <TopBar title="Создать публикацию" onBack={() => navigate(-1)} light />
          <div className="mx-auto max-w-full px-4 pt-4 pb-8 sm:max-w-md md:max-w-2xl lg:max-w-4xl">
            <p className="text-sm font-medium text-[var(--proto-text-muted)] mb-6">Что хотите добавить?</p>
            <div className="flex flex-col gap-3">
              {types.map(t => (
                <button key={t.id} onClick={() => setType(t.id)} className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] w-full flex flex-row items-center justify-center gap-4 min-h-[96px] p-5 transition-all duration-300 hover:border-[var(--proto-active)]/40">
                  <t.icon className="h-8 w-8 text-[var(--proto-active)]" />
                  <span className="text-sm font-semibold text-[var(--proto-text)]">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title={type.charAt(0).toUpperCase() + type.slice(1)} onBack={() => setType(null)} light />
        <div className="mx-auto max-w-full px-4 pt-4 pb-8 sm:max-w-md md:max-w-2xl lg:max-w-4xl">
          <div className="space-y-4">
            <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5 min-h-[96px]">
              <Label className="text-sm font-semibold text-[var(--proto-text)]">Заголовок (необязательно)</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} className="mt-2 rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] text-[var(--proto-text)] placeholder:text-[var(--proto-text-muted)]" placeholder="Название..." />
            </div>
            <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5 min-h-[96px]">
              <Label className="text-sm font-semibold text-[var(--proto-text)]">Описание</Label>
              <Textarea value={text} onChange={e => setText(e.target.value)} className="mt-2 rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] text-[var(--proto-text)] min-h-[80px]" placeholder="Расскажите историю..." />
            </div>
            <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5 min-h-[96px] flex gap-3 items-end">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-[var(--proto-text)]">Дата события</Label>
                <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="mt-2 rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] text-[var(--proto-text)]" />
              </div>
              <div className="flex items-center gap-2 pb-0.5">
                <Switch checked={approximate} onCheckedChange={setApproximate} />
                <span className="text-xs font-medium text-[var(--proto-text-muted)]">приблизительно</span>
              </div>
            </div>
            <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5 min-h-[96px]">
              <Label className="text-sm font-semibold text-[var(--proto-text)]">Место</Label>
              <Input value={place} onChange={e => setPlace(e.target.value)} className="mt-2 rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] text-[var(--proto-text)]" placeholder="Где это было?" />
            </div>
            <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5 min-h-[96px]">
              <Label className="text-sm font-semibold text-[var(--proto-text)]">Тема *</Label>
              <Select value={topicTag} onValueChange={v => { setTopicTag(v); setTagError(''); }}>
                <SelectTrigger className="mt-2 rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] h-12 text-[var(--proto-text)]"><SelectValue placeholder="Выберите тему" /></SelectTrigger>
                <SelectContent>{topicTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              {tagError && <p className="text-red-600 text-sm font-medium mt-1">{tagError}</p>}
            </div>

            {type !== 'text' && (
              <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5 min-h-[96px]">
                <Label className="text-sm font-semibold text-[var(--proto-text)]">Файлы</Label>
                <div className="mt-2 space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className={`flex items-center gap-2 rounded-xl p-3 text-sm border-2 ${f.error ? 'border-red-500/50 bg-red-500/5' : 'border-[var(--proto-border)]'}`}>
                      <div className="flex-1">
                        <p className="font-semibold text-[var(--proto-text)]">{f.name}</p>
                        <p className="text-xs text-[var(--proto-text-muted)]">{(f.size / 1_000_000).toFixed(1)} MB</p>
                        {f.error && <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5"><AlertTriangle className="h-3 w-3" />{f.error}</p>}
                      </div>
                      <button onClick={() => setFiles(fs => fs.filter((_,j) => j !== i))} className="rounded-lg p-1 hover:bg-[var(--proto-border)]"><X className="h-4 w-4 text-[var(--proto-text-muted)]" /></button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="rounded-xl border-2 border-[var(--proto-active)] text-[var(--proto-active)] mt-2" onClick={addMockFile}>
                    <Upload className="h-3.5 w-3.5 mr-1" /> Добавить файл (мок)
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5 min-h-[96px]">
              <p className="text-sm font-semibold text-[var(--proto-text)] mb-1">Видимость</p>
              <p className="text-xs font-medium text-[var(--proto-text-muted)]">Всем участникам семьи. Нажмите, чтобы настроить.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-2xl h-12 border-2 border-[var(--proto-active)] text-[var(--proto-active)] font-semibold" onClick={() => navigate(-1)}>Отмена</Button>
              <Button className="flex-1 rounded-2xl h-12 bg-[var(--proto-active)] hover:opacity-90 text-white font-semibold" onClick={handlePublish} disabled={files.some(f => !!f.error)}>Опубликовать</Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreatePublication;
