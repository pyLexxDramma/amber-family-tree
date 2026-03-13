import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { ArrowLeft, Image, Video, Mic, FileText, Type, Upload, X, AlertTriangle, Users, Lock, Globe } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { api } from '@/integrations/api';
import { requestJson } from '@/integrations/request';
import { usePrivacyVisibility } from '@/contexts/PrivacyVisibilityContext';
import { getMaxBytesForContentType, getMaxBytesForPublicationType } from '@/lib/uploadLimits';

type UploadItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  error?: string;
  key?: string;
  uploadMs?: number;
};

const CreatePublication: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [type, setType] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [approximate, setApproximate] = useState(false);
  const [place, setPlace] = useState('');
  const [topicTag, setTopicTag] = useState('');
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [tagError, setTagError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { visibility, setVisibility } = usePrivacyVisibility();

  const preselectedType = useMemo(() => {
    const t = new URLSearchParams(location.search).get('type');
    if (t === 'photo' || t === 'video' || t === 'audio' || t === 'media' || t === 'document' || t === 'text') return t;
    return null;
  }, [location.search]);

  useEffect(() => {
    if (type == null && preselectedType) setType(preselectedType);
  }, [preselectedType, type]);

  const accept = useMemo(() => {
    if (type === 'photo') return 'image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.gif';
    if (type === 'video') return 'video/*,.mp4,.mov,.webm';
    if (type === 'audio') return 'audio/*,.mp3,.m4a,.wav,.ogg';
    if (type === 'media') return 'image/*,video/*,audio/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.webm,.mp3,.m4a,.wav,.ogg';
    if (type === 'document') return '.pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';
    return '';
  }, [type]);

  const formatHints = useMemo(() => {
    if (type === 'photo') return { formats: 'JPG, PNG, HEIC, WebP', maxMb: 20 };
    if (type === 'video') return { formats: 'MP4, MOV, WebM', maxMb: 500 };
    if (type === 'audio') return { formats: 'MP3, M4A, WAV, OGG', maxMb: 100 };
    if (type === 'media') return { formats: 'Фото, видео, аудио', maxMb: 500 };
    if (type === 'document') return { formats: 'PDF, DOC, DOCX, TXT', maxMb: 100 };
    return null;
  }, [type]);

  const types = [
    { id: 'photo', label: 'Фото', icon: Image },
    { id: 'video', label: 'Видео', icon: Video },
    { id: 'audio', label: 'Аудио', icon: Mic },
    { id: 'media', label: 'Медиа', icon: Upload },
    { id: 'document', label: 'Документ', icon: FileText },
    { id: 'text', label: 'Текст', icon: Type },
  ];

  const addFiles = (list: FileList) => {
    if (!type) return;
    const now = Date.now();
    const items: UploadItem[] = Array.from(list).map((file, idx) => {
      const maxSize = type === 'media' ? getMaxBytesForContentType(file.type || '') : getMaxBytesForPublicationType(type);
      const err = file.size > maxSize ? `Слишком большой файл (макс. ${Math.floor(maxSize / 1_000_000)} МБ)` : undefined;
      return { id: `${now}_${idx}_${file.name}`, file, name: file.name, size: file.size, status: err ? 'error' : 'pending', error: err };
    });
    setFiles(prev => [...items, ...prev]);
  };

  const handlePublish = async () => {
    if (!type) return;
    if (!topicTag) {
      setTagError('Topic tag is required');
      return;
    }
    setIsPublishing(true);
    try {
      let uploadedKeys: string[] = [];
      if (type !== 'text') {
        const needUpload = files.filter(f => {
          if (f.status !== 'pending' || f.error) return false;
          const maxSize = type === 'media' ? getMaxBytesForContentType(f.file.type || '') : getMaxBytesForPublicationType(type);
          return f.size <= maxSize;
        });
        for (const item of needUpload) {
          setFiles(prev => prev.map(f => (f.id === item.id ? { ...f, status: 'uploading', error: undefined } : f)));
          const startedAt = performance.now();
          try {
            const presign = await api.media.presign({ filename: item.file.name, content_type: item.file.type || 'application/octet-stream', file_size_bytes: item.file.size });
            const putRes = await fetch(presign.upload_url, { method: 'PUT', headers: { 'Content-Type': item.file.type || 'application/octet-stream' }, body: item.file });
            if (!putRes.ok) throw new Error(`upload failed: ${putRes.status}`);
            const uploadMs = Math.round(performance.now() - startedAt);
            setFiles(prev => prev.map(f => (f.id === item.id ? { ...f, status: 'uploaded', key: presign.key, uploadMs } : f)));
          } catch (e) {
            const uploadMs = Math.round(performance.now() - startedAt);
            const err = e instanceof Error ? e.message : 'upload error';
            setFiles(prev => prev.map(f => (f.id === item.id ? { ...f, status: 'error', error: err, uploadMs } : f)));
          }
        }

        const hasBlocking = files.some(f => f.status === 'error' || !!f.error);
        if (hasBlocking) return;

        uploadedKeys = files.filter(f => f.status === 'uploaded' && f.key).map(f => f.key as string);
        if (uploadedKeys.length === 0) return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const pubType = type === 'media' ? (files[0]?.file.type.startsWith('video/') ? 'video' : files[0]?.file.type.startsWith('audio/') ? 'audio' : 'photo') : type;
      let visibleFor: string[] | null = null;
      let excludeFor: string[] | null = null;
      if (visibility === 'only_me') {
        const me = await api.profile.getMyProfile();
        visibleFor = [me.id];
      }
      await requestJson('POST', '/feed', {
        type: pubType,
        title: title || null,
        text,
        event_date: eventDate || today,
        event_date_approximate: approximate,
        place: place || null,
        topic_tag: topicTag,
        co_author_ids: [],
        participant_ids: [],
        visible_for: visibleFor,
        exclude_for: excludeFor,
        media_keys: uploadedKeys,
      });
      navigate(ROUTES.classic.feed);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!type) {
    return (
      <AppLayout>
        <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
          <TopBar title="Создать публикацию" onBack={() => navigate(-1)} light />
          <div className="mx-auto max-w-full px-3 pt-4 pb-8 sm:max-w-md sm:px-5 md:max-w-2xl lg:max-w-4xl overflow-x-hidden">
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
        <div className="mx-auto max-w-full px-3 pt-4 pb-8 sm:max-w-md sm:px-5 md:max-w-2xl lg:max-w-4xl overflow-x-hidden">
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
                {formatHints && (
                  <p className="mt-1 text-xs text-[var(--proto-text-muted)]">
                    {formatHints.formats} · макс. {formatHints.maxMb} МБ
                  </p>
                )}
                <div className="mt-2 space-y-2">
                  {files.map((f, i) => (
                    <div key={f.id} className={`flex items-center gap-2 rounded-xl p-3 text-sm border-2 ${f.error ? 'border-red-500/50 bg-red-500/5' : 'border-[var(--proto-border)]'}`}>
                      <div className="flex-1">
                        <p className="font-semibold text-[var(--proto-text)]">{f.name}</p>
                        <p className="text-xs text-[var(--proto-text-muted)]">{(f.size / 1_000_000).toFixed(1)} МБ</p>
                        {f.status === 'uploading' && <p className="text-xs text-[var(--proto-text-muted)] mt-0.5">Загрузка…</p>}
                        {f.status === 'uploaded' && <p className="text-xs text-green-700 mt-0.5">Загружено{typeof f.uploadMs === 'number' ? ` (${f.uploadMs} мс)` : ''}</p>}
                        {f.error && <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5"><AlertTriangle className="h-3 w-3" />{f.error}</p>}
                      </div>
                      <button disabled={f.status === 'uploading'} onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))} className="rounded-lg p-1 hover:bg-[var(--proto-border)] disabled:opacity-60"><X className="h-4 w-4 text-[var(--proto-text-muted)]" /></button>
                    </div>
                  ))}
                  <div className="relative mt-2 inline-block">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={accept}
                      className="absolute inset-0 z-10 w-full min-h-[40px] cursor-pointer opacity-0"
                      onChange={e => {
                        const list = e.currentTarget.files;
                        if (list?.length) addFiles(list);
                        e.currentTarget.value = '';
                      }}
                    />
                    <div className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 border-[var(--proto-active)] px-4 py-2 text-sm font-semibold text-[var(--proto-active)] hover:opacity-90 pointer-events-none">
                      <Upload className="h-3.5 w-3.5" /> Добавить файл
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setVisibilityOpen(true)}
              className="w-full rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5 min-h-[96px] text-left hover:border-[var(--proto-active)]/40 transition-colors"
            >
              <p className="text-sm font-semibold text-[var(--proto-text)] mb-1">Видимость</p>
              <p className="text-xs font-medium text-[var(--proto-text-muted)]">
                {visibility === 'all' && 'Всем'}
                {visibility === 'family' && 'Всем участникам семьи'}
                {visibility === 'only_me' && 'Только мне'}
                {' · Нажмите, чтобы изменить'}
              </p>
            </button>
            <Sheet open={visibilityOpen} onOpenChange={setVisibilityOpen}>
              <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle>Видимость публикации</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                  {[
                    { id: 'all' as const, label: 'Всем', icon: Globe },
                    { id: 'family' as const, label: 'Всем участникам семьи', icon: Users },
                    { id: 'only_me' as const, label: 'Только мне', icon: Lock },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => { setVisibility(opt.id); setVisibilityOpen(false); }}
                      className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left ${visibility === opt.id ? 'border-[var(--proto-active)] bg-[var(--proto-active)]/10' : 'border-[var(--proto-border)]'}`}
                    >
                      <opt.icon className="h-5 w-5 text-[var(--proto-active)]" />
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-2xl h-12 border-2 border-[var(--proto-active)] text-[var(--proto-active)] font-semibold" onClick={() => navigate(-1)}>Отмена</Button>
              <Button
                className="flex-1 rounded-2xl h-12 bg-[var(--proto-active)] hover:opacity-90 text-white font-semibold"
                onClick={handlePublish}
                disabled={isPublishing || files.some(f => !!f.error || f.status === 'error' || f.status === 'uploading') || (type !== 'text' && files.length === 0)}
              >
                {isPublishing ? 'Публикую…' : 'Опубликовать'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreatePublication;
