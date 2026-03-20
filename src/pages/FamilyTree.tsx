import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Send } from 'lucide-react';
import type { FamilyMember } from '@/types';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ROUTES } from '@/constants/routes';
import { api } from '@/integrations/api';
import { isDemoMode, useAvatarFallback } from '@/lib/demoMode';
import { getPrototypeAvatarUrl } from '@/lib/prototype-assets';
import { toast } from '@/hooks/use-toast';

type Rel = { type: string; memberId: string };
type RelationKind = 'parent' | 'child' | 'sibling' | 'spouse';
type SelectMode = 'empty-parent' | 'add-relation';

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

function hasDeathDate(m: { deathDate?: string; death_date?: string }): boolean {
  return !!((m.deathDate ?? m.death_date ?? '').trim());
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

function fullName(member: FamilyMember): string {
  const base = `${member.firstName} ${member.lastName}`.trim();
  return member.nickname?.trim() || base || 'Без имени';
}

function reciprocal(kind: RelationKind): RelationKind {
  if (kind === 'parent') return 'child';
  if (kind === 'child') return 'parent';
  return kind;
}

const FamilyTree: React.FC = () => {
  const navigate = useNavigate();
  const [me, setMe] = useState<FamilyMember | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [depth, setDepth] = useState(2);
  const [zoom, setZoom] = useState(100);
  const [treeMode, setTreeMode] = useState<'ancestors' | 'all'>('ancestors');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState<SelectMode | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [pendingKind, setPendingKind] = useState<RelationKind>('parent');

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
  const showParents = parents.slice(0, 2);
  const showChildren = children;
  const showSiblings = siblings;
  const showSpouse = spouse;

  const grandparentSlots = useMemo(() => {
    const slots: Array<{ key: string; member: FamilyMember | null; label: string; parentIndex: number }> = [];
    for (let i = 0; i < 2; i += 1) {
      const parent = showParents[i];
      const parentRels = parent ? normalizeRelations(parent.relations) : [];
      const gpIds = parentRels.filter(r => r.type === 'parent').map(r => r.memberId);
      const gp1 = gpIds[0] ? members.find(m => m.id === gpIds[0]) ?? null : null;
      const gp2 = gpIds[1] ? members.find(m => m.id === gpIds[1]) ?? null : null;
      const labels = ['Дедушка', 'Бабушка'];
      slots.push({ key: `gp-${i}-0`, member: gp1, label: labels[0], parentIndex: i });
      slots.push({ key: `gp-${i}-1`, member: gp2, label: labels[1], parentIndex: i });
    }
    return slots;
  }, [showParents, members]);

  const connectionsList = useMemo(() => {
    if (!focus) return [];
    const list = members
      .filter(m => m.id !== focus.id)
      .filter(m => Math.abs(m.generation - focus.generation) <= depth)
      .map(m => ({ member: m, role: roleFor(m, focus.id) }));
    return list.sort((a, b) => a.role.localeCompare(b.role) || a.member.generation - b.member.generation);
  }, [depth, focus, members]);

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
    const g = grandparentSlots.map(s => s.member?.id ?? 'e').join(',');
    const f = focus?.id ?? '';
    const sp = showSpouse?.id ?? '';
    return `${treeMode}|${f}|${sp}|${p}|${s}|${c}|${g}|${zoom}`;
  }, [treeMode, focus?.id, showChildren, showParents, showSiblings, showSpouse?.id, grandparentSlots, zoom]);

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

      const parentsC = showParents.map((p) => centerOf(`parent:${p.id}`)).filter(Boolean) as { x: number; y: number }[];
      const focusC = focus ? centerOf(`focus:${focus.id}`) : null;
      const spouseC = showSpouse ? centerOf(`spouse:${showSpouse.id}`) : null;
      const siblingsC = showSiblings.map((s) => centerOf(`sibling:${s.id}`)).filter(Boolean) as { x: number; y: number }[];
      const childrenC = showChildren.map((c) => centerOf(`child:${c.id}`)).filter(Boolean) as { x: number; y: number }[];
      const grandparentsC = grandparentSlots.map((s) => centerOf(`grandparent:${s.key}`)).filter(Boolean) as { x: number; y: number }[];

      const paths: string[] = [];

      const line = (a: { x: number; y: number }, b: { x: number; y: number }) => `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
      const poly = (...pts: { x: number; y: number }[]) => {
        if (pts.length < 2) return '';
        return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      };

      const R_PARENT = 30;
      const R_FOCUS = 30;
      const R_SMALL = 24;
      const R_SPOUSE = 30;

      if (treeMode === 'ancestors' && focusC && grandparentsC.length >= 4 && parentsC.length >= 1) {
        const gp0 = grandparentsC[0];
        const gp1 = grandparentsC[1];
        const gp2 = grandparentsC[2];
        const gp3 = grandparentsC[3];
        const p0 = parentsC[0];
        const p1 = parentsC[1];
        const yBusP = p1 ? (p0.y + p1.y) / 2 + R_PARENT : p0.y + R_PARENT + 14;
        const yBusGp0 = Math.min(gp0.y, gp1.y) + R_SMALL + 14;
        const yBusGp1 = p1 ? Math.min(gp2.y, gp3.y) + R_SMALL + 14 : yBusGp0;
        paths.push(poly({ x: gp0.x, y: gp0.y + R_SMALL }, { x: gp0.x, y: yBusGp0 }, { x: p0.x, y: yBusGp0 }, { x: p0.x, y: p0.y + R_PARENT }));
        paths.push(poly({ x: gp1.x, y: gp1.y + R_SMALL }, { x: gp1.x, y: yBusGp0 }, { x: p0.x, y: yBusGp0 }, { x: p0.x, y: p0.y + R_PARENT }));
        if (p1) {
          paths.push(poly({ x: gp2.x, y: gp2.y + R_SMALL }, { x: gp2.x, y: yBusGp1 }, { x: p1.x, y: yBusGp1 }, { x: p1.x, y: p1.y + R_PARENT }));
          paths.push(poly({ x: gp3.x, y: gp3.y + R_SMALL }, { x: gp3.x, y: yBusGp1 }, { x: p1.x, y: yBusGp1 }, { x: p1.x, y: p1.y + R_PARENT }));
          paths.push(poly({ x: p1.x, y: p1.y + R_PARENT }, { x: p1.x, y: yBusP }, { x: focusC.x, y: yBusP }, { x: focusC.x, y: focusC.y - R_FOCUS }));
        }
        paths.push(poly({ x: p0.x, y: p0.y + R_PARENT }, { x: p0.x, y: yBusP }, { x: focusC.x, y: yBusP }, { x: focusC.x, y: focusC.y - R_FOCUS }));
      } else if (focusC && parentsC.length > 0) {
        const parentBottomY = Math.max(...parentsC.map(p => p.y + R_PARENT));
        const yBus = parentBottomY + 14;
        for (const p of parentsC) {
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

  const openProfile = (id: string) => {
    navigate(id === currentUserId ? ROUTES.classic.myProfile : ROUTES.classic.profile(id));
  };

  const upsertRelation = (memberId: string, relation: Rel): FamilyMember[] => members.map((m) => {
    if (m.id !== memberId) return m;
    const rels = normalizeRelations(m.relations);
    if (rels.some((r) => r.type === relation.type && r.memberId === relation.memberId)) return m;
    return { ...m, relations: [...rels, relation] };
  });

  const savePairRelation = async (sourceId: string, otherId: string, kind: RelationKind) => {
    const source = members.find((m) => m.id === sourceId);
    const other = members.find((m) => m.id === otherId);
    if (!source || !other) return;
    const sourceRel = { type: kind, memberId: otherId };
    const backRel = { type: reciprocal(kind), memberId: sourceId };
    const sourceNext = upsertRelation(source.id, sourceRel).find((m) => m.id === source.id);
    const otherNext = upsertRelation(other.id, backRel).find((m) => m.id === other.id);
    if (!sourceNext || !otherNext) return;
    await api.family.updateMember(source.id, { relations: sourceNext.relations });
    await api.family.updateMember(other.id, { relations: otherNext.relations });
    setMembers((prev) => {
      const withSource = prev.map((m) => (m.id === source.id ? sourceNext : m));
      return withSource.map((m) => (m.id === other.id ? otherNext : m));
    });
  };

  const parentSlots = useMemo(() => {
    const labels = ['Папа', 'Мама'];
    const slots: Array<{ key: string; member: FamilyMember | null; label: string }> = [];
    for (let i = 0; i < 2; i += 1) {
      slots.push({
        key: showParents[i]?.id ?? `empty-parent-${i}`,
        member: showParents[i] ?? null,
        label: labels[i],
      });
    }
    return slots;
  }, [showParents]);

  const selectableMembers = useMemo(
    () => members.filter((m) => m.id !== targetId),
    [members, targetId]
  );

  const openAddRelation = (sourceId: string, kind: RelationKind) => {
    setActiveMenuId(null);
    setTargetId(sourceId);
    setPendingKind(kind);
    setSelectMode('add-relation');
    setSelectedMemberId('');
  };

  const openEmptyParent = () => {
    if (!focus) return;
    setTargetId(focus.id);
    setPendingKind('parent');
    setSelectMode('empty-parent');
    setSelectedMemberId('');
  };

  const TreeCard = ({ member, nodeRef, small = false, relationLabel }: { member: FamilyMember; nodeRef: string; small?: boolean; relationLabel?: string }) => (
    <div ref={(el) => setNodeRef(nodeRef)(el)} className={`relative rounded-2xl border border-[var(--proto-border)] bg-white p-3 text-center shadow-sm ${small ? 'w-[170px]' : 'w-[200px]'}`}>
      <button type="button" onClick={() => setActiveMenuId((prev) => (prev === member.id ? null : member.id))} className="absolute right-2 top-2 rounded-lg border border-[var(--proto-border)] px-2 text-xs text-[var(--proto-text-muted)] hover:bg-[var(--proto-bg)]">
        +
      </button>
      <button type="button" onClick={() => openProfile(member.id)} className="w-full">
        <div className="mx-auto h-14 w-14 overflow-hidden rounded-xl border border-[var(--proto-border)] bg-[var(--proto-border)]">
          <Avatar className="h-14 w-14 rounded-xl">
            {avatarSrcFor(member, currentUserId) ? <AvatarImage src={avatarSrcFor(member, currentUserId)} /> : null}
            <AvatarFallback className="bg-[var(--proto-border)] text-[var(--proto-text)] text-sm font-semibold">{initialsFor(member)}</AvatarFallback>
          </Avatar>
        </div>
        <p className="mt-2 text-sm font-semibold text-[var(--proto-text)] leading-tight">{fullName(member)}</p>
        <p className="text-xs text-[var(--proto-text-muted)]">{relationLabel ?? 'Профиль'}</p>
      </button>
      {activeMenuId === member.id && (
        <div className="absolute left-2 right-2 top-12 z-20 rounded-xl border border-[var(--proto-border)] bg-white p-2 text-left shadow-lg">
          <button type="button" onClick={() => openAddRelation(member.id, 'parent')} className="block w-full rounded-lg px-2 py-1.5 text-xs hover:bg-[var(--proto-bg)]">Добавить родителя</button>
          <button type="button" onClick={() => openAddRelation(member.id, 'child')} className="block w-full rounded-lg px-2 py-1.5 text-xs hover:bg-[var(--proto-bg)]">Добавить ребёнка</button>
          <button type="button" onClick={() => openAddRelation(member.id, 'sibling')} className="block w-full rounded-lg px-2 py-1.5 text-xs hover:bg-[var(--proto-bg)]">Добавить брата/сестру</button>
          <button type="button" onClick={() => openAddRelation(member.id, 'spouse')} className="block w-full rounded-lg px-2 py-1.5 text-xs hover:bg-[var(--proto-bg)]">Добавить супруга/партнёра</button>
        </div>
      )}
    </div>
  );

  if (false && isDemoMode()) {
    return (
      <AppLayout>
        <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
          <div className="mx-auto max-w-full px-4 pt-8 pb-24 sm:max-w-md sm:px-5 md:max-w-2xl md:px-6 lg:max-w-4xl overflow-x-hidden">
            <h1 className="text-2xl font-semibold text-[var(--proto-text)] mb-6">Семейное древо</h1>
            <p className="text-sm text-[var(--proto-text-muted)]">В демо-режиме доступен упрощённый экран дерева. Для полного режима откройте приложение без демо-режима.</p>
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
        <div className="mx-auto max-w-6xl p-3 sm:p-4">
          <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-[var(--proto-border)] bg-[var(--proto-card)] p-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--proto-text)]">Режим:</span>
              <button type="button" onClick={() => setTreeMode('ancestors')} className={`rounded-xl px-3 py-1.5 text-sm ${treeMode === 'ancestors' ? 'bg-[var(--proto-active)] text-white' : 'border border-[var(--proto-border)] hover:bg-[var(--proto-bg)]'}`}>1→2→4</button>
              <button type="button" onClick={() => setTreeMode('all')} className={`rounded-xl px-3 py-1.5 text-sm ${treeMode === 'all' ? 'bg-[var(--proto-active)] text-white' : 'border border-[var(--proto-border)] hover:bg-[var(--proto-bg)]'}`}>Полное</button>
            </div>
            <label className="text-sm text-[var(--proto-text)]">
              Глубина дерева
              <input type="range" min={1} max={6} value={depth} onChange={(e) => setDepth(Number(e.target.value))} className="mt-1 block w-48 accent-[var(--proto-active)]" />
            </label>
            <span className="text-xs text-[var(--proto-text-muted)]">Поколений: {depth}</span>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={() => setZoom((z) => Math.max(70, z - 10))} className="rounded-xl border border-[var(--proto-border)] p-2 hover:bg-[var(--proto-bg)]" aria-label="Уменьшить">
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-12 text-center text-sm text-[var(--proto-text)]">{zoom}%</span>
              <button type="button" onClick={() => setZoom((z) => Math.min(140, z + 10))} className="rounded-xl border border-[var(--proto-border)] p-2 hover:bg-[var(--proto-bg)]" aria-label="Увеличить">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-4 sm:p-6">
            {loadError && <p className="mb-3 text-sm text-red-600">Ошибка: {loadError}</p>}
            {!focus && !loadError && <p className="mb-3 text-sm text-[var(--proto-text-muted)]">Загрузка…</p>}
            <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }} className="transition-transform">
              <div ref={linksWrapRef} className="relative min-h-[420px]">
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
                {treeMode === 'ancestors' ? (
                  <>
                    <div className="mb-6 flex flex-wrap justify-center gap-4">
                      {grandparentSlots.map((slot) => (
                        slot.member ? (
                          <TreeCard key={slot.key} member={slot.member} nodeRef={`grandparent:${slot.key}`} small relationLabel={slot.label} />
                        ) : (
                          <div key={slot.key} ref={(el) => setNodeRef(`grandparent:${slot.key}`)(el)} className="w-[170px] rounded-2xl border border-dashed border-[var(--proto-border)] bg-white p-3 text-center">
                            <div className="mx-auto h-12 w-12 rounded-xl border border-[var(--proto-border)] bg-[var(--proto-bg)]" />
                            <p className="mt-2 text-sm font-semibold text-[var(--proto-text)]">{slot.label}</p>
                            <button type="button" onClick={() => { const p = showParents[slot.parentIndex]; if (p) { setTargetId(p.id); setPendingKind('parent'); setSelectMode('add-relation'); setSelectedMemberId(''); } }} className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--proto-active)] text-white">+</button>
                          </div>
                        )
                      ))}
                    </div>
                    <div className="mb-6 flex flex-wrap justify-center gap-4">
                      {parentSlots.map((slot) => (
                        slot.member ? (
                          <TreeCard key={slot.key} member={slot.member} nodeRef={`parent:${slot.member.id}`} relationLabel={slot.label} />
                        ) : (
                          <button key={slot.key} type="button" onClick={openEmptyParent} ref={(el) => setNodeRef(`parent:${slot.key}`)(el)} className="w-[200px] rounded-2xl border border-dashed border-[var(--proto-border)] bg-white p-4 text-center hover:border-[var(--proto-active)]">
                            <div className="mx-auto h-14 w-14 rounded-xl border border-[var(--proto-border)] bg-[var(--proto-bg)]" />
                            <p className="mt-2 text-sm font-semibold text-[var(--proto-text)]">{slot.label}</p>
                            <p className="text-xs text-[var(--proto-text-muted)]">Пустой профиль</p>
                          </button>
                        )
                      ))}
                    </div>
                    {focus && (
                      <div className="flex justify-center">
                        <TreeCard member={focus} nodeRef={`focus:${focus.id}`} relationLabel="Я" />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-6 flex flex-wrap justify-center gap-4">
                      {parentSlots.map((slot) => (
                        slot.member ? (
                          <TreeCard key={slot.key} member={slot.member} nodeRef={`parent:${slot.member.id}`} relationLabel={slot.label} />
                        ) : (
                          <button key={slot.key} type="button" onClick={openEmptyParent} className="w-[200px] rounded-2xl border border-dashed border-[var(--proto-border)] bg-white p-4 text-center hover:border-[var(--proto-active)]">
                            <div className="mx-auto h-14 w-14 rounded-xl border border-[var(--proto-border)] bg-[var(--proto-bg)]" />
                            <p className="mt-2 text-sm font-semibold text-[var(--proto-text)]">{slot.label}</p>
                            <p className="text-xs text-[var(--proto-text-muted)]">Пустой профиль</p>
                          </button>
                        )
                      ))}
                    </div>
                    {focus && (
                      <div className="mb-6 flex items-center justify-center gap-4">
                        <TreeCard member={focus} nodeRef={`focus:${focus.id}`} relationLabel="Я" />
                        {showSpouse ? <TreeCard member={showSpouse} nodeRef={`spouse:${showSpouse.id}`} relationLabel="Партнёр" /> : null}
                      </div>
                    )}
                    {(showChildren.length > 0 || showSiblings.length > 0) && (
                      <div className="flex flex-wrap justify-center gap-4">
                        {showChildren.map((member) => (
                          <TreeCard key={member.id} member={member} nodeRef={`child:${member.id}`} small relationLabel="Ребёнок" />
                        ))}
                        {showSiblings.map((member) => (
                          <TreeCard key={member.id} member={member} nodeRef={`sibling:${member.id}`} small relationLabel="Брат/сестра" />
                        ))}
                      </div>
                )}
              </div>
            </div>
            <div className="mt-6 border-t border-[var(--proto-border)] pt-4">
              <p className="mb-2 text-sm font-medium text-[var(--proto-text)]">Связанные профили (с учётом глубины)</p>
              <div className="max-h-52 space-y-2 overflow-y-auto">
                {connectionsList.length === 0 ? (
                  <p className="text-sm text-[var(--proto-text-muted)]">Нет связей для выбранной глубины</p>
                ) : connectionsList.map(({ member, role }) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setFocusId(member.id)}
                    className="flex w-full items-center justify-between rounded-xl border border-[var(--proto-border)] bg-white px-3 py-2 text-left hover:border-[var(--proto-active)]"
                  >
                    <span className="text-sm text-[var(--proto-text)]">{fullName(member)}</span>
                    <span className="text-xs text-[var(--proto-text-muted)]">{role}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          {selectMode && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-4">
                <p className="mb-2 text-base font-semibold text-[var(--proto-text)]">
                  {selectMode === 'empty-parent' ? 'Добавить родителя' : 'Добавить связь'}
                </p>
                <p className="mb-3 text-sm text-[var(--proto-text-muted)]">
                  Выберите профиль из семьи или создайте новый.
                </p>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="mb-4 h-10 w-full rounded-xl border border-[var(--proto-border)] px-3 text-sm"
                >
                  <option value="">Выберите профиль</option>
                  {selectableMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {fullName(member)}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!targetId || !selectedMemberId) return;
                      try {
                        await savePairRelation(targetId, selectedMemberId, pendingKind);
                        setSelectMode(null);
                        toast({ title: 'Связь добавлена' });
                      } catch (e) {
                        const msg = e instanceof Error ? e.message : 'Не удалось добавить связь';
                        toast({ title: msg, variant: 'destructive' });
                      }
                    }}
                    className="rounded-xl bg-[var(--proto-active)] px-4 py-2 text-sm text-white"
                  >
                    Выбрать из профилей
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.classic.createMemberProfile)}
                    className="rounded-xl border border-[var(--proto-border)] px-4 py-2 text-sm"
                  >
                    Создать новый
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectMode(null)}
                    className="ml-auto rounded-xl px-4 py-2 text-sm text-[var(--proto-text-muted)]"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default FamilyTree;
