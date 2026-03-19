import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getMember, currentUserId } from '@/data/mock-members';
import { api } from '@/integrations/api';
import { ROUTES } from '@/constants/routes';
import {
  getPrototypeAvatar,
  getPrototypePublicationPhotoByTopic,
} from '@/lib/prototype-assets';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { usePlatform } from '@/platform/PlatformContext';
import { ChevronLeft, ChevronRight, Heart, MoreVertical, Star } from 'lucide-react';
import type { FamilyMember, Publication } from '@/types';
import { toast } from '@/hooks/use-toast';
import { isDemoMode, useAvatarFallback } from '@/lib/demoMode';
import { isMilestone, toggleMilestone } from '@/lib/milestones';
import { ApiError } from '@/integrations/request';
import { isMockUploadUrl } from '@/integrations/mockApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const authorIdOf = (p: Publication) => (p as { authorId?: string; author_id?: string }).authorId ?? (p as { author_id?: string }).author_id;
const participantIdsOf = (p: Publication) => (p as { participantIds?: string[]; participant_ids?: string[] }).participantIds ?? (p as { participant_ids?: string[] }).participant_ids ?? [];
const memberDisplayName = (m: { firstName?: string; first_name?: string; lastName?: string; last_name?: string } | null) =>
  m ? `${(m as { firstName?: string }).firstName ?? (m as { first_name?: string }).first_name ?? ''} ${(m as { lastName?: string }).lastName ?? (m as { last_name?: string }).last_name ?? ''}`.trim() || 'Автор' : 'Автор';

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? '';
  const b = parts[1]?.[0] ?? '';
  return (a + b).toUpperCase() || '?';
};

const compareMedia = (a: { name?: string; url?: string; thumbnail?: string }, b: { name?: string; url?: string; thumbnail?: string }) => {
  const an = (a.name || '').toLowerCase();
  const bn = (b.name || '').toLowerCase();
  const byName = an.localeCompare(bn);
  if (byName) return byName;
  const au = (a.url || a.thumbnail || '').toLowerCase();
  const bu = (b.url || b.thumbnail || '').toLowerCase();
  return au.localeCompare(bu);
};

type MediaEditItem = {
  id: string;
  type: 'photo' | 'video' | 'audio' | 'document';
  url: string;
  thumbnail?: string;
  name?: string;
  action: 'keep' | 'remove' | 'replace';
  replaceFile?: File;
};

const PublicationDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const platform = usePlatform();
  const [pub, setPub] = useState<Publication | null | undefined>(undefined);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [likedUi, setLikedUi] = useState(false);
  const [likesCountUi, setLikesCountUi] = useState(0);
  const likePendingRef = useRef(false);
  const photoScrollerRef = useRef<HTMLDivElement | null>(null);
  const rafScrollRef = useRef<number | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const blockScrollRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const blockRafRefs = useRef<Record<number, number>>({});
  const [blockPhotoIndices, setBlockPhotoIndices] = useState<Record<number, number>>({});
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentInputRef = useRef<HTMLInputElement | null>(null);
  const myMemberIdRef = useRef<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editApproximate, setEditApproximate] = useState(false);
  const [editPlace, setEditPlace] = useState('');
  const [editTopicTag, setEditTopicTag] = useState('');
  const [editMedia, setEditMedia] = useState<MediaEditItem[]>([]);
  const [editNewFiles, setEditNewFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [milestone, setMilestone] = useState(false);
  const memberMap = useMemo(() => new Map(members.map(m => [m.id, m])), [members]);

  useEffect(() => {
    if (!id) {
      setPub(null);
      return;
    }
    api.feed.getById(id).then(setPub);
    api.family.listMembers().then(setMembers);
    api.profile.getMyProfile().then(me => setMyMemberId(me.id)).catch(() => {});
  }, [id]);

  useEffect(() => {
    setPhotoIdx(0);
    setBlockPhotoIndices({});
    const el = photoScrollerRef.current;
    if (el) el.scrollTo({ left: 0 });
  }, [id]);

  useEffect(() => {
    myMemberIdRef.current = myMemberId;
  }, [myMemberId]);

  useEffect(() => {
    if (!pub) return;
    if (likePendingRef.current) return;
    setLikesCountUi((pub.likes ?? []).length);
    if (!myMemberId) return;
    setLikedUi((pub.likes ?? []).includes(myMemberId));
  }, [myMemberId, pub]);

  useEffect(() => {
    if (!pub || pub === undefined || pub === null) return;
    setMilestone(isMilestone(pub.id));
  }, [pub]);

  if (pub === undefined) {
    return (
      <AppLayout>
        <div className="prototype-screen p-6 text-center text-[var(--proto-text-muted)]">Загрузка...</div>
      </AppLayout>
    );
  }

  if (pub === null) {
    return (
      <AppLayout>
        <div className="prototype-screen p-6 text-center text-[var(--proto-text-muted)]">Публикация не найдена</div>
      </AppLayout>
    );
  }

  const aid = authorIdOf(pub);
  const author = memberMap.get(aid) ?? getMember(aid);
  const photos = pub.media.filter(m => m.type === 'photo');
  const otherMedia = pub.media.filter(m => m.type !== 'photo');
  const photoItems = [...photos].sort(compareMedia);
  const demo = isDemoMode();
  const authorName = memberDisplayName(author ?? null);
  const authorAvatarSrc = author && (author as { avatar?: string }).avatar
    ? (author as { avatar: string }).avatar
    : (useAvatarFallback() ? getPrototypeAvatar(aid, currentUserId).src : '');
  const coverSrc = photos[0]?.url || otherMedia.find(m => m.thumbnail)?.thumbnail;
  const mainPhoto = coverSrc
    ? { src: coverSrc, objectPosition: 'center center' as const }
    : (demo ? getPrototypePublicationPhotoByTopic(pub.topicTag) : { src: '', objectPosition: 'center center' as const });
  const pids = participantIdsOf(pub).slice(0, 6);
  const participants = pids.map(pid => memberMap.get(pid) ?? getMember(pid)).filter(Boolean);
  const tags = [pub.topicTag].filter(Boolean);
  const publicationDescription = pub.text || '';
  const publishDateFormatted = format(new Date(pub.publishDate), 'dd MMM, yyyy', { locale: ru });
  const comments = [...(pub.comments ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const effectiveMemberId = myMemberId ?? myMemberIdRef.current;
  const isLiked = likedUi;
  const isAuthor = !!effectiveMemberId && effectiveMemberId === aid;
  const demoEmotionsByTopic: Record<string, string[]> = {
    'День рождения': ['Радость', 'Счастье', 'Восторг'],
    'Праздники': ['Радость', 'Тепло', 'Любовь'],
    'Путешествия': ['Восторг', 'Счастье', 'Радость'],
    'Будни': ['Покой', 'Спокойствие', 'Уют'],
    'Истории': ['Гордость', 'Благодарность', 'Тепло'],
  };
  const emotions = demo ? (demoEmotionsByTopic[pub.topicTag] ?? ['Тепло', 'Уют']) : [];
  const aiTags = demo ? ([
    pub.place ? `PLACE: ${pub.place}` : null,
    emotions[0] ? `EMOTION: ${emotions[0]}` : null,
    pub.topicTag ? `TOPIC: ${pub.topicTag}` : null,
  ].filter(Boolean) as string[]) : tags;

  const submitComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    if (isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const created = await api.feed.addComment(pub.id, text);
      setPub(prev => prev ? { ...prev, comments: [...(prev.comments ?? []), created] } : prev);
      setCommentText('');
      platform.hapticFeedback('light');
    } catch (e) {
      let desc: string | undefined;
      if (e instanceof ApiError) desc = `HTTP ${e.status}: ${e.bodyText.slice(0, 160)}`;
      toast({ title: 'Не удалось отправить комментарий', description: desc });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const toggleLike = async () => {
    if (!pub) return;
    if (isTogglingLike) return;
    setIsTogglingLike(true);
    likePendingRef.current = true;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast({ title: 'Нужно войти, чтобы поставить лайк' });
        return;
      }
      const nextLiked = !likedUi;
      setLikedUi(nextLiked);
      setLikesCountUi((c) => Math.max(0, c + (nextLiked ? 1 : -1)));

      const updated = nextLiked ? await api.feed.addLike(pub.id) : await api.feed.removeLike(pub.id);
      setPub(updated);
      setLikesCountUi((updated.likes ?? []).length);
      if (effectiveMemberId) setLikedUi((updated.likes ?? []).includes(effectiveMemberId));
      platform.hapticFeedback('light');
    } catch {
      try {
        const fresh = await api.feed.getById(pub.id);
        if (fresh) setPub(fresh);
      } catch {}
      toast({ title: 'Не удалось поставить лайк' });
    } finally {
      likePendingRef.current = false;
      setIsTogglingLike(false);
    }
  };

  const openEdit = () => {
    setEditTitle(pub.title ?? '');
    setEditText(pub.text ?? '');
    setEditEventDate(pub.eventDate);
    setEditApproximate(Boolean(pub.eventDateApproximate));
    setEditPlace(pub.place ?? '');
    setEditTopicTag(pub.topicTag);
    setEditMedia(
      (pub.media ?? []).map((m) => ({
        id: m.id,
        type: m.type as MediaEditItem['type'],
        url: m.url,
        thumbnail: m.thumbnail,
        name: m.name,
        action: 'keep',
      })),
    );
    setEditNewFiles([]);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!pub) return;
    if (isSaving) return;
    setIsSaving(true);
    try {
      const uploadFile = async (file: File) => {
        const presign = await api.media.presign({
          filename: file.name,
          content_type: file.type || 'application/octet-stream',
          file_size_bytes: file.size,
          publication_id: pub.id,
        });
        if (isMockUploadUrl(presign.upload_url)) return presign.key;
        const putRes = await fetch(presign.upload_url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });
        if (!putRes.ok) {
          let extra = '';
          try {
            const t = (await putRes.text()).trim();
            if (t) extra = ` ${t.slice(0, 220)}`;
          } catch {}
          throw new Error(`upload failed: ${putRes.status}${extra}`);
        }
        return presign.key;
      };

      const removeMediaIds = editMedia.filter(m => m.action === 'remove' || m.action === 'replace').map(m => m.id);
      const filesToUpload = [
        ...editMedia.filter(m => m.action === 'replace' && m.replaceFile).map(m => m.replaceFile as File),
        ...editNewFiles,
      ];
      const addMediaKeys: string[] = [];
      for (const f of filesToUpload) addMediaKeys.push(await uploadFile(f));

      const patch: any = {
        title: editTitle.trim() ? editTitle.trim() : null,
        text: editText,
        event_date: editEventDate || pub.eventDate,
        event_date_approximate: editApproximate,
        place: editPlace || null,
        topic_tag: editTopicTag || '',
      };
      if (removeMediaIds.length) patch.remove_media_ids = removeMediaIds;
      if (addMediaKeys.length) patch.add_media_keys = addMediaKeys;

      const updated = await api.feed.updatePublication(pub.id, patch);
      setPub(updated);
      setEditOpen(false);
      platform.hapticFeedback('light');
    } catch (e) {
      let desc: string | undefined;
      if (e instanceof ApiError) desc = `HTTP ${e.status}: ${e.bodyText.slice(0, 160)}`;
      else if (e instanceof Error) desc = e.message.slice(0, 220);
      toast({ title: 'Не удалось сохранить изменения', description: desc });
    } finally {
      setIsSaving(false);
    }
  };

  const doDelete = async () => {
    if (!pub) return;
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await api.feed.deletePublication(pub.id);
      setDeleteOpen(false);
      platform.hapticFeedback('light');
      navigate(-1);
    } catch (e) {
      let desc: string | undefined;
      if (e instanceof ApiError) desc = `HTTP ${e.status}: ${e.bodyText.slice(0, 160)}`;
      toast({ title: 'Не удалось удалить публикацию', description: desc });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    if (!pub || !myMemberId) return;
    try {
      const current = (pub.comments ?? []).find(c => c.id === commentId);
      const liked = current ? (current.likes ?? []).includes(myMemberId) : false;
      const updated = liked
        ? await api.feed.removeCommentLike(pub.id, commentId)
        : await api.feed.addCommentLike(pub.id, commentId);
      setPub(prev => prev ? { ...prev, comments: (prev.comments ?? []).map(c => c.id === commentId ? { ...c, ...updated } : c) } : prev);
      platform.hapticFeedback('light');
    } catch {
      toast({ title: 'Не удалось поставить лайк' });
    }
  };

  const scrollToPhoto = (idx: number) => {
    const el = photoScrollerRef.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    el.scrollTo({ left: idx * w, behavior: 'smooth' });
  };

  const scrollBlockPhoto = (blockIndex: number, photoIndex: number, total: number) => {
    const el = blockScrollRefs.current[blockIndex];
    if (!el) return;
    const w = el.clientWidth || 1;
    const idx = Math.max(0, Math.min(total - 1, photoIndex));
    el.scrollTo({ left: idx * w, behavior: 'smooth' });
  };

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)] flex flex-col">
        <TopBar
          title={demo && pub.type === 'photo' ? 'Фотография' : 'Публикация'}
          onBack={() => navigate(-1)}
          light
          right={
            <button type="button" className="h-10 w-10 rounded-full flex items-center justify-center text-[var(--proto-text-muted)] hover:bg-[var(--proto-border)] transition-colors" aria-label="Ещё">
              <MoreVertical className="h-5 w-5" />
            </button>
          }
        />

        <div className="mx-auto max-w-full px-3 pt-2 pb-6 space-y-4 overflow-auto flex-1 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
          <button
            type="button"
            onClick={() => navigate(ROUTES.classic.profile(aid))}
            className="flex items-center gap-3 w-full text-left"
          >
            <div className="h-10 w-10 rounded-full overflow-hidden bg-[var(--proto-card)] shrink-0">
              {authorAvatarSrc ? (
                <img
                  src={authorAvatarSrc}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-[#E5E1DC] text-[#6B6560] font-semibold text-sm">
                  {initialsOf(authorName)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--proto-text)] text-sm">{authorName}</p>
              <p className="text-xs text-[var(--proto-text-muted)] flex items-center gap-1">
                <span>{publishDateFormatted}</span>
                {pub.place && <><span>·</span><span>{pub.place}</span></>}
              </p>
            </div>
          </button>

          {(() => {
            const blocks = pub.contentBlocks;
            const media = pub.media ?? [];
            if (blocks && blocks.length > 0) {
              let mediaIdx = 0;
              return (
                <>
                  <h1 className="font-serif font-semibold text-xl text-[var(--proto-text)]">{pub.title || 'Без названия'}</h1>
                  {blocks.map((blk, bi) => {
                    if (blk.type === 'text' && blk.text) {
                      return <p key={bi} className="text-base text-[var(--proto-text)] leading-relaxed whitespace-pre-wrap">{blk.text}</p>;
                    }
                    if (blk.type === 'life_lesson' && blk.text) {
                      return (
                        <div key={bi} className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-4">
                          <p className="text-xs font-semibold text-[var(--proto-text-muted)]">Жизненный урок</p>
                          <p className="mt-2 text-sm text-[var(--proto-text)] whitespace-pre-wrap">{blk.text}</p>
                        </div>
                      );
                    }
                    if (blk.type === 'embed' && blk.url) {
                      return (
                        <div key={bi} className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-4">
                          <p className="text-xs font-semibold text-[var(--proto-text-muted)]">Вставка</p>
                          <a href={blk.url} target="_blank" rel="noreferrer" className="mt-2 block text-sm font-semibold text-[var(--proto-active)] break-words">{blk.url}</a>
                        </div>
                      );
                    }
                    if (blk.type === 'link_album' && blk.url) {
                      return (
                        <div key={bi} className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-4">
                          <p className="text-xs font-semibold text-[var(--proto-text-muted)]">Альбом</p>
                          <a href={blk.url} target="_blank" rel="noreferrer" className="mt-2 block text-sm font-semibold text-[var(--proto-active)] break-words">{blk.url}</a>
                        </div>
                      );
                    }
                    const n = blk.n ?? 0;
                    if ((blk.type === 'photos' || blk.type === 'video' || blk.type === 'audio' || blk.type === 'attachment') && n > 0) {
                      const slice = media.slice(mediaIdx, mediaIdx + n);
                      mediaIdx += n;
                      if (blk.type === 'photos' && slice.length > 0) {
                        const imgs = slice.filter(m => m.type === 'photo');
                        if (imgs.length > 1) {
                          const currentIdx = blockPhotoIndices[bi] ?? 0;
                          return (
                            <div key={bi} className="relative rounded-lg overflow-hidden bg-[var(--proto-card)] border border-[var(--proto-border)] aspect-[4/3] w-full">
                              <div
                                ref={(el) => { blockScrollRefs.current[bi] = el; }}
                                className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
                                style={{ WebkitOverflowScrolling: 'touch' }}
                                onScroll={() => {
                                  const el = blockScrollRefs.current[bi];
                                  if (!el) return;
                                  const prev = blockRafRefs.current[bi];
                                  if (prev != null) cancelAnimationFrame(prev);
                                  blockRafRefs.current[bi] = requestAnimationFrame(() => {
                                    const w = el.clientWidth || 1;
                                    const next = Math.max(0, Math.min(imgs.length - 1, Math.round(el.scrollLeft / w)));
                                    setBlockPhotoIndices(prev => (prev[bi] === next ? prev : { ...prev, [bi]: next }));
                                  });
                                }}
                              >
                                {imgs.map((m) => (
                                  <div key={m.id} className="w-full h-full shrink-0 snap-center bg-[var(--proto-border)]">
                                    <img src={m.url} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = getPrototypePublicationPhotoByTopic(pub.topicTag).src; }} />
                                  </div>
                                ))}
                              </div>
                              <div className="absolute top-2 right-2 rounded-full bg-black/55 text-white text-xs font-semibold px-2.5 py-1">{currentIdx + 1}/{imgs.length}</div>
                              <button type="button" onClick={() => scrollBlockPhoto(bi, currentIdx - 1, imgs.length)} className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/35 text-white flex items-center justify-center hover:bg-black/45 transition-colors" aria-label="Предыдущее фото"><ChevronLeft className="h-5 w-5" /></button>
                              <button type="button" onClick={() => scrollBlockPhoto(bi, currentIdx + 1, imgs.length)} className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/35 text-white flex items-center justify-center hover:bg-black/45 transition-colors" aria-label="Следующее фото"><ChevronRight className="h-5 w-5" /></button>
                              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-3">
                                {imgs.map((_, i) => (
                                  <button key={i} type="button" onClick={() => scrollBlockPhoto(bi, i, imgs.length)} className={`h-1.5 rounded-full transition-all ${i === currentIdx ? 'w-6 bg-white/90' : 'w-2.5 bg-white/45 hover:bg-white/70'}`} aria-label={`Фото ${i + 1}`} />
                                ))}
                              </div>
                            </div>
                          );
                        }
                        if (imgs.length === 1) {
                          return (
                            <div key={bi} className="rounded-lg overflow-hidden bg-[var(--proto-card)] border border-[var(--proto-border)] aspect-[4/3] w-full">
                              <img src={imgs[0].url} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = getPrototypePublicationPhotoByTopic(pub.topicTag).src; }} />
                            </div>
                          );
                        }
                      }
                      return (
                        <div key={bi} className="space-y-2">
                          {slice.map((m) => (
                            <div key={m.id} className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-3">
                              {m.type === 'video' ? (
                                <video controls playsInline preload="metadata" className="w-full rounded-lg border border-[var(--proto-border)] bg-black" poster={m.thumbnail || undefined} src={m.url} />
                              ) : m.type === 'audio' ? (
                                <audio controls preload="metadata" className="w-full" src={m.url} />
                              ) : (
                                <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-full rounded-lg h-10 px-4 text-sm font-medium border border-[var(--proto-border)] text-[var(--proto-text)] hover:border-[var(--proto-active)]/30 transition-colors">Открыть</a>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })}
                </>
              );
            }
            return (
              <>
                {photoItems.length > 1 ? (
                  <div className="relative rounded-lg overflow-hidden bg-[var(--proto-card)] border border-[var(--proto-border)] aspect-[4/3] w-full">
                    <div ref={photoScrollerRef} className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }} onScroll={() => { const el = photoScrollerRef.current; if (!el) return; if (rafScrollRef.current != null) cancelAnimationFrame(rafScrollRef.current); rafScrollRef.current = requestAnimationFrame(() => { const w = el.clientWidth || 1; const next = Math.max(0, Math.min(photoItems.length - 1, Math.round(el.scrollLeft / w))); setPhotoIdx(next); }); }}>
                      {photoItems.map((m) => (
                        <div key={m.id} className="w-full h-full shrink-0 snap-center bg-[var(--proto-border)]">
                          <img src={m.url} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = getPrototypePublicationPhotoByTopic(pub.topicTag).src; }} />
                        </div>
                      ))}
                    </div>
                    <div className="absolute top-2 right-2 rounded-full bg-black/55 text-white text-xs font-semibold px-2.5 py-1">{photoIdx + 1}/{photoItems.length}</div>
                    <button type="button" onClick={() => scrollToPhoto(Math.max(0, photoIdx - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/35 text-white flex items-center justify-center hover:bg-black/45 transition-colors" aria-label="Предыдущее фото"><ChevronLeft className="h-5 w-5" /></button>
                    <button type="button" onClick={() => scrollToPhoto(Math.min(photoItems.length - 1, photoIdx + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/35 text-white flex items-center justify-center hover:bg-black/45 transition-colors" aria-label="Следующее фото"><ChevronRight className="h-5 w-5" /></button>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-3">
                      {photoItems.map((m, i) => (
                        <button key={m.id} type="button" onClick={() => scrollToPhoto(i)} className={`h-1.5 rounded-full transition-all ${i === photoIdx ? 'w-6 bg-white/90' : 'w-2.5 bg-white/45 hover:bg-white/70'}`} aria-label={`Фото ${i + 1}`} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden bg-[var(--proto-card)] border border-[var(--proto-border)] aspect-[4/3] w-full">
                    {mainPhoto.src ? (
                      <img src={mainPhoto.src} alt="" className="w-full h-full object-cover" style={{ objectPosition: mainPhoto.objectPosition }} onError={(e) => { e.currentTarget.src = getPrototypePublicationPhotoByTopic(pub.topicTag).src; }} />
                    ) : (
                      <img src={getPrototypePublicationPhotoByTopic(pub.topicTag).src} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
                {otherMedia.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-[var(--proto-text)] mb-2">Файлы:</p>
                    <div className="space-y-2">
                      {otherMedia.slice(0, 10).map((m) => (
                        <div key={m.id} className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-3">
                          <p className="text-sm font-semibold text-[var(--proto-text)] truncate">{m.name || 'Файл'}</p>
                          <p className="text-xs text-[var(--proto-text-muted)] mb-2">{m.type}</p>
                          {m.type === 'video' ? <video controls playsInline preload="metadata" className="w-full rounded-lg border border-[var(--proto-border)] bg-black" poster={m.thumbnail || undefined} src={m.url} /> : m.type === 'audio' ? <audio controls preload="metadata" className="w-full" src={m.url} /> : <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-full rounded-lg h-10 px-4 text-sm font-medium border border-[var(--proto-border)] text-[var(--proto-text)] hover:border-[var(--proto-active)]/30 transition-colors">Открыть</a>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <h1 className="font-serif font-semibold text-xl text-[var(--proto-text)]">{pub.title || 'Без названия'}</h1>
                {publicationDescription ? <p className="text-base text-[var(--proto-text)] leading-relaxed">{publicationDescription}</p> : null}
              </>
            );
          })()}

          {demo && emotions.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[var(--proto-text)] mb-2">Эмоции</p>
              <div className="flex flex-wrap gap-2">
                {emotions.map((e) => (
                  <span key={e} className="px-3 py-1.5 rounded-full bg-[#DDE7DB] text-[#2E3A2F] text-xs font-medium border border-[#D1DBCF]">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}

          {isAuthor && (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="flex-1 min-w-[120px] rounded-2xl h-11 border-2 bg-white" onClick={openEdit}>
                Редактировать
              </Button>
              <Button type="button" variant="outline" className="flex-1 min-w-[120px] rounded-2xl h-11 border-2 border-red-300 text-red-700 bg-white hover:bg-red-50" onClick={() => setDeleteOpen(true)}>
                Удалить
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleLike}
              disabled={isTogglingLike}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--proto-card)] border border-[var(--proto-border)] text-sm text-[var(--proto-text)] hover:border-[var(--proto-active)]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Лайк"
            >
              <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
              {likesCountUi}
            </button>
            <button
              type="button"
              onClick={() => setMilestone(toggleMilestone(pub.id))}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                milestone ? 'bg-[#E5D2B8] text-[#5D4B34] border-[#DCC7AA]' : 'bg-[var(--proto-card)] text-[var(--proto-text)] border-[var(--proto-border)] hover:border-[var(--proto-active)]/30'
              }`}
              aria-label="Важное событие"
            >
              <Star className="h-4 w-4" fill={milestone ? 'currentColor' : 'none'} />
              Важное
            </button>
            <span className="text-sm text-[var(--proto-text-muted)]">
              {(pub.comments ?? []).length} комментариев
            </span>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--proto-text)] mb-2">{demo ? 'AI‑теги' : 'Теги:'}</p>
            <div className="flex flex-wrap gap-2">
              {aiTags.map(tag => (
                <span key={tag} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${demo ? 'bg-[#E5D2B8] text-[#5D4B34] border-[#DCC7AA]' : 'bg-[var(--proto-card)] text-[var(--proto-text-muted)] border-[var(--proto-border)]'}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {participants.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[var(--proto-text)] mb-2">{demo ? 'На фото' : 'Участники:'}</p>
              <div className="flex flex-wrap gap-2">
                {participants.map((p) => {
                  const pid = p!.id;
                  const avSrc = (p as { avatar?: string }).avatar ?? (useAvatarFallback() ? getPrototypeAvatar(pid, currentUserId).src : '');
                  const nm = memberDisplayName(p);
                  return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => navigate(ROUTES.classic.profile(pid))}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--proto-card)] text-[var(--proto-text-muted)] text-xs font-medium border border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 transition-colors"
                  >
                    <span className="h-6 w-6 rounded-full overflow-hidden bg-[var(--proto-bg)] shrink-0">
                      {avSrc ? (
                        <img
                          src={avSrc}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="h-full w-full flex items-center justify-center bg-[#E5E1DC] text-[#6B6560] font-semibold text-[10px]">
                          {initialsOf(nm)}
                        </span>
                      )}
                    </span>
                    {nm}
                  </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-[var(--proto-text)] mb-2">Комментарии:</p>
            <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-4 min-h-[72px]">
              {comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((c) => {
                    const cid = (c as { id: string }).id;
                    const authorId = (c as { authorId?: string; author_id?: string }).authorId ?? (c as { author_id?: string }).author_id;
                    const createdAt = (c as { createdAt?: string; created_at?: string }).createdAt ?? (c as { created_at?: string }).created_at ?? '';
                    const author = authorId ? (memberMap.get(authorId) ?? getMember(authorId)) : null;
                    const timeAgo = createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ru }) : null;
                    const avatarSrc = authorId && (memberMap.get(authorId) as { avatar?: string } | undefined)?.avatar
                      ? (memberMap.get(authorId) as { avatar: string }).avatar
                      : (authorId ? (useAvatarFallback() ? getPrototypeAvatar(authorId, currentUserId).src : '') : '');
                    const commentLikes = c.likes ?? [];
                    const isCommentLiked = myMemberId ? commentLikes.includes(myMemberId) : false;
                    return (
                      <div key={cid} className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => authorId && navigate(ROUTES.classic.profile(authorId))}
                          className="h-9 w-9 rounded-full overflow-hidden bg-[var(--proto-bg)] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="h-full w-full flex items-center justify-center bg-[#E5E1DC] text-[#6B6560] font-semibold text-xs">
                              {initialsOf(memberDisplayName(author))}
                            </span>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--proto-text)]">
                            {memberDisplayName(author ?? null)}
                            {timeAgo && <span className="text-[var(--proto-text-muted)] font-normal ml-1">· {timeAgo}</span>}
                          </p>
                          <p className="text-sm text-[var(--proto-text)] mt-0.5 leading-relaxed">{c.text}</p>
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => toggleCommentLike(cid)}
                              disabled={!myMemberId}
                              className="inline-flex items-center gap-1 text-xs text-[var(--proto-text-muted)] hover:text-[var(--proto-text)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label="Лайк комментария"
                            >
                              <Heart className="h-3.5 w-3.5" fill={isCommentLiked ? 'currentColor' : 'none'} />
                              {commentLikes.length}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[var(--proto-text-muted)]">Пока нет комментариев</p>
              )}
              <div className="mt-3 pt-3 border-t border-[var(--proto-border)]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitComment();
                  }}
                  className="flex gap-2"
                >
                  <input
                    ref={commentInputRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Оставить комментарий…"
                    className="flex-1 rounded-lg bg-[var(--proto-bg)] border border-[var(--proto-border)] h-10 px-3 text-sm text-[var(--proto-text)] placeholder:text-[var(--proto-text-muted)] focus:outline-none focus:border-[var(--proto-active)]/50"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="rounded-lg h-10 px-4 text-sm font-medium border border-[var(--proto-border)] text-[var(--proto-text)] hover:border-[var(--proto-active)]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Отправить
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[var(--proto-bg)] border-[var(--proto-border)] rounded-3xl w-[min(92vw,28rem)] max-w-[calc(100vw-2rem)] p-0 flex flex-col max-h-[calc(100dvh-2rem)]">
          <DialogHeader className="text-center shrink-0 p-6 pb-2">
            <DialogTitle className="font-serif text-2xl text-[var(--proto-text)]">Редактировать</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 pb-4 space-y-3">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="rounded-xl border-2 border-[var(--proto-border)] bg-white text-[var(--proto-text)]"
              placeholder="Название"
            />
            <div className="flex gap-2">
              <Input
                type="date"
                value={editEventDate}
                onChange={(e) => setEditEventDate(e.target.value)}
                className="rounded-xl border-2 border-[var(--proto-border)] bg-white text-[var(--proto-text)] text-sm"
              />
              <label className="flex items-center gap-2 text-xs text-[var(--proto-text)]">
                <input
                  type="checkbox"
                  checked={editApproximate}
                  onChange={(e) => setEditApproximate(e.target.checked)}
                />
                Дата примерная
              </label>
            </div>
            <Input
              value={editPlace}
              onChange={(e) => setEditPlace(e.target.value)}
              className="rounded-xl border-2 border-[var(--proto-border)] bg-white text-[var(--proto-text)]"
              placeholder="Место"
            />
            <Input
              value={editTopicTag}
              onChange={(e) => setEditTopicTag(e.target.value)}
              className="rounded-xl border-2 border-[var(--proto-border)] bg-white text-[var(--proto-text)]"
              placeholder="Тема / тег"
            />
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="rounded-xl border-2 border-[var(--proto-border)] bg-white text-[var(--proto-text)] min-h-[160px]"
              placeholder="Текст публикации"
            />
            <div className="rounded-xl border-2 border-[var(--proto-border)] bg-white p-3 overflow-hidden">
              <p className="text-xs font-semibold text-[var(--proto-text)]">Вложения</p>
              <div className="mt-2 space-y-2 max-h-52 overflow-auto overflow-x-hidden pr-1">
                {editMedia.length ? (
                  editMedia.map((m) => {
                    const preview = m.type === 'photo' ? m.url : m.type === 'video' ? (m.thumbnail || m.url) : '';
                    const isRemoved = m.action === 'remove';
                    const isReplace = m.action === 'replace';
                    const accept = m.type === 'photo' ? 'image/*' : m.type === 'video' ? 'video/*' : m.type === 'audio' ? 'audio/*' : '*/*';
                    return (
                      <div key={m.id} className={`flex gap-2 rounded-lg border border-[var(--proto-border)] p-2 min-w-0 ${isRemoved ? 'opacity-60' : ''}`}>
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-[var(--proto-border)] shrink-0 flex items-center justify-center">
                          {preview ? (
                            <img src={preview} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-semibold text-[var(--proto-text-muted)] uppercase">{m.type}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="text-sm text-[var(--proto-text)] truncate">{m.name || 'Файл'}</p>
                          <p className="text-[11px] text-[var(--proto-text-muted)] truncate">
                            {isRemoved ? 'Будет удалено' : isReplace ? `Заменить: ${m.replaceFile?.name || 'выберите файл'}` : 'Без изменений'}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="h-8 min-w-[4.5rem] px-3 rounded-lg text-xs font-medium border border-[var(--proto-border)] text-[var(--proto-text)] hover:border-[var(--proto-active)]/30 transition-colors shrink-0"
                              onClick={() => setEditMedia(prev => prev.map(x => x.id === m.id ? { ...x, action: x.action === 'remove' ? 'keep' : 'remove', replaceFile: undefined } : x))}
                            >
                              {isRemoved ? 'Отменить удаление' : 'Удалить'}
                            </button>
                            <label className="h-8 min-w-[4.5rem] px-3 rounded-lg text-xs font-medium border border-[var(--proto-border)] text-[var(--proto-text)] hover:border-[var(--proto-active)]/30 transition-colors inline-flex items-center justify-center cursor-pointer shrink-0">
                              Заменить
                              <input
                                type="file"
                                accept={accept}
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;
                                  setEditMedia(prev => prev.map(x => x.id === m.id ? { ...x, action: 'replace', replaceFile: f } : x));
                                }}
                              />
                            </label>
                            {isReplace && (
                              <button
                                type="button"
                                className="h-8 min-w-[4.5rem] px-3 rounded-lg text-xs font-medium border border-[var(--proto-border)] text-[var(--proto-text)] hover:border-[var(--proto-active)]/30 transition-colors shrink-0"
                                onClick={() => setEditMedia(prev => prev.map(x => x.id === m.id ? { ...x, action: 'keep', replaceFile: undefined } : x))}
                              >
                                Отменить замену
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[var(--proto-text-muted)]">Нет вложений</p>
                )}
              </div>
              <div className="mt-3">
                <label className="inline-flex items-center justify-center w-full rounded-lg h-10 px-4 text-sm font-medium border border-[var(--proto-border)] text-[var(--proto-text)] hover:border-[var(--proto-active)]/30 transition-colors cursor-pointer">
                  Добавить фото/видео
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (!files.length) return;
                      setEditNewFiles(prev => [...prev, ...files]);
                      e.currentTarget.value = '';
                    }}
                  />
                </label>
                {editNewFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {editNewFiles.map((f, i) => (
                      <div key={`${f.name}_${i}`} className="flex items-center gap-2">
                        <p className="text-xs text-[var(--proto-text)] truncate flex-1">{f.name}</p>
                        <button
                          type="button"
                          className="text-xs text-[var(--proto-text-muted)] hover:text-[var(--proto-text)]"
                          onClick={() => setEditNewFiles(prev => prev.filter((_, idx) => idx !== i))}
                        >
                          Удалить
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0 p-6 pt-4 border-t border-[var(--proto-border)]">
            <Button
              type="button"
              className="w-full rounded-2xl h-12 bg-[var(--proto-active)] hover:opacity-90 text-white font-semibold disabled:opacity-50"
              onClick={saveEdit}
              disabled={isSaving}
            >
              {isSaving ? 'Сохраняю…' : 'Сохранить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-[var(--proto-bg)] border-[var(--proto-border)] rounded-3xl w-[92vw] max-w-md p-6">
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="font-serif text-2xl text-[var(--proto-text)]">Удалить публикацию?</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-3">
            <p className="text-sm text-[var(--proto-text-muted)] text-center">Это действие нельзя отменить.</p>
            <Button
              type="button"
              className="w-full rounded-2xl h-12 bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50"
              onClick={doDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Удаляю…' : 'Удалить'}
            </Button>
            <Button type="button" variant="outline" className="w-full rounded-2xl h-12 border-2 bg-white" onClick={() => setDeleteOpen(false)}>
              Отмена
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default PublicationDetails;
