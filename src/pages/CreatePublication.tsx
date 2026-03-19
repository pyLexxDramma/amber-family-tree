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
import { Video, Mic, Upload, X, AlertTriangle, Users, Lock, Globe, Plus, Code, Link2, AlignLeft, Camera, Check, Pencil, ChevronRight, Menu, Trash2, MoreHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/integrations/api';
import { isMockUploadUrl } from '@/integrations/mockApi';
import { usePrivacyVisibility } from '@/contexts/PrivacyVisibilityContext';
import { getMaxBytesForContentType, getMaxBytesForPublicationType } from '@/lib/uploadLimits';
import { toast } from '@/hooks/use-toast';
import type { FamilyMember } from '@/types';

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

type StoryBlockType =
  | 'text'
  | 'photos'
  | 'video'
  | 'audio'
  | 'embed'
  | 'link_album'
  | 'attachment'
  | 'life_lesson';

type StoryBlock =
  | { id: string; type: 'text'; text: string }
  | { id: string; type: 'embed'; url: string }
  | { id: string; type: 'link_album'; url: string }
  | { id: string; type: 'life_lesson'; text: string }
  | { id: string; type: 'attachment'; items: UploadItem[] }
  | { id: string; type: 'photos' | 'video' | 'audio'; items: UploadItem[] };

type TitleEditState =
  | { mode: 'view' }
  | { mode: 'edit'; draft: string; original: string };

type PickMediaTarget =
  | { kind: 'photos' | 'video' | 'audio' | 'attachment'; blockId?: string }
  | null;

const CreatePublication: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const clientBuild = '2026-03-15.1';
  const [type, setType] = useState<string | null>(null);
  const [step, setStep] = useState<'story' | 'info' | 'publish'>('story');
  const [createKind, setCreateKind] = useState<'story' | 'album'>('story');
  const [title, setTitle] = useState('');
  const [titleEdit, setTitleEdit] = useState<TitleEditState>({ mode: 'edit', draft: '', original: '' });
  const [blocks, setBlocks] = useState<StoryBlock[]>([]);
  const [text, setText] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [approximate, setApproximate] = useState(false);
  const [place, setPlace] = useState('');
  const [topicTag, setTopicTag] = useState('');
  const [pickMediaFor, setPickMediaFor] = useState<StoryBlockType | null>(null);
  const [pickMediaTarget, setPickMediaTarget] = useState<PickMediaTarget>(null);
  const [tagError, setTagError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [blockPickerOpen, setBlockPickerOpen] = useState(false);
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [textEditorBlockId, setTextEditorBlockId] = useState<string | null>(null);
  const [textEditorValue, setTextEditorValue] = useState('');
  const [textEditorKind, setTextEditorKind] = useState<'text' | 'life_lesson'>('text');
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [coAuthorsOpen, setCoAuthorsOpen] = useState(false);
  const [coAuthorIds, setCoAuthorIds] = useState<string[]>([]);
  const [dateMode, setDateMode] = useState<'fixed' | 'period'>('fixed');
  const [dateFrom, setDateFrom] = useState({ year: '', month: '', day: '' });
  const [dateTo, setDateTo] = useState({ year: '', month: '', day: '' });
  const [storyTags, setStoryTags] = useState<string[]>([]);
  const [storyTagsDraft, setStoryTagsDraft] = useState('');
  const [relatedStoriesDraft, setRelatedStoriesDraft] = useState('');
  const [access, setAccess] = useState<'all' | 'groups' | 'people' | 'private'>('all');
  const [accessPeopleOpen, setAccessPeopleOpen] = useState(false);
  const [accessPeopleIds, setAccessPeopleIds] = useState<string[]>([]);
  const [guestLink, setGuestLink] = useState(false);
  const [tipClosed, setTipClosed] = useState(false);
  const [storyAttempted, setStoryAttempted] = useState(false);
  const [infoAttempted, setInfoAttempted] = useState(false);
  const [publishAttempted, setPublishAttempted] = useState(false);
  const [pendingScroll, setPendingScroll] = useState<null | 'story' | 'topic' | 'access'>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<Map<string, string>>(new Map());
  const filePickRef = useRef<PickMediaTarget>(null);
  const startedUploadsRef = useRef<Set<string>>(new Set());
  const [pickDebug, setPickDebug] = useState('');
  const { visibility, setVisibility } = usePrivacyVisibility();
  const storyRequiredRef = useRef<HTMLDivElement | null>(null);
  const topicRequiredRef = useRef<HTMLDivElement | null>(null);
  const accessRequiredRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      for (const url of objectUrlRef.current.values()) URL.revokeObjectURL(url);
      objectUrlRef.current.clear();
    };
  }, []);

  const scrollToRef = (ref: React.RefObject<HTMLElement | null>) => {
    const el = ref.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useEffect(() => {
    if (!pendingScroll) return;
    const t = setTimeout(() => {
      if (pendingScroll === 'story') scrollToRef(storyRequiredRef);
      if (pendingScroll === 'topic') scrollToRef(topicRequiredRef);
      if (pendingScroll === 'access') scrollToRef(accessRequiredRef);
      setPendingScroll(null);
    }, 50);
    return () => clearTimeout(t);
  }, [pendingScroll]);

  const acceptForKind = (k: PickMediaTarget['kind']) => {
    if (k === 'photos') return 'image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.gif';
    if (k === 'video') return 'video/*,.mp4,.mov,.webm';
    if (k === 'audio') return 'audio/*,.mp3,.m4a,.wav,.ogg';
    return '.pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';
  };

  const makeUploadItemsFromFiles = (files: File[], kind: StoryBlockType): UploadItem[] => {
    const now = Date.now();
    const pubType = kind === 'photos' ? 'photo' : kind === 'attachment' ? 'document' : kind;
    return files.map((file, idx) => {
      const maxSize = pubType === 'media' ? getMaxBytesForContentType(file.type || '') : getMaxBytesForPublicationType(pubType);
      const err = file.size > maxSize ? `Слишком большой файл (макс. ${Math.floor(maxSize / 1_000_000)} МБ)` : undefined;
      return { id: `${now}_${idx}_${file.name}`, file, name: file.name, size: file.size, status: err ? 'error' : 'pending', error: err };
    });
  };

  const handlePickedFiles = (files: File[], target: PickMediaTarget) => {
    const kind = target.kind;
    const items = makeUploadItemsFromFiles(files, kind);
    setPickDebug(`selected:${kind}:${items.length}`);
    toast({
      title: `Выбрано файлов: ${items.length}`,
      description: items[0]?.name ? `Первый файл: ${items[0].name}` : undefined,
    });
    const addToExisting = target.blockId;
    if (addToExisting) {
      setBlocks(prev => prev.map(b => {
        if (b.id !== addToExisting) return b;
        if (b.type === 'photos' || b.type === 'video' || b.type === 'audio') {
          if (b.type !== kind) return b;
          return { ...b, items: [...b.items, ...items] };
        }
        if (b.type === 'attachment' && kind === 'attachment') {
          return { ...b, items: [...b.items, ...items] };
        }
        return b;
      }));
    } else {
      const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      if (kind === 'photos' || kind === 'video' || kind === 'audio') {
        setBlocks(prev => [...prev, { id, type: kind, items }]);
      } else if (kind === 'attachment') {
        setBlocks(prev => [...prev, { id, type: 'attachment', items }]);
      }
    }
    setPickMediaFor(null);
    setPickMediaTarget(null);
    filePickRef.current = null;
  };

  const openFilePicker = async (target: PickMediaTarget) => {
    if (!target) return;
    filePickRef.current = target;
    setPickMediaFor(target.kind);
    setPickMediaTarget(target);
    if (!fileInputRef.current) return;
    fileInputRef.current.accept = acceptForKind(target.kind);
    setPickDebug(`open:${target.kind}${target.blockId ? `:${target.blockId}` : ''}`);
    try {
      const picker = (window as any).showOpenFilePicker as undefined | ((opts: any) => Promise<any[]>);
      if (picker) {
        const types =
          target.kind === 'photos' ? [{ description: 'Фото', accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.heic', '.heif'] } }] :
          target.kind === 'video' ? [{ description: 'Видео', accept: { 'video/*': ['.mp4', '.mov', '.webm'] } }] :
          target.kind === 'audio' ? [{ description: 'Аудио', accept: { 'audio/*': ['.mp3', '.m4a', '.wav', '.ogg'] } }] :
          [{ description: 'Файлы', accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } }];
        const handles = await picker({ multiple: true, types });
        const files = (await Promise.all(handles.map((h: any) => h.getFile?.()))).filter(Boolean) as File[];
        if (files.length) {
          handlePickedFiles(files, target);
          return;
        }
      }
    } catch {
    }
    fileInputRef.current.click();
  };

  const objectUrlFor = (item: UploadItem) => {
    const existing = objectUrlRef.current.get(item.id);
    if (existing) return existing;
    const url = URL.createObjectURL(item.file);
    objectUrlRef.current.set(item.id, url);
    return url;
  };

  const publishBlockers = useMemo(() => {
    const out: string[] = [];
    if (!topicTag) out.push('Выберите тему');
    const uploadingOrPending = blocks.some(b => (b.type === 'photos' || b.type === 'video' || b.type === 'audio' || b.type === 'attachment') && b.items.some(it => it.status === 'uploading' || it.status === 'pending'));
    if (uploadingOrPending) out.push('Дождитесь окончания загрузки файлов');
    const hasErrors = blocks.some(b => (b.type === 'photos' || b.type === 'video' || b.type === 'audio' || b.type === 'attachment') && b.items.some(it => it.status === 'error' || !!it.error));
    if (hasErrors) out.push('Исправьте ошибки загрузки файлов');
    if ((access === 'people' || access === 'groups') && accessPeopleIds.length === 0) out.push('Выберите людей для доступа');
    if (createKind === 'album') {
      const hasUploadedMedia = blocks.some(b => (b.type === 'photos' || b.type === 'video' || b.type === 'audio' || b.type === 'attachment') && b.items.some(it => it.status === 'uploaded'));
      if (!hasUploadedMedia) out.push('Для альбома добавьте хотя бы 1 медиафайл');
    } else {
      if (blocks.length === 0 && !title.trim()) out.push('Добавьте хотя бы один блок или задайте название');
    }
    return out;
  }, [access, accessPeopleIds.length, blocks, createKind, title, topicTag]);

  const storyBlockers = useMemo(() => {
    const out: string[] = [];
    if (blocks.length === 0 && !title.trim()) out.push('Добавьте хотя бы один блок или задайте название');
    return out;
  }, [blocks.length, title]);

  const infoBlockers = useMemo(() => {
    const out: string[] = [];
    if (!topicTag) out.push('Выберите тему');
    return out;
  }, [topicTag]);

  const preselectedType = useMemo(() => {
    const t = new URLSearchParams(location.search).get('type');
    if (t === 'photo' || t === 'video' || t === 'audio' || t === 'media' || t === 'document' || t === 'text') return t;
    return null;
  }, [location.search]);

  useEffect(() => {
    if (type == null && preselectedType) setType(preselectedType);
  }, [preselectedType, type]);

  useEffect(() => {
    api.family.listMembers().then(setMembers).catch(() => {});
  }, []);

  useEffect(() => {
    if (access === 'private') setVisibility('only_me');
    else if (access === 'all') setVisibility('family');
    else setVisibility('family');
  }, [access, setVisibility]);

  useEffect(() => {
    if (!dateFrom.year) return;
    const y = dateFrom.year.padStart(4, '0');
    const m = (dateFrom.month || '01').padStart(2, '0');
    const d = (dateFrom.day || '01').padStart(2, '0');
    setEventDate(`${y}-${m}-${d}`);
  }, [dateFrom.day, dateFrom.month, dateFrom.year]);

  const accept = useMemo(() => {
    if (pickMediaFor === 'photos') return 'image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.gif';
    if (pickMediaFor === 'video') return 'video/*,.mp4,.mov,.webm';
    if (pickMediaFor === 'audio') return 'audio/*,.mp3,.m4a,.wav,.ogg';
    if (pickMediaFor === 'attachment') return '.pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';
    return '';
  }, [pickMediaFor]);

  const formatHints = useMemo(() => {
    if (pickMediaFor === 'photos') return { formats: 'JPG, PNG, HEIC, WebP', maxMb: 20 };
    if (pickMediaFor === 'video') return { formats: 'MP4, MOV, WebM', maxMb: 500 };
    if (pickMediaFor === 'audio') return { formats: 'MP3, M4A, WAV, OGG', maxMb: 100 };
    if (pickMediaFor === 'attachment') return { formats: 'PDF, DOC, DOCX, TXT', maxMb: 100 };
    return null;
  }, [pickMediaFor]);

  const blockTypes: Array<{ id: StoryBlockType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'text', label: 'Текст', icon: AlignLeft },
    { id: 'photos', label: 'Фото', icon: Camera },
    { id: 'video', label: 'Видео', icon: Video },
    { id: 'audio', label: 'Аудио', icon: Mic },
    { id: 'embed', label: 'Вставка', icon: Code },
    { id: 'link_album', label: 'Альбом', icon: Link2 },
    { id: 'attachment', label: 'Вложение', icon: Upload },
    { id: 'life_lesson', label: 'Жизненный урок', icon: Pencil },
  ];

  const makeUploadItems = (list: FileList, kind: StoryBlockType): UploadItem[] => {
    const now = Date.now();
    const pubType = kind === 'photos' ? 'photo' : kind === 'attachment' ? 'document' : kind;
    return Array.from(list).map((file, idx) => {
      const maxSize = pubType === 'media' ? getMaxBytesForContentType(file.type || '') : getMaxBytesForPublicationType(pubType);
      const err = file.size > maxSize ? `Слишком большой файл (макс. ${Math.floor(maxSize / 1_000_000)} МБ)` : undefined;
      return { id: `${now}_${idx}_${file.name}`, file, name: file.name, size: file.size, status: err ? 'error' : 'pending', error: err };
    });
  };

  const setUploadItem = (blockId: string, itemId: string, patch: Partial<UploadItem>) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== blockId) return b;
      if (b.type !== 'photos' && b.type !== 'video' && b.type !== 'audio' && b.type !== 'attachment') return b;
      return { ...b, items: b.items.map(it => it.id === itemId ? { ...it, ...patch } : it) };
    }));
  };

  const uploadOne = async (blockId: string, item: UploadItem) => {
    setUploadItem(blockId, item.id, { status: 'uploading', error: undefined });
    const startedAt = performance.now();
    try {
      const presign = await api.media.presign({
        filename: item.file.name,
        content_type: item.file.type || 'application/octet-stream',
        file_size_bytes: item.file.size,
      });
      if (isMockUploadUrl(presign.upload_url)) {
        const uploadMs = Math.round(performance.now() - startedAt);
        setUploadItem(blockId, item.id, { status: 'uploaded', key: presign.key, uploadMs });
        return;
      }
      if (typeof window !== 'undefined') {
        try {
          const u = new URL(presign.upload_url);
          if (u.protocol !== 'https:' && window.location.protocol === 'https:') {
            throw new Error('presign returned non-https upload url');
          }
        } catch {}
      }
      const putRes = await fetch(presign.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': item.file.type || 'application/octet-stream' },
        body: item.file,
      });
      if (!putRes.ok) {
        let extra = '';
        try {
          const t = (await putRes.text()).trim();
          if (t) extra = ` ${t.slice(0, 220)}`;
        } catch {}
        throw new Error(`upload failed: ${putRes.status}${extra}`);
      }
      const uploadMs = Math.round(performance.now() - startedAt);
      setUploadItem(blockId, item.id, { status: 'uploaded', key: presign.key, uploadMs });
    } catch (e) {
      const uploadMs = Math.round(performance.now() - startedAt);
      const raw = e instanceof Error ? e.message : 'upload error';
      const err =
        raw.toLowerCase().includes('failed to fetch') || raw.toLowerCase().includes('networkerror')
          ? 'Сетевая ошибка. На сервере обычно не настроен CORS для загрузки файлов (PUT/OPTIONS) или неверный HTTPS.'
          : raw === 'presign returned non-https upload url'
            ? 'Ссылка на загрузку пришла по HTTP. Нужен HTTPS (иначе браузер блокирует).'
            : raw;
      setUploadItem(blockId, item.id, { status: 'error', error: err, uploadMs });
      toast({ title: 'Не удалось загрузить файл', description: err });
    }
  };

  useEffect(() => {
    for (const b of blocks) {
      if (b.type !== 'photos' && b.type !== 'video' && b.type !== 'audio' && b.type !== 'attachment') continue;
      for (const it of b.items) {
        if (it.status !== 'pending' || it.error) continue;
        if (startedUploadsRef.current.has(it.id)) continue;
        startedUploadsRef.current.add(it.id);
        void uploadOne(b.id, it);
      }
    }
  }, [blocks]);

  const handlePublish = async () => {
    if (!topicTag) {
      setTagError('Тема обязательна');
      return;
    }
    const hasUploadingOrPending = blocks.some(b => {
      if (b.type !== 'photos' && b.type !== 'video' && b.type !== 'audio' && b.type !== 'attachment') return false;
      return b.items.some(it => it.status === 'uploading' || it.status === 'pending');
    });
    if (hasUploadingOrPending) {
      toast({ title: 'Дождитесь окончания загрузки файлов' });
      return;
    }
    const hasErrors = blocks.some(b => {
      if (b.type !== 'photos' && b.type !== 'video' && b.type !== 'audio' && b.type !== 'attachment') return false;
      return b.items.some(it => it.status === 'error' || !!it.error);
    });
    if (hasErrors) {
      toast({ title: 'Есть ошибки загрузки файлов', description: 'Удалите проблемные файлы или нажмите «Повторить».' });
      return;
    }
    setIsPublishing(true);
    try {
      const uploadedKeys: string[] = [];
      let blocksLocal: StoryBlock[] = blocks.map((b) => {
        if (b.type === 'photos' || b.type === 'video' || b.type === 'audio' || b.type === 'attachment') {
          return { ...b, items: b.items.map(i => ({ ...i })) } as StoryBlock;
        }
        return { ...b } as StoryBlock;
      });

      const contentBlocks: Array<{ type: string; text?: string; n?: number; url?: string }> = [];
      for (const b of blocksLocal) {
        if (b.type === 'text') {
          contentBlocks.push({ type: 'text', text: b.text });
        } else if (b.type === 'life_lesson') {
          contentBlocks.push({ type: 'life_lesson', text: b.text });
        } else if (b.type === 'embed') {
          contentBlocks.push({ type: 'embed', url: b.url || '' });
        } else if (b.type === 'link_album') {
          contentBlocks.push({ type: 'link_album', url: b.url || '' });
        } else if (b.type === 'photos' || b.type === 'video' || b.type === 'audio' || b.type === 'attachment') {
          let n = 0;
          for (const it of b.items) {
            if (it.status === 'uploaded' && it.key) {
              uploadedKeys.push(it.key);
              n++;
            }
          }
          contentBlocks.push({ type: b.type, n });
        }
      }

      const today = new Date().toISOString().slice(0, 10);
      const textParts = blocksLocal
        .filter(b => b.type === 'text' || b.type === 'life_lesson')
        .map(b => (b.type === 'text' ? b.text : b.text).trim())
        .filter(Boolean);
      const bodyText = textParts.join('\n\n');
      const mediaKinds = blocksLocal
        .filter(b => b.type === 'photos' || b.type === 'video' || b.type === 'audio' || b.type === 'attachment')
        .map(b => b.type);
      const uniqueMediaKinds = Array.from(new Set(mediaKinds));
      const pubType =
        uniqueMediaKinds.length === 1 && !bodyText
          ? (uniqueMediaKinds[0] === 'photos' ? 'photo' : uniqueMediaKinds[0] === 'attachment' ? 'document' : uniqueMediaKinds[0])
          : 'text';
      let visibleFor: string[] | null = null;
      let excludeFor: string[] | null = null;
      if (access === 'private') {
        const me = await api.profile.getMyProfile();
        visibleFor = [me.id];
      } else if (access === 'people' || access === 'groups') {
        const me = await api.profile.getMyProfile();
        const set = new Set<string>([me.id, ...accessPeopleIds]);
        visibleFor = Array.from(set);
      }
      const created = await api.feed.createPublication({
        type: pubType,
        title: title || null,
        text: bodyText,
        event_date: eventDate || today,
        event_date_approximate: approximate,
        place: place || null,
        topic_tag: topicTag,
        co_author_ids: coAuthorIds,
        participant_ids: participantIds,
        visible_for: visibleFor,
        exclude_for: excludeFor,
        media_keys: uploadedKeys,
        content_blocks: contentBlocks.length > 0 ? contentBlocks : null,
      });
      navigate(ROUTES.classic.publication(created.id));
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar
          title="Создать"
          onBack={() => navigate(-1)}
          light
          right={
            <button
              type="button"
              className="relative h-10 w-10 rounded-full flex items-center justify-center text-[var(--proto-text-muted)] hover:bg-[var(--proto-border)] transition-colors"
              aria-label="Меню"
            >
              <Menu className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                1
              </span>
            </button>
          }
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const list = e.currentTarget.files;
            e.currentTarget.value = '';
            if (!list?.length) return;
            const target = filePickRef.current ?? pickMediaTarget ?? (pickMediaFor ? { kind: pickMediaFor as any } : null);
            if (!target) {
              toast({ title: 'Не удалось определить тип файла' });
              return;
            }
            handlePickedFiles(Array.from(list), target);
          }}
        />
        <div className="mx-auto max-w-full px-3 pt-2 pb-8 sm:max-w-md sm:px-5 md:max-w-2xl lg:max-w-4xl overflow-x-hidden">
          <div className="flex gap-2 border-b border-[var(--proto-border)] mb-4">
            {[
              { id: 'story' as const, label: '1. ИСТОРИЯ' },
              { id: 'info' as const, label: '2. ИНФО' },
              { id: 'publish' as const, label: '3. ПУБЛИКАЦИЯ' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setStep(t.id)}
                className={`flex-1 py-2 text-xs font-semibold tracking-wide transition-colors ${step === t.id ? 'text-[var(--proto-text)] border-b-2 border-[var(--proto-active)]' : 'text-[var(--proto-text-muted)] border-b-2 border-transparent'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-full px-3 sm:max-w-md sm:px-5 md:max-w-2xl lg:max-w-4xl overflow-x-hidden">
          {step === 'story' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="inline-flex rounded-full bg-[var(--proto-card)] border border-[var(--proto-border)] p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateKind('story');
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${createKind === 'story' ? 'bg-[var(--proto-active)] text-white' : 'text-[var(--proto-text-muted)] hover:text-[var(--proto-text)]'}`}
                  >
                    История
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateKind('album');
                      setBlocks(prev => prev.filter(b => b.type === 'photos' || b.type === 'video' || b.type === 'audio' || b.type === 'attachment'));
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${createKind === 'album' ? 'bg-[var(--proto-active)] text-white' : 'text-[var(--proto-text-muted)] hover:text-[var(--proto-text)]'}`}
                  >
                    Альбом
                  </button>
                </div>
              </div>

              {titleEdit.mode === 'edit' ? (
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        value={titleEdit.draft}
                        onChange={e => setTitleEdit(v => v.mode === 'edit' ? { ...v, draft: e.target.value.slice(0, 80) } : v)}
                        className="rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] text-[var(--proto-text)] placeholder:text-[var(--proto-text-muted)]"
                        placeholder={createKind === 'album' ? 'Название альбома' : 'Название истории'}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (titleEdit.mode !== 'edit') return;
                        setTitle(titleEdit.draft.trim());
                        setTitleEdit({ mode: 'view' });
                      }}
                      className="h-10 w-10 rounded-full border border-[var(--proto-border)] bg-[var(--proto-card)] flex items-center justify-center text-[var(--proto-text-muted)] hover:bg-[var(--proto-border)] transition-colors"
                      aria-label="Сохранить"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (titleEdit.mode !== 'edit') return;
                        setTitleEdit({ mode: 'view' });
                      }}
                      className="h-10 w-10 rounded-full border border-[var(--proto-border)] bg-[var(--proto-card)] flex items-center justify-center text-[var(--proto-text-muted)] hover:bg-[var(--proto-border)] transition-colors"
                      aria-label="Отмена"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-1 text-right text-xs text-[var(--proto-text-muted)]">
                    {titleEdit.draft.length} / 80
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2">
                    <h2 className="font-serif text-2xl font-semibold text-[var(--proto-text)]">
                      {title.trim() ? title : 'Без названия'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setTitleEdit({ mode: 'edit', draft: title, original: title })}
                      className="h-9 w-9 rounded-full border border-[var(--proto-border)] bg-[var(--proto-card)] flex items-center justify-center text-[var(--proto-text-muted)] hover:bg-[var(--proto-border)] transition-colors"
                      aria-label="Редактировать заголовок"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div ref={storyRequiredRef} className="flex flex-col items-center">
                <div className="w-full rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] px-4 py-3 mb-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[var(--proto-text)]">Контент</p>
                    <span className="text-xs font-semibold text-red-600">обязательно</span>
                  </div>
                  <p className={`mt-1 text-xs ${storyAttempted && storyBlockers.length ? 'text-red-700' : 'text-[var(--proto-text-muted)]'}`}>
                    Добавьте блок или укажите название
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBlockPickerOpen(true)}
                  className="h-14 w-14 rounded-full bg-[var(--proto-active)] text-white flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
                  aria-label="Добавить блок"
                  title="Добавить блок истории"
                >
                  <Plus className="h-7 w-7" />
                </button>
                <p className="mt-2 text-sm font-semibold text-[var(--proto-text)]">Добавить блок</p>
                {blocks.length === 0 && (
                  <p className="mt-0.5 text-xs text-[var(--proto-text-muted)] text-center">
                    Текст, фото, видео, аудио и другие блоки
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {blocks.map((b) => {
                  const label =
                    b.type === 'text' ? 'Текст' :
                    b.type === 'photos' ? 'Фото' :
                    b.type === 'video' ? 'Видео' :
                    b.type === 'audio' ? 'Аудио' :
                    b.type === 'embed' ? 'Вставка' :
                    b.type === 'link_album' ? 'Альбом' :
                    b.type === 'attachment' ? 'Вложение' :
                    'Жизненный урок';
                  const preview =
                    b.type === 'text' ? (b.text || '') :
                    b.type === 'life_lesson' ? (b.text || '') :
                    b.type === 'embed' ? (b.url || '') :
                    b.type === 'link_album' ? (b.url || '') :
                    `${b.items.length} файл(ов)`;
                  const canEditText = b.type === 'text' || b.type === 'life_lesson';
                  const isMedia = b.type === 'photos' || b.type === 'video' || b.type === 'audio' || b.type === 'attachment';
                  return (
                    <div key={b.id} className="rounded-xl bg-white border border-[var(--proto-border)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[var(--proto-text-muted)]">{label}</p>
                          {isMedia ? (
                            <div className="mt-2 space-y-2">
                              {b.items.map((it) => (
                                <div key={it.id} className={`flex items-center gap-2 rounded-xl p-3 text-sm border ${it.error ? 'border-red-500/50 bg-red-500/5' : 'border-[var(--proto-border)] bg-[var(--proto-card)]'}`}>
                                  {b.type === 'photos' && it.file.type.startsWith('image/') && !it.error ? (
                                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-[var(--proto-border)] border border-[var(--proto-border)] shrink-0">
                                      <img src={objectUrlFor(it)} alt="" className="w-full h-full object-cover" />
                                    </div>
                                  ) : b.type === 'video' && it.file.type.startsWith('video/') && !it.error ? (
                                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-black border border-[var(--proto-border)] shrink-0">
                                      <video playsInline muted preload="metadata" className="w-full h-full object-cover" src={objectUrlFor(it)} />
                                    </div>
                                  ) : null}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[var(--proto-text)] truncate">{it.name}</p>
                                    <p className="text-xs text-[var(--proto-text-muted)]">
                                      {it.size >= 1_000_000 ? `${(it.size / 1_000_000).toFixed(1)} МБ` : `${(it.size / 1024).toFixed(1)} КБ`}
                                      {it.status === 'uploaded' && typeof it.uploadMs === 'number' ? ` · ${it.uploadMs} мс` : ''}
                                    </p>
                                  {it.status === 'pending' && <p className="text-xs text-[var(--proto-text-muted)] mt-0.5">Готово к загрузке</p>}
                                    {it.status === 'uploading' && <p className="text-xs text-[var(--proto-text-muted)] mt-0.5">Загрузка…</p>}
                                    {it.status === 'uploaded' && <p className="text-xs text-green-700 mt-0.5">Загружено</p>}
                                    {it.error && <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5"><AlertTriangle className="h-3 w-3" />{it.error}</p>}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {it.status === 'error' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setBlocks(prev => prev.map(bb => {
                                            if (bb.id !== b.id) return bb;
                                            if (bb.type !== 'photos' && bb.type !== 'video' && bb.type !== 'audio' && bb.type !== 'attachment') return bb;
                                            return { ...bb, items: bb.items.map(x => x.id === it.id ? { ...x, status: 'pending', error: undefined } : x) };
                                          }));
                                          startedUploadsRef.current.delete(it.id);
                                        }}
                                        className="rounded-lg px-2 py-1 text-xs font-semibold border border-[var(--proto-border)] bg-white hover:border-[var(--proto-active)]/40 transition-colors"
                                      >
                                        Повторить
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      disabled={it.status === 'uploading'}
                                      onClick={() => {
                                        setBlocks(prev => prev.map(bb => {
                                          if (bb.id !== b.id) return bb;
                                          if (bb.type !== 'photos' && bb.type !== 'video' && bb.type !== 'audio' && bb.type !== 'attachment') return bb;
                                          return { ...bb, items: bb.items.filter(x => x.id !== it.id) };
                                        }));
                                      }}
                                      className="rounded-lg p-1 hover:bg-[var(--proto-border)] disabled:opacity-60"
                                      aria-label="Удалить файл"
                                    >
                                      <X className="h-4 w-4 text-[var(--proto-text-muted)]" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const kind = b.type === 'photos' ? 'photos' : b.type === 'video' ? 'video' : b.type === 'audio' ? 'audio' : 'attachment';
                                  openFilePicker({ kind: kind as any, blockId: b.id });
                                }}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--proto-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--proto-text)] hover:border-[var(--proto-active)]/40 transition-colors"
                              >
                                <Plus className="h-4 w-4 text-[var(--proto-active)]" />
                                Добавить файл
                              </button>
                            </div>
                          ) : b.type === 'embed' || b.type === 'link_album' ? (
                            <Input
                              value={b.type === 'embed' ? b.url : b.url}
                              onChange={(e) => {
                                const v = e.target.value;
                                setBlocks(prev => prev.map(bb => {
                                  if (bb.id !== b.id) return bb;
                                  if (bb.type === 'embed') return { ...bb, url: v };
                                  if (bb.type === 'link_album') return { ...bb, url: v };
                                  return bb;
                                }));
                              }}
                              placeholder={b.type === 'embed' ? 'Ссылка для вставки…' : 'Ссылка на альбом…'}
                              className="mt-2 rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] text-[var(--proto-text)]"
                            />
                          ) : (
                            <p className="mt-1 text-sm text-[var(--proto-text)] whitespace-pre-wrap break-words line-clamp-3">
                              {preview || '—'}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {canEditText && (
                            <button
                              type="button"
                              onClick={() => {
                                setTextEditorBlockId(b.id);
                                setTextEditorValue(b.type === 'text' ? b.text : (b.type === 'life_lesson' ? b.text : ''));
                                setTextEditorKind(b.type === 'life_lesson' ? 'life_lesson' : 'text');
                                setTextEditorOpen(true);
                              }}
                              className="h-9 w-9 rounded-full hover:bg-[var(--proto-border)] transition-colors flex items-center justify-center"
                              aria-label="Редактировать"
                            >
                              <Pencil className="h-4 w-4 text-[var(--proto-text-muted)]" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setBlocks(prev => prev.filter(bb => bb.id !== b.id))}
                            className="h-9 w-9 rounded-full hover:bg-[var(--proto-border)] transition-colors flex items-center justify-center"
                            aria-label="Удалить блок"
                          >
                            <Trash2 className="h-4 w-4 text-[var(--proto-text-muted)]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {blocks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setBlockPickerOpen(true)}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[var(--proto-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--proto-text)] hover:border-[var(--proto-active)]/40 transition-colors"
                  aria-label="Добавить ещё блок"
                  title="Добавить ещё блок в конец"
                >
                  <Plus className="h-5 w-5 text-[var(--proto-active)]" />
                  Добавить ещё блок
                </button>
              )}

              <Button
                type="button"
                className="w-full rounded-2xl h-12 bg-[var(--proto-active)] hover:opacity-90 text-white font-semibold disabled:opacity-50"
                onClick={() => {
                  setStoryAttempted(true);
                  if (storyBlockers.length) {
                    setPendingScroll('story');
                    toast({ title: 'Заполните обязательные поля', description: storyBlockers[0] });
                    return;
                  }
                  setStep('info');
                }}
              >
                Следующий шаг <ChevronRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full rounded-2xl h-12 border-2 bg-white"
                onClick={() => setPreviewOpen(true)}
                disabled={!title.trim() && blocks.length === 0}
              >
                Предпросмотр
              </Button>

              {storyAttempted && storyBlockers.length > 0 && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-4">
                  <p className="text-sm font-semibold text-red-700">Обязательные поля:</p>
                  <ul className="mt-2 space-y-1 text-sm text-red-700">
                    {storyBlockers.map((b) => (
                      <li key={b}>- {b}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-[11px] text-center text-[var(--proto-text-muted)]">
                build {clientBuild}{pickDebug ? ` · ${pickDebug}` : ''}
              </p>
            </div>
          )}

          {step === 'info' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5">
                <Label className="text-sm font-semibold text-[var(--proto-text)]">Кто был рядом?</Label>
                <p className="mt-1 text-xs text-[var(--proto-text-muted)]">Участники истории</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {participantIds.map(pid => {
                    const m = members.find(mm => mm.id === pid);
                    const name = m ? (m.nickname || `${m.firstName} ${m.lastName}`.trim()) : 'Участник';
                    return (
                      <button
                        key={pid}
                        type="button"
                        onClick={() => setParticipantIds(v => v.filter(x => x !== pid))}
                        className="px-3 py-1.5 rounded-full bg-white border border-[var(--proto-border)] text-xs font-semibold text-[var(--proto-text)]"
                      >
                        {name} <span className="ml-1 text-[var(--proto-text-muted)]">×</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setParticipantsOpen(true)}
                    className="px-3 py-1.5 rounded-full bg-[var(--proto-active)]/10 border border-[var(--proto-border)] text-xs font-semibold text-[var(--proto-text)]"
                  >
                    + Добавить
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5">
                <Label className="text-sm font-semibold text-[var(--proto-text)]">Когда это было?</Label>
                <div className="mt-3 flex gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" checked={dateMode === 'fixed'} onChange={() => setDateMode('fixed')} />
                    <span className="text-[var(--proto-text)]">Точная дата</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" checked={dateMode === 'period'} onChange={() => setDateMode('period')} />
                    <span className="text-[var(--proto-text)]">Период</span>
                  </label>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Input
                    value={dateFrom.year}
                    onChange={(e) => setDateFrom(v => ({ ...v, year: e.target.value.replace(/[^\d]/g, '').slice(0, 4) }))}
                    placeholder="Год*"
                    className="rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] text-[var(--proto-text)]"
                  />
                  <Input
                    value={dateFrom.month}
                    onChange={(e) => setDateFrom(v => ({ ...v, month: e.target.value.replace(/[^\d]/g, '').slice(0, 2) }))}
                    placeholder="Мес"
                    className="rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] text-[var(--proto-text)]"
                  />
                  <Input
                    value={dateFrom.day}
                    onChange={(e) => setDateFrom(v => ({ ...v, day: e.target.value.replace(/[^\d]/g, '').slice(0, 2) }))}
                    placeholder="День"
                    className="rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] text-[var(--proto-text)]"
                  />
                </div>

                {dateMode === 'period' && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <Input
                      value={dateTo.year}
                      onChange={(e) => setDateTo(v => ({ ...v, year: e.target.value.replace(/[^\d]/g, '').slice(0, 4) }))}
                      placeholder="До: год"
                      className="rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] text-[var(--proto-text)]"
                    />
                    <Input
                      value={dateTo.month}
                      onChange={(e) => setDateTo(v => ({ ...v, month: e.target.value.replace(/[^\d]/g, '').slice(0, 2) }))}
                      placeholder="До: мес"
                      className="rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] text-[var(--proto-text)]"
                    />
                    <Input
                      value={dateTo.day}
                      onChange={(e) => setDateTo(v => ({ ...v, day: e.target.value.replace(/[^\d]/g, '').slice(0, 2) }))}
                      placeholder="До: день"
                      className="rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] text-[var(--proto-text)]"
                    />
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <Switch checked={approximate} onCheckedChange={setApproximate} />
                  <span className="text-xs font-medium text-[var(--proto-text-muted)]">приблизительно</span>
                </div>
              </div>

              <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5">
                <Label className="text-sm font-semibold text-[var(--proto-text)]">Где это было?</Label>
                <Input
                  value={place}
                  onChange={e => setPlace(e.target.value)}
                  placeholder="Место (текстом)"
                  className="mt-3 rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] text-[var(--proto-text)]"
                />
              </div>

              <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5">
                <Label className="text-sm font-semibold text-[var(--proto-text)]">Теги истории</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {storyTags.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setStoryTags(v => v.filter(x => x !== t))}
                      className="px-3 py-1.5 rounded-full bg-white border border-[var(--proto-border)] text-xs font-semibold text-[var(--proto-text)]"
                    >
                      #{t} <span className="ml-1 text-[var(--proto-text-muted)]">×</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Input
                    value={storyTagsDraft}
                    onChange={(e) => setStoryTagsDraft(e.target.value)}
                    placeholder="Добавить тег..."
                    className="flex-1 rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] text-[var(--proto-text)]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-2 border-[var(--proto-border)]"
                    onClick={() => {
                      const v = storyTagsDraft.trim().replace(/^#/, '');
                      if (!v) return;
                      setStoryTags(prev => prev.includes(v) ? prev : [...prev, v]);
                      setStoryTagsDraft('');
                    }}
                  >
                    Добавить
                  </Button>
                </div>
              </div>

              <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5">
                <Label className="text-sm font-semibold text-[var(--proto-text)]">Соавторы</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {coAuthorIds.map(cid => {
                    const m = members.find(mm => mm.id === cid);
                    const name = m ? (m.nickname || `${m.firstName} ${m.lastName}`.trim()) : 'Соавтор';
                    return (
                      <button
                        key={cid}
                        type="button"
                        onClick={() => setCoAuthorIds(v => v.filter(x => x !== cid))}
                        className="px-3 py-1.5 rounded-full bg-white border border-[var(--proto-border)] text-xs font-semibold text-[var(--proto-text)]"
                      >
                        {name} <span className="ml-1 text-[var(--proto-text-muted)]">×</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setCoAuthorsOpen(true)}
                    className="px-3 py-1.5 rounded-full bg-[var(--proto-active)]/10 border border-[var(--proto-border)] text-xs font-semibold text-[var(--proto-text)]"
                  >
                    + Добавить
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5">
                <Label className="text-sm font-semibold text-[var(--proto-text)]">Связанные истории</Label>
                <Input
                  value={relatedStoriesDraft}
                  onChange={(e) => setRelatedStoriesDraft(e.target.value)}
                  placeholder="Введите название истории..."
                  className="mt-3 rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] text-[var(--proto-text)]"
                />
              </div>

              <div ref={topicRequiredRef} className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-[var(--proto-text)]">Тема</Label>
                  <span className="text-xs font-semibold text-red-600">обязательно</span>
                </div>
                <Select value={topicTag} onValueChange={v => { setTopicTag(v); setTagError(''); }}>
                  <SelectTrigger className={`mt-2 rounded-xl border-2 bg-[var(--proto-bg)] h-12 text-[var(--proto-text)] ${(publishAttempted || infoAttempted) && !topicTag ? 'border-red-500/60' : 'border-[var(--proto-border)]'}`}><SelectValue placeholder="Выберите тему" /></SelectTrigger>
                  <SelectContent>{topicTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
                {tagError && <p className="text-red-600 text-sm font-medium mt-1">{tagError}</p>}
              </div>

              <button
                type="button"
                onClick={() => setVisibilityOpen(true)}
                className="w-full rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5 text-left hover:border-[var(--proto-active)]/40 transition-colors"
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
                <Button
                  variant="outline"
                  className="flex-1 rounded-2xl h-12 border-2 border-[var(--proto-active)] text-[var(--proto-active)] font-semibold"
                  onClick={() => setStep('story')}
                >
                  Назад
                </Button>
                <Button
                  className="flex-1 rounded-2xl h-12 bg-[var(--proto-active)] hover:opacity-90 text-white font-semibold"
                  onClick={() => {
                    setInfoAttempted(true);
                    if (infoBlockers.length) {
                      setTagError('Тема обязательна');
                      setPendingScroll('topic');
                      toast({ title: 'Заполните обязательные поля', description: infoBlockers[0] });
                      return;
                    }
                    setStep('publish');
                  }}
                >
                  Следующий шаг
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full rounded-2xl h-12 border-2 bg-white"
                onClick={() => setPreviewOpen(true)}
                disabled={!title.trim() && blocks.length === 0}
              >
                Предпросмотр
              </Button>

              {infoAttempted && infoBlockers.length > 0 && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-4">
                  <p className="text-sm font-semibold text-red-700">Обязательные поля:</p>
                  <ul className="mt-2 space-y-1 text-sm text-red-700">
                    {infoBlockers.map((b) => (
                      <li key={b}>- {b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {step === 'publish' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5">
                <p className="text-sm font-semibold text-[var(--proto-text)]">Кто может видеть эту историю?</p>
                <p className="mt-1 text-xs text-[var(--proto-text-muted)]">Назначенный доступ</p>
                <Select
                  value={access}
                  onValueChange={(v) => {
                    const nv = v as any;
                    setAccess(nv);
                    if (nv === 'groups' || nv === 'people') setAccessPeopleOpen(true);
                  }}
                >
                  <SelectTrigger className="mt-2 rounded-xl border-2 border-[var(--proto-border)] bg-[var(--proto-bg)] h-12 text-[var(--proto-text)]">
                    <SelectValue placeholder="Выберите доступ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все участники</SelectItem>
                    <SelectItem value="groups">Группы</SelectItem>
                    <SelectItem value="people">Отдельные люди</SelectItem>
                    <SelectItem value="private">Только я</SelectItem>
                  </SelectContent>
                </Select>
                {(access === 'groups' || access === 'people') && (
                  <div ref={accessRequiredRef} className="mt-3">
                    <button
                      type="button"
                      onClick={() => setAccessPeopleOpen(true)}
                      className={`w-full flex items-center justify-between rounded-xl bg-white border px-4 py-3 text-left ${publishAttempted && accessPeopleIds.length === 0 ? 'border-red-500/60' : 'border-[var(--proto-border)]'}`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-[var(--proto-text)]">Выбранные люди</p>
                        <p className="text-xs text-[var(--proto-text-muted)]">{accessPeopleIds.length} выбрано</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--proto-text-muted)]" />
                    </button>
                    {publishAttempted && accessPeopleIds.length === 0 && (
                      <p className="mt-2 text-xs font-semibold text-red-700">обязательно: выберите хотя бы одного человека</p>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5">
                <p className="text-sm font-semibold text-[var(--proto-text)]">Поделиться вне приложения?</p>
                {!tipClosed && (
                  <div className="mt-3 rounded-xl bg-sky-50 border border-sky-200 p-4 relative">
                    <button
                      type="button"
                      onClick={() => setTipClosed(true)}
                      className="absolute right-3 top-3 text-sky-700/70 hover:text-sky-700"
                      aria-label="Закрыть подсказку"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-xs font-semibold text-sky-700">ПОДСКАЗКА</p>
                    <p className="mt-1 text-xs text-sky-700/80">
                      Включите гостевую ссылку, чтобы любой мог открыть историю по ссылке.
                    </p>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between rounded-xl bg-white border border-[var(--proto-border)] px-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--proto-text)]">Гостевая ссылка</p>
                    <p className="text-xs text-[var(--proto-text-muted)]">Любой с ссылкой сможет посмотреть</p>
                  </div>
                  <Switch checked={guestLink} onCheckedChange={setGuestLink} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="w-full rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5 text-left hover:border-[var(--proto-active)]/40 transition-colors"
              >
                <p className="text-sm font-semibold text-[var(--proto-text)]">Предпросмотр</p>
                <p className="mt-2 text-sm text-[var(--proto-text-muted)]">{title || 'Без названия'}</p>
                <p className="mt-1 text-xs text-[var(--proto-text-muted)]">Нажмите, чтобы посмотреть</p>
              </button>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-2xl h-12 border-2 border-[var(--proto-active)] text-[var(--proto-active)] font-semibold" onClick={() => setStep('info')}>Назад</Button>
                <Button
                  className="flex-1 rounded-2xl h-12 bg-[var(--proto-active)] hover:opacity-90 text-white font-semibold"
                  onClick={() => {
                    setPublishAttempted(true);
                    if (publishBlockers.length) {
                      const first = publishBlockers[0];
                      if (first === 'Выберите тему') {
                        setStep('info');
                        setPendingScroll('topic');
                      } else if (first === 'Выберите людей для доступа') {
                        setPendingScroll('access');
                        setAccessPeopleOpen(true);
                      } else {
                        setStep('story');
                        setPendingScroll('story');
                      }
                      toast({ title: 'Нельзя опубликовать', description: publishBlockers[0] });
                      return;
                    }
                    handlePublish();
                  }}
                  disabled={
                    isPublishing ||
                    blocks.some(b => (b.type === 'photos' || b.type === 'video' || b.type === 'audio' || b.type === 'attachment') && b.items.some(it => !!it.error || it.status === 'error' || it.status === 'uploading')) ||
                    (!topicTag) ||
                    ((access === 'people' || access === 'groups') && accessPeopleIds.length === 0) ||
                    (
                      createKind === 'album'
                        ? !blocks.some(b => (b.type === 'photos' || b.type === 'video' || b.type === 'audio' || b.type === 'attachment') && b.items.some(it => it.status === 'uploaded'))
                        : (blocks.length === 0 && !title.trim())
                    )
                  }
                >
                  {isPublishing ? 'Публикую…' : 'Опубликовать обновления'}
                </Button>
              </div>
              {publishBlockers.length > 0 && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-4">
                  <p className="text-sm font-semibold text-red-700">Почему нельзя опубликовать:</p>
                  <ul className="mt-2 space-y-1 text-sm text-red-700">
                    {publishBlockers.map((b) => (
                      <li key={b}>- {b}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="pt-2 text-center text-sm">
                <button type="button" className="text-red-600 font-semibold" disabled>
                  Снять с публикации
                </button>
                <span className="mx-3 text-[var(--proto-text-muted)]">ИЛИ</span>
                <button type="button" className="text-red-600 font-semibold" disabled>
                  Удалить историю
                </button>
              </div>
            </div>
          )}
        </div>

        <Dialog open={blockPickerOpen} onOpenChange={setBlockPickerOpen}>
          <DialogContent className="bg-[var(--proto-bg)] border-[var(--proto-border)] rounded-3xl w-[92vw] max-w-md p-6">
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="font-serif text-2xl text-[var(--proto-text)]">Добавить блок истории</DialogTitle>
            </DialogHeader>
            <div className="mt-2">
              <p className="text-xs font-semibold text-[var(--proto-text-muted)] tracking-wider uppercase text-center mb-4">
                Выберите тип блока
              </p>
              <div className="grid grid-cols-2 gap-4">
                {blockTypes.map((bt) => {
                  const Icon = bt.icon;
                  return (
                    <button
                      key={bt.id}
                      type="button"
                      onClick={() => {
                        setBlockPickerOpen(false);
                        const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
                        if (bt.id === 'text') {
                          setTextEditorBlockId(null);
                          setTextEditorValue('');
                          setTextEditorKind('text');
                          setTextEditorOpen(true);
                          return;
                        }
                        if (bt.id === 'photos') {
                          openFilePicker({ kind: 'photos' });
                          return;
                        }
                        if (bt.id === 'video') {
                          openFilePicker({ kind: 'video' });
                          return;
                        }
                        if (bt.id === 'audio') {
                          openFilePicker({ kind: 'audio' });
                          return;
                        }
                        if (bt.id === 'embed') {
                          setBlocks(prev => [...prev, { id, type: 'embed', url: '' }]);
                          return;
                        }
                        if (bt.id === 'link_album') {
                          setBlocks(prev => [...prev, { id, type: 'link_album', url: '' }]);
                          return;
                        }
                        if (bt.id === 'attachment') {
                          openFilePicker({ kind: 'attachment' });
                          return;
                        }
                        if (bt.id === 'life_lesson') {
                          setTextEditorBlockId(null);
                          setTextEditorValue('');
                          setTextEditorKind('life_lesson');
                          setTextEditorOpen(true);
                          return;
                        }
                      }}
                      className="rounded-2xl border px-4 py-6 text-center transition-colors flex flex-col items-center justify-center gap-3 bg-white border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 shadow-sm"
                    >
                      <Icon className="h-7 w-7 text-[var(--proto-active)]" />
                      <span className="text-sm font-semibold text-[var(--proto-text)]">{bt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={textEditorOpen} onOpenChange={setTextEditorOpen}>
          <DialogContent className="bg-[var(--proto-bg)] border-[var(--proto-border)] rounded-3xl w-[92vw] max-w-md p-6">
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="font-serif text-2xl text-[var(--proto-text)]">{textEditorKind === 'life_lesson' ? 'Жизненный урок' : 'Добавить текст'}</DialogTitle>
            </DialogHeader>
            <div className="mt-2">
              <div className="flex items-center gap-2 rounded-xl border border-[var(--proto-border)] bg-white px-3 py-2 text-[var(--proto-text-muted)]">
                <span className="text-xs font-semibold">Обычный</span>
                <span className="ml-auto text-xs font-semibold">B</span>
                <span className="text-xs italic">I</span>
                <span className="text-xs underline">U</span>
              </div>
              <Textarea
                value={textEditorValue}
                onChange={(e) => setTextEditorValue(e.target.value)}
                className="mt-3 rounded-xl border-2 border-[var(--proto-border)] bg-white text-[var(--proto-text)] min-h-[160px]"
                placeholder="Добавьте текст..."
              />
              <Button
                type="button"
                className="mt-4 w-full rounded-2xl h-12 bg-[var(--proto-active)] hover:opacity-90 text-white font-semibold disabled:opacity-50"
                disabled={!textEditorValue.trim()}
                onClick={() => {
                  const v = textEditorValue.trim();
                  if (!v) return;
                  if (textEditorBlockId) {
                    setBlocks(prev => prev.map(b => (b.id === textEditorBlockId && b.type === 'text') ? { ...b, text: v } : (b.id === textEditorBlockId && b.type === 'life_lesson') ? { ...b, text: v } : b));
                  } else {
                    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
                    setBlocks(prev => [...prev, { id, type: textEditorKind, text: v } as any]);
                  }
                  setTextEditorValue('');
                  setTextEditorBlockId(null);
                  setTextEditorOpen(false);
                }}
              >
                Добавить в историю
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={participantsOpen} onOpenChange={setParticipantsOpen}>
          <DialogContent className="bg-[var(--proto-bg)] border-[var(--proto-border)] rounded-3xl w-[92vw] max-w-md p-6">
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="font-serif text-2xl text-[var(--proto-text)]">Участники истории</DialogTitle>
            </DialogHeader>
            <div className="mt-2 space-y-2 max-h-[60vh] overflow-auto">
              {members.map(m => {
                const checked = participantIds.includes(m.id);
                const name = m.nickname || `${m.firstName} ${m.lastName}`.trim();
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setParticipantIds(prev => checked ? prev.filter(x => x !== m.id) : [...prev, m.id])}
                    className="w-full flex items-center gap-3 rounded-xl bg-white border border-[var(--proto-border)] px-4 py-3 text-left"
                  >
                    <span className={`h-5 w-5 rounded border flex items-center justify-center ${checked ? 'bg-[var(--proto-active)] border-[var(--proto-active)] text-white' : 'border-[var(--proto-border)] text-transparent'}`}>
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold text-[var(--proto-text)]">{name || 'Участник'}</span>
                  </button>
                );
              })}
            </div>
            <Button
              type="button"
              className="mt-4 w-full rounded-2xl h-12 bg-[var(--proto-active)] hover:opacity-90 text-white font-semibold"
              onClick={() => setParticipantsOpen(false)}
            >
              Готово
            </Button>
          </DialogContent>
        </Dialog>

        <Dialog open={coAuthorsOpen} onOpenChange={setCoAuthorsOpen}>
          <DialogContent className="bg-[var(--proto-bg)] border-[var(--proto-border)] rounded-3xl w-[92vw] max-w-md p-6">
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="font-serif text-2xl text-[var(--proto-text)]">Соавторы</DialogTitle>
            </DialogHeader>
            <div className="mt-2 space-y-2 max-h-[60vh] overflow-auto">
              {members.map(m => {
                const checked = coAuthorIds.includes(m.id);
                const name = m.nickname || `${m.firstName} ${m.lastName}`.trim();
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCoAuthorIds(prev => checked ? prev.filter(x => x !== m.id) : [...prev, m.id])}
                    className="w-full flex items-center gap-3 rounded-xl bg-white border border-[var(--proto-border)] px-4 py-3 text-left"
                  >
                    <span className={`h-5 w-5 rounded border flex items-center justify-center ${checked ? 'bg-[var(--proto-active)] border-[var(--proto-active)] text-white' : 'border-[var(--proto-border)] text-transparent'}`}>
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold text-[var(--proto-text)]">{name || 'Соавтор'}</span>
                  </button>
                );
              })}
            </div>
            <Button
              type="button"
              className="mt-4 w-full rounded-2xl h-12 bg-[var(--proto-active)] hover:opacity-90 text-white font-semibold"
              onClick={() => setCoAuthorsOpen(false)}
            >
              Готово
            </Button>
          </DialogContent>
        </Dialog>

        <Dialog open={accessPeopleOpen} onOpenChange={setAccessPeopleOpen}>
          <DialogContent className="bg-[var(--proto-bg)] border-[var(--proto-border)] rounded-3xl w-[92vw] max-w-md p-6">
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="font-serif text-2xl text-[var(--proto-text)]">
                {access === 'groups' ? 'Группы (выбор людей)' : 'Отдельные люди'}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-2 space-y-2 max-h-[60vh] overflow-auto">
              {members.map(m => {
                const checked = accessPeopleIds.includes(m.id);
                const name = m.nickname || `${m.firstName} ${m.lastName}`.trim();
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAccessPeopleIds(prev => checked ? prev.filter(x => x !== m.id) : [...prev, m.id])}
                    className="w-full flex items-center gap-3 rounded-xl bg-white border border-[var(--proto-border)] px-4 py-3 text-left"
                  >
                    <span className={`h-5 w-5 rounded border flex items-center justify-center ${checked ? 'bg-[var(--proto-active)] border-[var(--proto-active)] text-white' : 'border-[var(--proto-border)] text-transparent'}`}>
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold text-[var(--proto-text)]">{name || 'Участник'}</span>
                  </button>
                );
              })}
            </div>
            <Button
              type="button"
              className="mt-4 w-full rounded-2xl h-12 bg-[var(--proto-active)] hover:opacity-90 text-white font-semibold"
              onClick={() => setAccessPeopleOpen(false)}
            >
              Готово
            </Button>
          </DialogContent>
        </Dialog>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="bg-[var(--proto-bg)] border-[var(--proto-border)] rounded-3xl w-[92vw] max-w-md p-6">
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="font-serif text-2xl text-[var(--proto-text)]">Предпросмотр</DialogTitle>
            </DialogHeader>
            <div className="mt-2 max-h-[70vh] overflow-auto space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-[var(--proto-text)] text-center">
                {title.trim() ? title : 'Без названия'}
              </h2>
              {blocks.length === 0 ? (
                <p className="text-sm text-[var(--proto-text-muted)] text-center">Добавьте хотя бы один блок</p>
              ) : (
                <div className="space-y-3">
                  {blocks.map((b) => {
                    if (b.type === 'text') {
                      return (
                        <div key={b.id} className="rounded-xl bg-white border border-[var(--proto-border)] p-4">
                          <p className="text-sm text-[var(--proto-text)] whitespace-pre-wrap break-words">{b.text}</p>
                        </div>
                      );
                    }
                    if (b.type === 'life_lesson') {
                      return (
                        <div key={b.id} className="rounded-xl bg-white border border-[var(--proto-border)] p-4">
                          <p className="text-xs font-semibold text-[var(--proto-text-muted)]">Жизненный урок</p>
                          <p className="mt-2 text-sm text-[var(--proto-text)] whitespace-pre-wrap break-words">{b.text}</p>
                        </div>
                      );
                    }
                    if (b.type === 'embed' || b.type === 'link_album') {
                      const label = b.type === 'embed' ? 'Вставка' : 'Альбом';
                      return (
                        <div key={b.id} className="rounded-xl bg-white border border-[var(--proto-border)] p-4">
                          <p className="text-xs font-semibold text-[var(--proto-text-muted)]">{label}</p>
                          <a
                            href={b.url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className={`mt-2 block text-sm font-semibold break-words ${b.url ? 'text-[var(--proto-active)]' : 'text-[var(--proto-text-muted)]'}`}
                          >
                            {b.url ? b.url : 'Ссылка не указана'}
                          </a>
                        </div>
                      );
                    }
                    if (b.type === 'photos') {
                      const imgs = b.items.filter(it => it.file.type.startsWith('image/'));
                      return (
                        <div key={b.id} className="rounded-xl bg-white border border-[var(--proto-border)] p-4">
                          <p className="text-xs font-semibold text-[var(--proto-text-muted)]">Фото</p>
                          {imgs.length === 0 ? (
                            <p className="mt-2 text-sm text-[var(--proto-text-muted)]">Файлы не выбраны</p>
                          ) : (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              {imgs.map((it) => (
                                <div key={it.id} className="rounded-lg overflow-hidden border border-[var(--proto-border)] bg-[var(--proto-card)] aspect-square">
                                  <img src={objectUrlFor(it)} alt="" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    if (b.type === 'video' || b.type === 'audio' || b.type === 'attachment') {
                      const label = b.type === 'video' ? 'Видео' : b.type === 'audio' ? 'Аудио' : 'Вложение';
                      return (
                        <div key={b.id} className="rounded-xl bg-white border border-[var(--proto-border)] p-4">
                          <p className="text-xs font-semibold text-[var(--proto-text-muted)]">{label}</p>
                          {b.items.length === 0 ? (
                            <p className="mt-2 text-sm text-[var(--proto-text-muted)]">Файлы не выбраны</p>
                          ) : (
                            <div className="mt-3 space-y-2">
                              {b.items.map(it => (
                                <div key={it.id} className="rounded-xl border border-[var(--proto-border)] bg-[var(--proto-card)] px-3 py-2">
                                  {b.type !== 'video' && (
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-[var(--proto-text)] truncate">{it.name}</p>
                                        <p className="text-xs text-[var(--proto-text-muted)]">
                                          {it.status === 'uploading' ? 'Загрузка…' : it.status === 'uploaded' ? 'Загружено' : it.status === 'error' ? 'Ошибка' : 'Готово'}
                                        </p>
                                      </div>
                                      {it.status === 'error' && <span className="text-xs font-semibold text-red-600">!</span>}
                                    </div>
                                  )}
                                  {b.type === 'video' && it.file.type.startsWith('video/') && !it.error ? (
                                    <video
                                      controls
                                      playsInline
                                      preload="metadata"
                                      className="w-full rounded-lg border border-[var(--proto-border)] bg-black"
                                      src={objectUrlFor(it)}
                                    />
                                  ) : b.type === 'video' && it.error ? (
                                    <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{it.error}</p>
                                  ) : b.type === 'audio' && it.file.type.startsWith('audio/') && !it.error ? (
                                    <audio controls preload="metadata" className="mt-2 w-full" src={objectUrlFor(it)} />
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
            <Button
              type="button"
              className="mt-4 w-full rounded-2xl h-12 bg-[var(--proto-active)] hover:opacity-90 text-white font-semibold"
              onClick={() => setPreviewOpen(false)}
            >
              Вернуться
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default CreatePublication;
