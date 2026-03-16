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
import { Heart, MoreVertical } from 'lucide-react';
import type { FamilyMember, Publication } from '@/types';
import { toast } from '@/hooks/use-toast';
import { isDemoMode } from '@/lib/demoMode';
import { ApiError } from '@/integrations/request';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const authorIdOf = (p: Publication) => (p as { authorId?: string; author_id?: string }).authorId ?? (p as { author_id?: string }).author_id;
const participantIdsOf = (p: Publication) => (p as { participantIds?: string[]; participant_ids?: string[] }).participantIds ?? (p as { participant_ids?: string[] }).participant_ids ?? [];
const memberDisplayName = (m: { firstName?: string; first_name?: string; lastName?: string; last_name?: string; nickname?: string } | null) =>
  m ? ((m as { nickname?: string }).nickname || `${(m as { firstName?: string }).firstName ?? (m as { first_name?: string }).first_name} ${(m as { lastName?: string }).lastName ?? (m as { last_name?: string }).last_name}`.trim() || 'Автор') : 'Автор';

const PublicationDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const platform = usePlatform();
  const [pub, setPub] = useState<Publication | null | undefined>(undefined);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentInputRef = useRef<HTMLInputElement | null>(null);
  const myMemberIdRef = useRef<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const memberMap = useMemo(() => new Map(members.map(m => [m.id, m])), [members]);

  const ensureMyMemberId = async () => {
    if (myMemberId) return myMemberId;
    try {
      const me = await api.profile.getMyProfile();
      setMyMemberId(me.id);
      myMemberIdRef.current = me.id;
      return me.id;
    } catch {
      return null;
    }
  };

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
    myMemberIdRef.current = myMemberId;
  }, [myMemberId]);

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
  const authorAvatarSrc = author && (author as { avatar?: string }).avatar
    ? (author as { avatar: string }).avatar
    : getPrototypeAvatar(aid, currentUserId).src;
  const coverSrc = photos[0]?.url || otherMedia.find(m => m.thumbnail)?.thumbnail;
  const mainPhoto = coverSrc
    ? { src: coverSrc, objectPosition: 'center center' as const }
    : getPrototypePublicationPhotoByTopic(pub.topicTag);
  const pids = participantIdsOf(pub).slice(0, 6);
  const participants = pids.map(pid => memberMap.get(pid) ?? getMember(pid)).filter(Boolean);
  const tags = [pub.topicTag].filter(Boolean);
  const publicationDescription = pub.text || '';
  const publishDateFormatted = format(new Date(pub.publishDate), 'dd MMM, yyyy', { locale: ru });
  const comments = [...(pub.comments ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const effectiveMemberId = myMemberId ?? myMemberIdRef.current;
  const isLiked = effectiveMemberId ? (pub.likes ?? []).includes(effectiveMemberId) : false;
  const isAuthor = !!effectiveMemberId && effectiveMemberId === aid;
  const demo = isDemoMode();
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
    try {
      const mid = await ensureMyMemberId();
      if (!mid) {
        toast({ title: 'Нужно войти, чтобы поставить лайк' });
        return;
      }
      const likedNow = (pub.likes ?? []).includes(mid);
      setPub(prev => {
        if (!prev) return prev;
        const likes = prev.likes ?? [];
        const next = likedNow ? likes.filter(x => x !== mid) : (likes.includes(mid) ? likes : [...likes, mid]);
        return { ...prev, likes: next };
      });
      const updated = likedNow ? await api.feed.removeLike(pub.id) : await api.feed.addLike(pub.id);
      setPub(updated);
      platform.hapticFeedback('light');
    } catch {
      try {
        const fresh = await api.feed.getById(pub.id);
        if (fresh) setPub(fresh);
      } catch {}
      toast({ title: 'Не удалось поставить лайк' });
    } finally {
      setIsTogglingLike(false);
    }
  };

  const openEdit = () => {
    setEditTitle(pub.title ?? '');
    setEditText(pub.text ?? '');
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!pub) return;
    if (isSaving) return;
    setIsSaving(true);
    try {
      const updated = await api.feed.updatePublication(pub.id, {
        title: editTitle.trim() ? editTitle.trim() : null,
        text: editText,
      });
      setPub(updated);
      setEditOpen(false);
      platform.hapticFeedback('light');
    } catch (e) {
      let desc: string | undefined;
      if (e instanceof ApiError) desc = `HTTP ${e.status}: ${e.bodyText.slice(0, 160)}`;
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
              <img
                src={authorAvatarSrc}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--proto-text)] text-sm">{memberDisplayName(author ?? null)}</p>
              <p className="text-xs text-[var(--proto-text-muted)] flex items-center gap-1">
                <span>{publishDateFormatted}</span>
                {pub.place && <><span>·</span><span>{pub.place}</span></>}
              </p>
            </div>
          </button>

          <div className="relative rounded-lg overflow-hidden bg-[var(--proto-card)] border border-[var(--proto-border)] aspect-[4/3] w-full">
            <img
              src={mainPhoto.src}
              alt=""
              className="w-full h-full object-cover"
              style={{ objectPosition: mainPhoto.objectPosition }}
            />
          </div>

          {photos.length > 1 && (
            <div>
              <p className="text-sm font-semibold text-[var(--proto-text)] mb-2">Фото:</p>
              <div className="grid grid-cols-3 gap-2">
                {photos.slice(1, 10).map((m) => (
                  <div key={m.id} className="rounded-lg overflow-hidden bg-[var(--proto-card)] border border-[var(--proto-border)] aspect-square">
                    <img src={m.thumbnail || m.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              {photos.length > 10 && (
                <p className="mt-2 text-xs text-[var(--proto-text-muted)]">Ещё {photos.length - 10} фото</p>
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
                    {m.type === 'video' ? (
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full rounded-lg border border-[var(--proto-border)] bg-black"
                        poster={m.thumbnail || undefined}
                        src={m.url}
                      />
                    ) : m.type === 'audio' ? (
                      <audio controls preload="metadata" className="w-full" src={m.url} />
                    ) : (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center w-full rounded-lg h-10 px-4 text-sm font-medium border border-[var(--proto-border)] text-[var(--proto-text)] hover:border-[var(--proto-active)]/30 transition-colors"
                      >
                        Открыть
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <h1 className="font-serif font-semibold text-xl text-[var(--proto-text)]">{pub.title || 'Без названия'}</h1>
          {publicationDescription ? (
            <p className="text-base text-[var(--proto-text)] leading-relaxed">{publicationDescription}</p>
          ) : null}

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
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1 rounded-2xl h-11 border-2 bg-white" onClick={openEdit}>
                Редактировать
              </Button>
              <Button type="button" variant="outline" className="flex-1 rounded-2xl h-11 border-2 border-red-300 text-red-700 bg-white hover:bg-red-50" onClick={() => setDeleteOpen(true)}>
                Удалить
              </Button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleLike}
              disabled={isTogglingLike}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--proto-card)] border border-[var(--proto-border)] text-sm text-[var(--proto-text)] hover:border-[var(--proto-active)]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Лайк"
            >
              <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
              {(pub.likes ?? []).length}
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
                  const avSrc = (p as { avatar?: string }).avatar ?? getPrototypeAvatar(pid, currentUserId).src;
                  return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => navigate(ROUTES.classic.profile(pid))}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--proto-card)] text-[var(--proto-text-muted)] text-xs font-medium border border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 transition-colors"
                  >
                    <span className="h-6 w-6 rounded-full overflow-hidden bg-[var(--proto-bg)] shrink-0">
                      <img
                        src={avSrc}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </span>
                    {memberDisplayName(p)}
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
                      : (authorId ? getPrototypeAvatar(authorId, currentUserId).src : '');
                    const commentLikes = c.likes ?? [];
                    const isCommentLiked = myMemberId ? commentLikes.includes(myMemberId) : false;
                    return (
                      <div key={cid} className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => authorId && navigate(ROUTES.classic.profile(authorId))}
                          className="h-9 w-9 rounded-full overflow-hidden bg-[var(--proto-bg)] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={avatarSrc}
                            alt=""
                            className="h-full w-full object-cover"
                          />
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
        <DialogContent className="bg-[var(--proto-bg)] border-[var(--proto-border)] rounded-3xl w-[92vw] max-w-md p-6">
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="font-serif text-2xl text-[var(--proto-text)]">Редактировать</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-3">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="rounded-xl border-2 border-[var(--proto-border)] bg-white text-[var(--proto-text)]"
              placeholder="Название"
            />
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="rounded-xl border-2 border-[var(--proto-border)] bg-white text-[var(--proto-text)] min-h-[160px]"
              placeholder="Текст публикации"
            />
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
