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
  const authorAvatarSrc = author && (author as { avatar?: string }).avatar
    ? (author as { avatar: string }).avatar
    : getPrototypeAvatar(aid, currentUserId).src;
  const mainPhoto = photos[0]?.url
    ? { src: photos[0].url, objectPosition: 'center center' as const }
    : getPrototypePublicationPhotoByTopic(pub.topicTag);
  const pids = participantIdsOf(pub).slice(0, 6);
  const participants = pids.map(pid => memberMap.get(pid) ?? getMember(pid)).filter(Boolean);
  const tags = [pub.topicTag, 'Тэг 1', 'Тэг 2'].filter(Boolean);
  const PUBLICATION_SCREENSHOT_TEXT = 'Моя бабушка Тамара и дедушка Максим. Фотография сделана в 1932 году. г. Валдай, Новгородская область.';

  const publicationDescription = (pub.title || '').toLowerCase().includes('бабушка') && (pub.title || '').toLowerCase().includes('дедушка')
    ? PUBLICATION_SCREENSHOT_TEXT
    : (pub.text || PUBLICATION_SCREENSHOT_TEXT);
  const publishDateFormatted = format(new Date(pub.publishDate), 'dd MMM, yyyy', { locale: ru });
  const comments = [...(pub.comments ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const isLiked = myMemberId ? (pub.likes ?? []).includes(myMemberId) : false;

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
    } catch {
      toast({ title: 'Не удалось отправить комментарий' });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const toggleLike = async () => {
    if (!pub || !myMemberId) return;
    if (isTogglingLike) return;
    setIsTogglingLike(true);
    try {
      const updated = isLiked ? await api.feed.removeLike(pub.id) : await api.feed.addLike(pub.id);
      setPub(updated);
      platform.hapticFeedback('light');
    } catch {
      toast({ title: 'Не удалось поставить лайк' });
    } finally {
      setIsTogglingLike(false);
    }
  };

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)] flex flex-col">
        <TopBar
          title="Публикация"
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

          <h1 className="font-serif font-semibold text-xl text-[var(--proto-text)]">{pub.title || 'Бабушка Тамара и дедушка'}</h1>
          <p className="text-base text-[var(--proto-text)] leading-relaxed">{publicationDescription}</p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleLike}
              disabled={!myMemberId || isTogglingLike}
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
            <p className="text-sm font-semibold text-[var(--proto-text)] mb-2">Теги:</p>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 rounded-full bg-[var(--proto-card)] text-[var(--proto-text-muted)] text-xs font-medium border border-[var(--proto-border)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {participants.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[var(--proto-text)] mb-2">Участники:</p>
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
    </AppLayout>
  );
};

export default PublicationDetails;
