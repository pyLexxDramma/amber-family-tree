import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MessageCircle, Clock, Image, Users, Send } from 'lucide-react';
import type { FamilyMember } from '@/types';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ROUTES } from '@/constants/routes';
import { api } from '@/integrations/api';
import { isDemoMode, useAvatarFallback } from '@/lib/demoMode';
import { getPrototypeAvatarUrl } from '@/lib/prototype-assets';
import { getFamilyRole } from '@/lib/family-role';

type TreeTab = 'stories' | 'timeline' | 'media' | 'connections';
type BranchFilter = 'all' | 'paternal' | 'partners';

type Rel = { type: string; memberId: string };

function normalizeRelations(relations: unknown): Rel[] {
  if (!Array.isArray(relations)) return [];
  return relations
    .map((r) => {
      if (!r || typeof r !== 'object') return null;
      const type = (r as any).type;
      const memberId = (r as any).memberId ?? (r as any).member_id;
      if (typeof type !== 'string' || typeof memberId !== 'string') return null;
      return { type, memberId };
    })
    .filter(Boolean) as Rel[];
}

function initialsFor(m: FamilyMember): string {
  const a = (m.firstName || '').trim()[0] ?? '';
  const b = (m.lastName || '').trim()[0] ?? '';
  const s = (a + b).toUpperCase();
  return s || 'U';
}

function avatarSrcFor(member: FamilyMember, currentUserId: string): string | undefined {
  if (member.avatar) return member.avatar;
  if (!useAvatarFallback()) return undefined;
  return getPrototypeAvatarUrl(member.id, currentUserId);
}

function roleFor(member: FamilyMember, focusId: string): string {
  const rel = normalizeRelations(member.relations).find(r => r.memberId === focusId);
  if (!rel) return 'Родственник';
  if (rel.type === 'parent') return 'Ребёнок';
  if (rel.type === 'child') return 'Родитель';
  if (rel.type === 'spouse') return 'Партнёр';
  if (rel.type === 'sibling') return 'Брат/сестра';
  return 'Родственник';
}

const FamilyTree: React.FC = () => {
  const navigate = useNavigate();
  const [me, setMe] = useState<FamilyMember | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<TreeTab>('stories');
  const [branchFilter, setBranchFilter] = useState<BranchFilter>('all');
  const [maternal, setMaternal] = useState(true);
  const [paternal, setPaternal] = useState(true);
  const [byMarriage, setByMarriage] = useState(true);
  const [depth, setDepth] = useState(4);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const my = await api.profile.getMyProfile();
        const list = await api.family.listMembers();
        if (cancelled) return;
        setMe(my);
        const uniq = new Map<string, FamilyMember>();
        for (const m of [my, ...list]) uniq.set(m.id, m);
        setMembers(Array.from(uniq.values()));
        setFocusId((prev) => prev ?? my.id);
        setLoadError(null);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'load error';
        setLoadError(msg);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const currentUserId = me?.id ?? '';

  const focus = useMemo(() => {
    if (!members.length) return me;
    const id = focusId ?? me?.id ?? members[0].id;
    return members.find(m => m.id === id) ?? me ?? members[0];
  }, [focusId, me, members]);

  const focusRelations = normalizeRelations(focus?.relations);
  const parentIds = focusRelations.filter(r => r.type === 'parent').map(r => r.memberId);
  const spouseId = focusRelations.find(r => r.type === 'spouse')?.memberId;
  const childIds = focusRelations.filter(r => r.type === 'child').map(r => r.memberId);

  const parents = parentIds.map(id => members.find(m => m.id === id)).filter(Boolean) as FamilyMember[];
  const spouse = spouseId ? members.find(m => m.id === spouseId) ?? null : null;
  const children = childIds.map(id => members.find(m => m.id === id)).filter(Boolean) as FamilyMember[];
  const siblingIds = members
    .filter(m => m.id !== focus?.id)
    .filter(m => normalizeRelations(m.relations).some(r => r.type === 'parent' && parentIds.includes(r.memberId)))
    .map(m => m.id);
  const siblings = siblingIds.map(id => members.find(m => m.id === id)).filter(Boolean) as FamilyMember[];

  const showParents = parents.filter(p => {
    if (branchFilter === 'paternal') return parentIds[0] === p.id;
    if (branchFilter === 'partners') return false;
    return true;
  });
  const showChildren = branchFilter === 'partners' ? [] : children;
  const showSiblings = branchFilter === 'partners' ? [] : siblings;
  const showSpouse = (branchFilter === 'all' || branchFilter === 'partners') && byMarriage ? spouse : null;

  const connectionsList = useMemo(() => {
    if (!focus) return [];
    const list = members
      .filter(m => m.id !== focus.id)
      .filter(m => Math.abs(m.generation - focus.generation) <= depth)
      .map(m => ({ member: m, role: roleFor(m, focus.id) }))
      .filter(({ role }) => {
        if (!maternal && role === 'Родитель') return false;
        if (!paternal && role === 'Родитель') return false;
        if (!byMarriage && role === 'Партнёр') return false;
        return true;
      });
    return list.sort((a, b) => a.role.localeCompare(b.role) || a.member.generation - b.member.generation);
  }, [byMarriage, depth, focus, maternal, members, paternal]);

  const ordered = useMemo(() => {
    return [...members].sort((a, b) => (a.generation - b.generation) || a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));
  }, [members]);

  const focusIndex = ordered.findIndex(m => m.id === focus?.id);
  const prevRelative = focusIndex > 0 ? ordered[focusIndex - 1] : null;
  const nextRelative = focusIndex >= 0 && focusIndex < ordered.length - 1 ? ordered[focusIndex + 1] : null;

  const storiesForFocus = useMemo(() =>
    [],
    [focus?.id]
  );

  const linksWrapRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef(new Map<string, HTMLElement>());
  const setNodeRef = (key: string) => (el: HTMLElement | null) => {
    if (el) nodeRefs.current.set(key, el);
    else nodeRefs.current.delete(key);
  };
  const [linkPaths, setLinkPaths] = useState<string[]>([]);

  const linksKey = useMemo(() => {
    const p = showParents.map(m => m.id).join(',');
    const s = showSiblings.map(m => m.id).join(',');
    const c = showChildren.map(m => m.id).join(',');
    const f = focus?.id ?? '';
    const sp = showSpouse?.id ?? '';
    return `${branchFilter}|${byMarriage ? '1' : '0'}|${f}|${sp}|${p}|${s}|${c}`;
  }, [branchFilter, byMarriage, focus?.id, showChildren, showParents, showSiblings, showSpouse?.id]);

  useLayoutEffect(() => {
    const wrap = linksWrapRef.current;
    if (!wrap) return;

    const calc = () => {
      const wrapRect = wrap.getBoundingClientRect();
      const centerOf = (key: string) => {
        const el = nodeRefs.current.get(key);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left - wrapRect.left + r.width / 2, y: r.top - wrapRect.top + r.height / 2 };
      };

      const parents = showParents.map((p) => centerOf(`parent:${p.id}`)).filter(Boolean) as { x: number; y: number }[];
      const focusC = focus ? centerOf(`focus:${focus.id}`) : null;
      const spouseC = showSpouse ? centerOf(`spouse:${showSpouse.id}`) : null;
      const siblingsC = showSiblings.map((s) => centerOf(`sibling:${s.id}`)).filter(Boolean) as { x: number; y: number }[];
      const childrenC = showChildren.map((c) => centerOf(`child:${c.id}`)).filter(Boolean) as { x: number; y: number }[];

      const paths: string[] = [];

      const line = (a: { x: number; y: number }, b: { x: number; y: number }) => `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
      const poly = (...pts: { x: number; y: number }[]) => {
        if (pts.length < 2) return '';
        return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      };

      const R_PARENT = 28;
      const R_FOCUS = 40;
      const R_SMALL = 24;
      const R_SPOUSE = 28;

      if (focusC && parents.length > 0) {
        const parentBottomY = Math.max(...parents.map(p => p.y + R_PARENT));
        const yBus = parentBottomY + 14;
        for (const p of parents) {
          paths.push(poly(
            { x: p.x, y: p.y + R_PARENT },
            { x: p.x, y: yBus },
            { x: focusC.x, y: yBus },
          ));
        }
        paths.push(line({ x: focusC.x, y: yBus }, { x: focusC.x, y: focusC.y - R_FOCUS }));
      }

      if (focusC && spouseC) {
        const a = { x: focusC.x + R_FOCUS, y: focusC.y };
        const b = { x: spouseC.x - R_SPOUSE, y: spouseC.y };
        if (spouseC.x < focusC.x) {
          paths.push(line({ x: focusC.x - R_FOCUS, y: focusC.y }, { x: spouseC.x + R_SPOUSE, y: spouseC.y }));
        } else {
          paths.push(line(a, b));
        }
      }

      if (focusC && (siblingsC.length > 0 || childrenC.length > 0)) {
        const focusBottom = { x: focusC.x, y: focusC.y + R_FOCUS };
        const yJ = focusBottom.y + 14;
        paths.push(line(focusBottom, { x: focusC.x, y: yJ }));

        if (siblingsC.length > 0) {
          const yBus = yJ + 24;
          paths.push(line({ x: focusC.x, y: yJ }, { x: focusC.x, y: yBus }));
          for (const s of siblingsC) {
            paths.push(poly(
              { x: focusC.x, y: yBus },
              { x: s.x, y: yBus },
              { x: s.x, y: s.y - R_SMALL },
            ));
          }
        }

        if (childrenC.length > 0) {
          const yBus = yJ + (siblingsC.length > 0 ? 54 : 28);
          paths.push(line({ x: focusC.x, y: yJ }, { x: focusC.x, y: yBus }));
          for (const c of childrenC) {
            paths.push(poly(
              { x: focusC.x, y: yBus },
              { x: c.x, y: yBus },
              { x: c.x, y: c.y - R_SMALL },
            ));
          }
        }
      }

      setLinkPaths((prev) => {
        if (prev.length !== paths.length) return paths;
        for (let i = 0; i < prev.length; i += 1) {
          if (prev[i] !== paths[i]) return paths;
        }
        return prev;
      });
    };

    calc();

    const ro = new ResizeObserver(() => calc());
    ro.observe(wrap);
    window.addEventListener('resize', calc);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', calc);
    };
  }, [linksKey]);

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

  if (isDemoMode()) {
    const byGen = new Map<number, FamilyMember[]>();
    for (const m of members) {
      if (!byGen.has(m.generation)) byGen.set(m.generation, []);
      byGen.get(m.generation)!.push(m);
    }
    const gen1 = (byGen.get(1) ?? []).sort((a, b) => a.firstName.localeCompare(b.firstName));
    const gen2 = (byGen.get(2) ?? []).sort((a, b) => a.firstName.localeCompare(b.firstName));
    const gen3 = (byGen.get(3) ?? []).sort((a, b) => a.firstName.localeCompare(b.firstName));

    const card = (m: FamilyMember) => (
      <button
        key={m.id}
        type="button"
        onClick={() => openProfile(m.id)}
        className="w-full rounded-2xl bg-white border border-[var(--proto-border)] p-4 text-center hover:border-[var(--proto-active)]/40 transition-colors"
      >
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[var(--proto-border)] overflow-hidden flex items-center justify-center">
          {avatarSrcFor(m, currentUserId) ? (
            <img src={avatarSrcFor(m, currentUserId)} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-[var(--proto-text)]">{initialsFor(m)}</span>
          )}
        </div>
        <p className="mt-3 text-sm font-semibold text-[var(--proto-text)] leading-tight">
          {m.firstName} {m.lastName}
        </p>
        <p className="text-xs font-semibold text-[#A39B8A]">{focusId ? getFamilyRole(m, focusId) : (m.nickname || 'Член семьи')}</p>
        {m.birthDate ? <p className="text-xs text-[var(--proto-text-muted)] mt-1">{m.birthDate}</p> : null}
      </button>
    );

    return (
      <AppLayout>
        <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
          <div className="mx-auto max-w-full px-4 pt-8 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
            <h1 className="text-2xl font-semibold text-[var(--proto-text)] mb-6">Семейное древо</h1>

            {loadError ? (
              <p className="text-sm text-red-600">Ошибка: {loadError}</p>
            ) : null}

            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-[var(--proto-text-muted)] text-center mb-3">Бабушка и дедушка</p>
                <div className="grid grid-cols-2 gap-3">
                  {gen1.map(card)}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[var(--proto-text-muted)] text-center mb-3">Родители</p>
                <div className="grid grid-cols-2 gap-3">
                  {gen2.map(card)}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[var(--proto-text-muted)] text-center mb-3">Дети</p>
                <div className="grid grid-cols-2 gap-3">
                  {gen3.length ? gen3.map(card) : <p className="col-span-2 text-sm text-[var(--proto-text-muted)] text-center py-8">Нет данных</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar
          title="Дерево"
          subtitle={me ? `Вы вошли как: ${me.nickname || me.firstName} ${me.lastName}` : undefined}
          onBack={() => navigate(-1)}
          light
          right={
            <div className="flex items-center gap-2">
              {me && (
                <button type="button" onClick={() => navigate(ROUTES.classic.myProfile)} className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-[var(--proto-border)] transition-colors">
                  <Avatar className="h-8 w-8">
                    {avatarSrcFor(me, currentUserId) ? <AvatarImage src={avatarSrcFor(me, currentUserId)} /> : null}
                    <AvatarFallback className="bg-[var(--proto-border)] text-[var(--proto-text)] text-xs font-semibold">{initialsFor(me)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-[var(--proto-text)]">Я</span>
                </button>
              )}
              <button type="button" onClick={() => navigate(ROUTES.classic.invite)} className="h-10 w-10 rounded-full flex items-center justify-center text-[var(--proto-text)] hover:bg-[var(--proto-border)] transition-colors" aria-label="Поделиться">
                <Send className="h-5 w-5" />
              </button>
            </div>
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
              {loadError && <p className="text-sm text-red-600">Ошибка: {loadError}</p>}
              {!focus && !loadError && <p className="text-sm text-[var(--proto-text-muted)]">Загрузка…</p>}
              {focus && (
                <>
                  <p className="text-sm text-[var(--proto-text)]">{focus.nickname || focus.firstName} — поколение {focus.generation}</p>
                  <p className="text-xs text-[var(--proto-text-muted)] mt-1">{focus.birthDate}</p>
                </>
              )}
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
              <div ref={linksWrapRef} className="relative">
                <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                  {linkPaths.map((d, idx) => (
                    <path
                      key={idx}
                      d={d}
                      fill="none"
                      stroke="rgba(90, 160, 120, 0.45)"
                      strokeWidth={1.25}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </svg>

                {showParents.length > 0 && (
                  <div className="flex justify-center gap-4 mb-4">
                    <p className="text-xs text-[var(--proto-text-muted)] self-center">Родители</p>
                    {showParents.map(p => (
                      <button
                        key={p.id}
                        ref={(el) => setNodeRef(`parent:${p.id}`)(el)}
                        onClick={() => openProfile(p.id)}
                        className="rounded-full border-2 border-[var(--proto-border)] hover:border-[var(--proto-active)] transition-colors"
                      >
                        <Avatar className="h-14 w-14">
                          {avatarSrcFor(p, currentUserId) ? <AvatarImage src={avatarSrcFor(p, currentUserId)} /> : null}
                          <AvatarFallback className="bg-[var(--proto-border)] text-[var(--proto-text)] text-sm font-semibold">{initialsFor(p)}</AvatarFallback>
                        </Avatar>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    {focus && (
                      <>
                        <button
                          ref={(el) => setNodeRef(`focus:${focus.id}`)(el)}
                          onClick={() => openProfile(focus.id)}
                          className="rounded-full border-2 border-[var(--proto-active)] ring-2 ring-[var(--proto-active)]/20 hover:ring-[var(--proto-active)]/40 transition-all"
                        >
                          <Avatar className="h-20 w-20">
                            {avatarSrcFor(focus, currentUserId) ? <AvatarImage src={avatarSrcFor(focus, currentUserId)} /> : null}
                            <AvatarFallback className="bg-[var(--proto-border)] text-[var(--proto-text)] text-lg font-semibold">{initialsFor(focus)}</AvatarFallback>
                          </Avatar>
                        </button>
                        <p className="text-sm font-semibold text-[var(--proto-text)] mt-2">{focus.nickname || focus.firstName} {focus.lastName}</p>
                      </>
                    )}
                  </div>
                  {showSpouse && (
                    <>
                      <div className="h-px w-6 bg-[var(--proto-border)]" />
                      <div className="text-center">
                        <button
                          ref={(el) => setNodeRef(`spouse:${showSpouse.id}`)(el)}
                          onClick={() => openProfile(showSpouse.id)}
                          className="rounded-full border-2 border-[var(--proto-border)] hover:border-[var(--proto-active)] transition-colors"
                        >
                          <Avatar className="h-14 w-14">
                            {avatarSrcFor(showSpouse, currentUserId) ? <AvatarImage src={avatarSrcFor(showSpouse, currentUserId)} /> : null}
                            <AvatarFallback className="bg-[var(--proto-border)] text-[var(--proto-text)] text-sm font-semibold">{initialsFor(showSpouse)}</AvatarFallback>
                          </Avatar>
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
                          <button
                            key={c!.id}
                            ref={(el) => setNodeRef(`child:${c!.id}`)(el)}
                            onClick={() => openProfile(c!.id)}
                            className="rounded-full border-2 border-[var(--proto-border)] hover:border-[var(--proto-active)] transition-colors"
                          >
                            <Avatar className="h-12 w-12">
                              {avatarSrcFor(c!, currentUserId) ? <AvatarImage src={avatarSrcFor(c!, currentUserId)} /> : null}
                              <AvatarFallback className="bg-[var(--proto-border)] text-[var(--proto-text)] text-xs font-semibold">{initialsFor(c!)}</AvatarFallback>
                            </Avatar>
                          </button>
                        ))}
                      </div>
                    )}
                    {showSiblings.length > 0 && (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-[var(--proto-text-muted)]">Братья/сёстры</p>
                        {showSiblings.map(s => (
                          <button
                            key={s!.id}
                            ref={(el) => setNodeRef(`sibling:${s!.id}`)(el)}
                            onClick={() => openProfile(s!.id)}
                            className="rounded-full border-2 border-[var(--proto-border)] hover:border-[var(--proto-active)] transition-colors"
                          >
                            <Avatar className="h-12 w-12">
                              {avatarSrcFor(s!, currentUserId) ? <AvatarImage src={avatarSrcFor(s!, currentUserId)} /> : null}
                              <AvatarFallback className="bg-[var(--proto-border)] text-[var(--proto-text)] text-xs font-semibold">{initialsFor(s!)}</AvatarFallback>
                            </Avatar>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex border-b border-[var(--proto-border)] mt-6 gap-4 overflow-x-auto scrollbar-hide">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      if (t.id === 'timeline') {
                        navigate(ROUTES.classic.timeline);
                        return;
                      }
                      if (t.id === 'media') {
                        navigate(ROUTES.classic.myMedia);
                        return;
                      }
                      setTab(t.id);
                    }}
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
                    <p className="text-sm text-[var(--proto-text-muted)]">Истории отображаются в ленте. Нажмите «Создать», чтобы добавить новую.</p>
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
                            <Avatar className="h-10 w-10 shrink-0">
                              {avatarSrcFor(member, currentUserId) ? <AvatarImage src={avatarSrcFor(member, currentUserId)} /> : null}
                              <AvatarFallback className="bg-[var(--proto-border)] text-[var(--proto-text)] text-xs font-semibold">{initialsFor(member)}</AvatarFallback>
                            </Avatar>
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
