import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { mockMembers, currentUserId, getMember } from '@/data/mock-members';
import { mockPublications } from '@/data/mock-publications';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { getPrototypeAvatarUrl } from '@/lib/prototype-assets';
import { getFamilyRole } from '@/lib/family-role';
import { ChevronLeft, ChevronRight, MessageCircle, Clock, Image, Users, Send } from 'lucide-react';
import type { FamilyMember } from '@/types';

type TreeTab = 'stories' | 'timeline' | 'media' | 'connections';
type BranchFilter = 'all' | 'paternal' | 'partners';

const FamilyTree: React.FC = () => {
  const navigate = useNavigate();
  const [focusId, setFocusId] = useState(currentUserId);
  const [tab, setTab] = useState<TreeTab>('stories');
  const [branchFilter, setBranchFilter] = useState<BranchFilter>('all');
  const [maternal, setMaternal] = useState(true);
  const [paternal, setPaternal] = useState(true);
  const [byMarriage, setByMarriage] = useState(true);
  const [depth, setDepth] = useState(4);

  const focus = getMember(focusId) || getMember(currentUserId)!;
  const parentIds = focus.relations.filter(r => r.type === 'parent').map(r => r.memberId);
  const spouseId = focus.relations.find(r => r.type === 'spouse')?.memberId;
  const childIds = focus.relations.filter(r => r.type === 'child').map(r => r.memberId);
  const parents = parentIds.map(id => getMember(id)).filter(Boolean) as FamilyMember[];
  const spouse = spouseId ? getMember(spouseId) : null;
  const children = childIds.map(id => getMember(id)).filter(Boolean) as FamilyMember[];
  const siblingIds = mockMembers.filter(m => m.id !== focusId && m.relations.some(r => r.type === 'parent' && parentIds.includes(r.memberId))).map(m => m.id);
  const siblings = siblingIds.map(id => getMember(id)).filter(Boolean) as FamilyMember[];

  const showParents = parents.filter(p => {
    if (branchFilter === 'paternal') return parentIds[0] === p.id;
    if (branchFilter === 'partners') return false;
    return true;
  });
  const showChildren = branchFilter === 'partners' ? [] : children;
  const showSiblings = branchFilter === 'partners' ? [] : siblings;
  const showSpouse = (branchFilter === 'all' || branchFilter === 'partners') && byMarriage ? spouse : null;

  const connectionsList = useMemo(() => {
    const list = mockMembers
      .filter(m => m.id !== focusId)
      .filter(m => Math.abs(m.generation - focus.generation) <= depth)
      .map(m => ({ member: m, role: getFamilyRole(m, focusId) }))
      .filter(({ role }) => {
        if (!maternal && (role === 'Мама' || role === 'Бабушка')) return false;
        if (!paternal && (role === 'Папа' || role === 'Дедушка')) return false;
        if (!byMarriage && (role === 'Супруг' || role === 'Супруга')) return false;
        return true;
      });
    return list.sort((a, b) => a.role.localeCompare(b.role) || a.member.generation - b.member.generation);
  }, [focusId, focus.generation, depth, maternal, paternal, byMarriage]);

  const focusIndex = mockMembers.findIndex(m => m.id === focusId);
  const prevRelative = focusIndex > 0 ? mockMembers[focusIndex - 1] : null;
  const nextRelative = focusIndex >= 0 && focusIndex < mockMembers.length - 1 ? mockMembers[focusIndex + 1] : null;

  const storiesForFocus = useMemo(() =>
    mockPublications.filter(p => p.authorId === focusId || p.participantIds.includes(focusId)).slice(0, 10),
    [focusId]
  );

  const tabs = [
    { id: 'stories' as TreeTab, label: 'Истории', icon: MessageCircle },
    { id: 'timeline' as TreeTab, label: 'Таймлайн', icon: Clock },
    { id: 'media' as TreeTab, label: 'Медиа', icon: Image },
    { id: 'connections' as TreeTab, label: 'Связи', icon: Users },
  ];

  const openProfile = (id: string) => {
    navigate(id === currentUserId ? ROUTES.classic.myProfile : ROUTES.classic.profile(id));
  };

  const branchPills = [
    { id: 'all' as BranchFilter, label: 'Ветки' },
    { id: 'paternal' as BranchFilter, label: 'Отцовская' },
    { id: 'partners' as BranchFilter, label: 'Партнёры' },
  ];

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar
          title="Пользователь → Экран «Дерево»"
          onBack={() => navigate(ROUTES.classic.feed)}
          light
          right={
            <button type="button" onClick={() => navigate(ROUTES.classic.invite)} className="h-10 w-10 rounded-full flex items-center justify-center text-[var(--proto-text)] hover:bg-[var(--proto-border)] transition-colors" aria-label="Поделиться">
              <Send className="h-5 w-5" />
            </button>
          }
        />
        <div className="flex gap-2 px-3 sm:px-4 pb-2 border-b border-[var(--proto-border)]">
          <button
            type="button"
            onClick={() => navigate(ROUTES.classic.tree)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--proto-active)] text-white"
          >
            Дерево
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.classic.timeline)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]"
          >
            Таймлайн
          </button>
        </div>
        <div className="flex gap-2 px-3 sm:px-4 py-3 border-b border-[var(--proto-border)] flex-wrap">
          {branchPills.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => setBranchFilter(p.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                branchFilter === p.id ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-card)] border border-[var(--proto-border)] text-[var(--proto-text)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col lg:flex-row gap-4 p-3 sm:p-4 max-w-6xl mx-auto overflow-x-hidden">
          <aside className="w-full lg:w-56 shrink-0 space-y-4">
            <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-4">
              <p className="text-xs font-semibold text-[var(--proto-text-muted)] uppercase tracking-wider mb-3">Карточка поколения</p>
              <p className="text-sm text-[var(--proto-text)]">{focus.nickname || focus.firstName} — поколение {focus.generation}</p>
              <p className="text-xs text-[var(--proto-text-muted)] mt-1">{focus.birthDate}</p>
            </div>
            <button
              type="button"
              onClick={() => parentIds[0] && setFocusId(parentIds[0])}
              className="w-full rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-3 flex items-center justify-between hover:border-[var(--proto-active)]/40 transition-colors"
            >
              <span className="text-sm font-medium text-[var(--proto-text)]">Родитель</span>
              <ChevronRight className="h-4 w-4 text-[var(--proto-text-muted)]" />
            </button>
            <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-3">
              <p className="text-xs font-semibold text-[var(--proto-text-muted)] mb-2">Фильтры веток</p>
              <div className="flex flex-wrap gap-2">
                {branchPills.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setBranchFilter(p.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${branchFilter === p.id ? 'bg-[var(--proto-active)] text-white' : 'bg-[var(--proto-border)] text-[var(--proto-text)]'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-4 sm:p-6">
              <p className="text-xs font-semibold text-[var(--proto-text-muted)] uppercase tracking-wider mb-4">Фокус на человеке</p>
              {showParents.length > 0 && (
                <div className="flex justify-center gap-4 mb-4">
                  <p className="text-xs text-[var(--proto-text-muted)] self-center">Родители</p>
                  {showParents.map(p => (
                    <button key={p.id} onClick={() => openProfile(p.id)} className="h-14 w-14 rounded-full overflow-hidden border-2 border-[var(--proto-border)] hover:border-[var(--proto-active)] transition-colors">
                      <img src={getPrototypeAvatarUrl(p.id, currentUserId)} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <button onClick={() => openProfile(focus.id)} className="h-20 w-20 rounded-full overflow-hidden border-2 border-[var(--proto-active)] ring-2 ring-[var(--proto-active)]/20 hover:ring-[var(--proto-active)]/40 transition-all">
                    <img src={getPrototypeAvatarUrl(focus.id, currentUserId)} alt="" className="h-full w-full object-cover" />
                  </button>
                  <p className="text-sm font-semibold text-[var(--proto-text)] mt-2">{focus.nickname || focus.firstName} {focus.lastName}</p>
                </div>
                {showSpouse && (
                  <>
                    <div className="h-px w-6 bg-[var(--proto-border)]" />
                    <div className="text-center">
                      <button onClick={() => openProfile(showSpouse.id)} className="h-14 w-14 rounded-full overflow-hidden border-2 border-[var(--proto-border)] hover:border-[var(--proto-active)] transition-colors">
                        <img src={getPrototypeAvatarUrl(showSpouse.id, currentUserId)} alt="" className="h-full w-full object-cover" />
                      </button>
                      <p className="text-xs text-[var(--proto-text-muted)] mt-1">Партнёр</p>
                    </div>
                  </>
                )}
              </div>
              {(showChildren.length > 0 || showSiblings.length > 0) && (
                <div className="flex flex-wrap justify-center gap-6">
                  {showChildren.length > 0 && (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[var(--proto-text-muted)]">Дети</p>
                      {showChildren.map(c => (
                        <button key={c!.id} onClick={() => openProfile(c!.id)} className="h-12 w-12 rounded-full overflow-hidden border-2 border-[var(--proto-border)] hover:border-[var(--proto-active)] transition-colors">
                          <img src={getPrototypeAvatarUrl(c!.id, currentUserId)} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                  {showSiblings.length > 0 && (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[var(--proto-text-muted)]">Братья/сёстры</p>
                      {showSiblings.map(s => (
                        <button key={s!.id} onClick={() => openProfile(s!.id)} className="h-12 w-12 rounded-full overflow-hidden border-2 border-[var(--proto-border)] hover:border-[var(--proto-active)] transition-colors">
                          <img src={getPrototypeAvatarUrl(s!.id, currentUserId)} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex border-b border-[var(--proto-border)] mt-6 gap-4 overflow-x-auto scrollbar-hide">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`pb-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
                      tab === t.id ? 'text-[var(--proto-text)] border-[var(--proto-active)]' : 'text-[var(--proto-text-muted)] border-transparent'
                    }`}
                  >
                    <t.icon className="h-4 w-4" />
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 min-h-[120px]">
                {tab === 'stories' && (
                  <div className="space-y-2">
                    {storiesForFocus.length === 0 ? (
                      <p className="text-sm text-[var(--proto-text-muted)]">Нет историй</p>
                    ) : (
                      storiesForFocus.map(pub => (
                        <button
                          key={pub.id}
                          type="button"
                          onClick={() => navigate(ROUTES.classic.publication(pub.id))}
                          className="w-full text-left px-3 py-2 rounded-lg bg-[var(--proto-bg)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 transition-colors"
                        >
                          <p className="text-sm font-medium text-[var(--proto-text)]">{pub.title || 'Публикация'}</p>
                          <p className="text-xs text-[var(--proto-text-muted)]">{pub.topicTag} · {pub.eventDate}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {tab === 'timeline' && (
                  <div>
                    <p className="text-sm text-[var(--proto-text-muted)] mb-2">События в хронологии</p>
                    <button type="button" onClick={() => navigate(ROUTES.classic.timeline)} className="text-sm font-medium text-[var(--proto-active)] hover:underline">
                      Открыть таймлайн →
                    </button>
                  </div>
                )}
                {tab === 'media' && (
                  <div>
                    <p className="text-sm text-[var(--proto-text-muted)] mb-2">Фото и видео</p>
                    <button type="button" onClick={() => navigate(ROUTES.classic.myMedia)} className="text-sm font-medium text-[var(--proto-active)] hover:underline">
                      Открыть моё медиа →
                    </button>
                  </div>
                )}
                {tab === 'connections' && (
                  <div className="space-y-2 max-h-[280px] overflow-y-auto">
                    {connectionsList.length === 0 ? (
                      <p className="text-sm text-[var(--proto-text-muted)]">Нет связей в выбранных фильтрах</p>
                    ) : (
                      connectionsList.map(({ member, role }) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-[var(--proto-bg)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 transition-colors"
                        >
                          <button type="button" onClick={() => setFocusId(member.id)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                            <div className="h-10 w-10 rounded-full overflow-hidden shrink-0">
                              <img src={getPrototypeAvatarUrl(member.id, currentUserId)} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-[var(--proto-text)] truncate">{member.nickname || member.firstName} {member.lastName}</p>
                              <p className="text-xs text-[var(--proto-text-muted)]">{role}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-[var(--proto-text-muted)] shrink-0" />
                          </button>
                          <button type="button" onClick={() => openProfile(member.id)} className="text-xs font-medium text-[var(--proto-active)] hover:underline shrink-0">Профиль</button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-6 pt-4 border-t border-[var(--proto-border)]">
                <button
                  type="button"
                  onClick={() => prevRelative && setFocusId(prevRelative.id)}
                  disabled={!prevRelative}
                  className="text-sm font-medium text-[var(--proto-text-muted)] hover:text-[var(--proto-text)] disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Предыдущий родственник
                </button>
                <button
                  type="button"
                  onClick={() => nextRelative && setFocusId(nextRelative.id)}
                  disabled={!nextRelative}
                  className="text-sm font-medium text-[var(--proto-text-muted)] hover:text-[var(--proto-text)] disabled:opacity-40 flex items-center gap-1"
                >
                  Следующий родственник <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </main>

          <aside className="w-full lg:w-52 shrink-0 space-y-4">
            <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-4">
              <p className="text-xs font-semibold text-[var(--proto-text-muted)] uppercase tracking-wider mb-3">Фильтры веток и глубины</p>
              <label className="flex items-center gap-2 text-sm text-[var(--proto-text)] mb-2 cursor-pointer">
                <input type="checkbox" checked={maternal} onChange={e => setMaternal(e.target.checked)} className="rounded border-[var(--proto-border)] accent-[var(--proto-active)]" />
                Материнская ветка
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--proto-text)] mb-2 cursor-pointer">
                <input type="checkbox" checked={paternal} onChange={e => setPaternal(e.target.checked)} className="rounded border-[var(--proto-border)] accent-[var(--proto-active)]" />
                Отцовская ветка
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--proto-text)] mb-4 cursor-pointer">
                <input type="checkbox" checked={byMarriage} onChange={e => setByMarriage(e.target.checked)} className="rounded border-[var(--proto-border)] accent-[var(--proto-active)]" />
                По браку
              </label>
              <p className="text-xs text-[var(--proto-text-muted)] mb-1">Глубина поколений</p>
              <input type="range" min={1} max={6} value={depth} onChange={e => setDepth(Number(e.target.value))} className="w-full accent-[var(--proto-active)]" />
              <p className="text-xs text-[var(--proto-text-muted)] mt-1">напр. {depth}</p>
            </div>
            <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-4">
              <p className="text-xs font-semibold text-[var(--proto-text-muted)] uppercase tracking-wider mb-3">AI поверх дерева</p>
              <div className="space-y-2">
                <button type="button" className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[var(--proto-text)] bg-[var(--proto-bg)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 transition-colors">
                  Спросить Angelo о дереве
                </button>
                <button type="button" className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[var(--proto-text)] bg-[var(--proto-bg)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 transition-colors">
                  Найти пропуски
                </button>
                <button type="button" className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[var(--proto-text)] bg-[var(--proto-bg)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 transition-colors">
                  Подсветить важные даты
                </button>
                <button type="button" className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[var(--proto-text)] bg-[var(--proto-bg)] border border-[var(--proto-border)] hover:border-[var(--proto-active)]/40 transition-colors">
                  Показать ветку 1900-х
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
};

export default FamilyTree;
