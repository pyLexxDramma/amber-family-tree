import React, { useEffect, useState } from 'react';
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
import { MoreVertical } from 'lucide-react';
import type { FamilyMember, Publication } from '@/types';

const authorIdOf = (p: Publication) => (p as { authorId?: string; author_id?: string }).authorId ?? (p as { author_id?: string }).author_id;
const participantIdsOf = (p: Publication) => (p as { participantIds?: string[]; participant_ids?: string[] }).participantIds ?? (p as { participant_ids?: string[] }).participant_ids ?? [];
const memberDisplayName = (m: { firstName?: string; first_name?: string; lastName?: string; last_name?: string; nickname?: string } | null) =>
  m ? ((m as { nickname?: string }).nickname || `${(m as { firstName?: string }).firstName ?? (m as { first_name?: string }).first_name} ${(m as { lastName?: string }).lastName ?? (m as { last_name?: string }).last_name}`.trim() || 'Автор') : 'Автор';

const PublicationDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pub, setPub] = useState<Publication | null | undefined>(undefined);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    if (!id) {
      setPub(null);
      return;
    }
    api.feed.getById(id).then(setPub);
    api.family.listMembers().then(setMembers);
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
  const memberMap = new Map(members.map(m => [m.id, m]));
  const author = memberMap.get(aid) ?? getMember(aid);
  const photos = pub.media.filter(m => m.type === 'photo');
  const authorAvatarSrc = author && (author as { avatar?: string }).avatar
    ? (author as { avatar: string }).avatar
    : getPrototypeAvatar(aid, currentUserId).src;
  const comment = pub.comments[0];
  const commentAuthorId = comment ? ((comment as { authorId?: string; author_id?: string }).authorId ?? (comment as { author_id?: string }).author_id) : null;
  const commentAuthor = commentAuthorId ? (memberMap.get(commentAuthorId) ?? getMember(commentAuthorId)) : null;
  const commentCreated = comment ? ((comment as { createdAt?: string; created_at?: string }).createdAt ?? (comment as { created_at?: string }).created_at) : null;
  const commentTimeAgo = commentCreated ? formatDistanceToNow(new Date(commentCreated), { addSuffix: true, locale: ru }) : null;
  const commentAvatar = commentAuthorId ? (memberMap.get(commentAuthorId) && (memberMap.get(commentAuthorId) as { avatar?: string }).avatar
    ? { src: (memberMap.get(commentAuthorId) as { avatar: string }).avatar, objectPosition: undefined as string | undefined }
    : getPrototypeAvatar(commentAuthorId, currentUserId)) : { src: '', objectPosition: undefined as string | undefined };
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

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)] flex flex-col">
        <TopBar
          title="Публикация"
          onBack={() => navigate(ROUTES.classic.feed)}
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
              {comment ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.classic.profile(commentAuthorId!))}
                    className="h-9 w-9 rounded-full overflow-hidden bg-[var(--proto-bg)] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={commentAvatar.src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--proto-text)]">
                      {memberDisplayName(commentAuthor ?? null)}
                      {commentTimeAgo && <span className="text-[var(--proto-text-muted)] font-normal ml-1">· {commentTimeAgo}</span>}
                    </p>
                    <p className="text-sm text-[var(--proto-text)] mt-0.5 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--proto-text-muted)]">Пока нет комментариев</p>
              )}
              <div className="mt-3 pt-3 border-t border-[var(--proto-border)]">
                <div className="rounded-lg bg-[var(--proto-bg)] border border-[var(--proto-border)] h-10 px-3 flex items-center text-sm text-[var(--proto-text-muted)]">
                  Написать комментарий...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PublicationDetails;
