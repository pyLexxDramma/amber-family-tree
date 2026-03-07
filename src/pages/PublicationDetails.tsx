import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { mockPublications } from '@/data/mock-publications';
import { getMember, currentUserId } from '@/data/mock-members';
import { ROUTES } from '@/constants/routes';
import {
  getPrototypeAvatar,
  getPrototypePublicationPhotoByTopic,
} from '@/lib/prototype-assets';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { MoreVertical } from 'lucide-react';

const PublicationDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pub = mockPublications.find(p => p.id === id);

  if (!pub) {
    return (
      <AppLayout>
        <div className="prototype-screen p-6 text-center text-[var(--proto-text-muted)]">Публикация не найдена</div>
      </AppLayout>
    );
  }

  const author = getMember(pub.authorId);
  const photos = pub.media.filter(m => m.type === 'photo');
  const authorAvatar = getPrototypeAvatar(pub.authorId, currentUserId);
  const comment = pub.comments[0];
  const commentAuthor = comment ? getMember(comment.authorId) : null;
  const commentTimeAgo = comment ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ru }) : null;
  const commentAvatar = comment ? getPrototypeAvatar(comment.authorId, currentUserId) : { src: '', objectPosition: undefined as string | undefined };
  const mainPhoto = getPrototypePublicationPhotoByTopic(pub.topicTag);
  const participants = pub.participantIds.slice(0, 6).map(pid => getMember(pid)).filter(Boolean);
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

        <div className="mx-auto max-w-full px-4 pt-2 pb-6 space-y-4 overflow-auto flex-1 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl">
          <button
            type="button"
            onClick={() => navigate(ROUTES.classic.profile(pub.authorId))}
            className="flex items-center gap-3 w-full text-left"
          >
            <div className="h-10 w-10 rounded-full overflow-hidden bg-[var(--proto-card)] shrink-0">
              <img
                src={authorAvatar.src}
                alt=""
                className="h-full w-full object-cover"
                style={authorAvatar.objectPosition ? { objectPosition: authorAvatar.objectPosition } : undefined}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--proto-text)] text-sm">{author ? `${author.firstName} ${author.lastName}` : 'Андрей Филатов'}</p>
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
                  const av = getPrototypeAvatar(p!.id, currentUserId);
                  return (
                  <button
                    key={p!.id}
                    type="button"
                    onClick={() => navigate(ROUTES.classic.profile(p!.id))}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--proto-card)] text-[var(--proto-text-muted)] text-xs font-medium border border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 transition-colors"
                  >
                    <span className="h-6 w-6 rounded-full overflow-hidden bg-[var(--proto-bg)] shrink-0">
                      <img
                        src={av.src}
                        alt=""
                        className="h-full w-full object-cover"
                        style={av.objectPosition ? { objectPosition: av.objectPosition } : undefined}
                      />
                    </span>
                    {p!.nickname || p!.firstName}
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
                    onClick={() => navigate(ROUTES.classic.profile(comment.authorId))}
                    className="h-9 w-9 rounded-full overflow-hidden bg-[var(--proto-bg)] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={commentAvatar.src}
                      alt=""
                      className="h-full w-full object-cover"
                      style={commentAvatar.objectPosition ? { objectPosition: commentAvatar.objectPosition } : undefined}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--proto-text)]">
                      {commentAuthor?.nickname || commentAuthor?.firstName || 'Папа'}
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
