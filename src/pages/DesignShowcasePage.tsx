import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { Heart, MessageCircle, Play, Image, Calendar, BookOpen, Headphones, Square, Palette, Search, Plus, Bell, Home, Users, Settings } from 'lucide-react';

const DEMO_PHOTOS = Array.from({ length: 8 }, (_, i) => `/demo/feed/${i + 1}.jpg`);
const DEMO_AVATARS = Array.from({ length: 6 }, (_, i) => `/demo/avatars/m${i + 1}.jpg`);

/* ─── Concept 1: Editorial Magazine ─── */
function ConceptMagazine() {
  return (
    <div className="rounded-2xl overflow-hidden border-2 border-border bg-[hsl(36_42%_95%)]" style={{ maxHeight: 520 }}>
      {/* Header */}
      <div className="bg-[hsl(28_22%_20%)] text-[hsl(36_45%_96%)] px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase">Семейный альбом</span>
        <div className="flex gap-2">
          <Search className="h-4 w-4 opacity-60" />
          <Bell className="h-4 w-4 opacity-60" />
        </div>
      </div>
      {/* Hero */}
      <div className="relative aspect-[3/4] max-h-[280px] overflow-hidden">
        <img src={DEMO_PHOTOS[0]} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[10px] uppercase tracking-widest text-amber-300/80 mb-1">семейная хроника</p>
          <p className="text-white font-bold text-base leading-tight">Летний отпуск в Крыму 1987</p>
          <p className="text-white/60 text-xs mt-1">Бабушка Мария · 12 фото</p>
        </div>
      </div>
      {/* Cards row */}
      <div className="grid grid-cols-2 gap-2 p-3">
        {DEMO_PHOTOS.slice(1, 3).map((src, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-white text-xs font-semibold">{i === 0 ? 'Свадьба' : 'День рождения'}</p>
              <p className="text-white/50 text-[10px]">{i === 0 ? '1965' : '2003'}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Bottom nav */}
      <div className="flex items-center justify-around py-2 border-t border-border/50 bg-[hsl(36_42%_95%)]">
        <Home className="h-5 w-5 text-amber-700" />
        <Image className="h-5 w-5 opacity-40" />
        <div className="bg-amber-600 rounded-full p-2 -mt-4 shadow-lg"><Plus className="h-5 w-5 text-white" /></div>
        <Users className="h-5 w-5 opacity-40" />
        <Settings className="h-5 w-5 opacity-40" />
      </div>
    </div>
  );
}

/* ─── Concept 2: Timeline / Calendar ─── */
function ConceptTimeline() {
  const years = [
    { year: '2024', count: 8, img: DEMO_PHOTOS[3] },
    { year: '2019', count: 14, img: DEMO_PHOTOS[4] },
    { year: '2003', count: 6, img: DEMO_PHOTOS[5] },
    { year: '1987', count: 22, img: DEMO_PHOTOS[6] },
    { year: '1965', count: 3, img: DEMO_PHOTOS[7] },
  ];
  return (
    <div className="rounded-2xl overflow-hidden border-2 border-border bg-[hsl(0_0%_97%)]" style={{ maxHeight: 520 }}>
      <div className="bg-[hsl(0_62%_42%)] text-white px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase">Хронология</span>
        <Calendar className="h-4 w-4 opacity-70" />
      </div>
      <div className="p-4 space-y-3 overflow-hidden" style={{ maxHeight: 440 }}>
        {years.map((y) => (
          <div key={y.year} className="flex items-center gap-3">
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100" />
              <div className="w-0.5 h-8 bg-red-200" />
            </div>
            <div className="flex-1 flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-red-100">
              <img src={y.img} alt="" className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-900">{y.year}</p>
                <p className="text-xs text-gray-500">{y.count} воспоминаний</p>
              </div>
              <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">{y.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Concept 3: Minimalist / B&W ─── */
function ConceptMinimal() {
  return (
    <div className="rounded-2xl overflow-hidden border-2 border-gray-200 bg-white" style={{ maxHeight: 520 }}>
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-medium tracking-[0.2em] uppercase">Album</span>
        <Search className="h-4 w-4 opacity-50" />
      </div>
      <div className="p-5 space-y-4 overflow-hidden" style={{ maxHeight: 440 }}>
        <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400">Недавнее</p>
        <div className="relative aspect-[16/10] rounded overflow-hidden">
          <img src={DEMO_PHOTOS[2]} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 leading-tight">Семейный обед, август</p>
          <p className="text-xs text-gray-400 mt-1">2024 · 4 фото</p>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="grid grid-cols-3 gap-2">
          {DEMO_PHOTOS.slice(4, 7).map((src, i) => (
            <div key={i} className="aspect-square rounded overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
            </div>
          ))}
        </div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400">1987 · Архив</p>
        <div className="flex gap-3 items-center">
          <img src={DEMO_PHOTOS[0]} alt="" className="w-16 h-16 rounded object-cover grayscale" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Крым</p>
            <p className="text-xs text-gray-400">22 фотографии</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Concept 4: Retro / Polaroid ─── */
function ConceptRetro() {
  return (
    <div className="rounded-2xl overflow-hidden border-2 border-[hsl(32_35%_75%)] bg-[hsl(35_45%_92%)]" style={{ maxHeight: 520 }}>
      <div className="bg-[hsl(22_50%_28%)] text-[hsl(38_25%_95%)] px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest uppercase" style={{ fontFamily: 'serif' }}>Фотоальбом</span>
        <Palette className="h-4 w-4 opacity-60" />
      </div>
      <div className="p-4 space-y-4 overflow-hidden" style={{ maxHeight: 440 }}>
        {/* Polaroid cards */}
        {DEMO_PHOTOS.slice(0, 3).map((src, i) => (
          <div key={i} className="bg-[hsl(40_40%_96%)] p-2 pb-6 shadow-md mx-auto" style={{
            maxWidth: 220, transform: `rotate(${i === 0 ? -2 : i === 1 ? 1.5 : -0.8}deg)`
          }}>
            <img src={src} alt="" className="w-full aspect-square object-cover" style={{ filter: 'sepia(0.3) saturate(0.85) brightness(0.95)' }} />
            <p className="text-center text-xs mt-2 text-[hsl(28_35%_30%)]" style={{ fontFamily: 'cursive' }}>
              {i === 0 ? 'Лето 1987' : i === 1 ? 'Свадьба' : 'Первые шаги'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Concept 5: Journal + Audio Player ─── */
function ConceptJournal() {
  return (
    <div className="rounded-2xl overflow-hidden border-2 border-[hsl(30_22%_78%)] bg-[hsl(35_28%_93%)]" style={{ maxHeight: 520 }}>
      <div className="bg-[hsl(25_30%_20%)] text-[hsl(35_20%_92%)] px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase">Журнал</span>
        <Headphones className="h-4 w-4 opacity-70" />
      </div>
      <div className="p-4 space-y-3 overflow-hidden" style={{ maxHeight: 440 }}>
        {/* Audio player bar */}
        <div className="flex items-center gap-3 bg-[hsl(32_25%_88%)] rounded-xl px-4 py-3">
          <div className="bg-[hsl(25_45%_35%)] rounded-full p-2"><Play className="h-4 w-4 text-white" fill="white" /></div>
          <div className="flex-1">
            <div className="h-1.5 bg-[hsl(30_22%_78%)] rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-[hsl(25_45%_35%)] rounded-full" />
            </div>
            <p className="text-[10px] text-[hsl(25_15%_42%)] mt-1">Рассказ бабушки · 3:42</p>
          </div>
        </div>
        {/* Article cards */}
        {[0, 1, 2].map(i => (
          <div key={i} className="flex gap-3 bg-[hsl(32_25%_90%)] rounded-xl p-3 border border-[hsl(30_22%_78%)]/50">
            <img src={DEMO_PHOTOS[i + 3]} alt="" className="w-16 h-16 rounded-lg object-cover" style={{ filter: 'sepia(0.15)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[hsl(25_25%_22%)] truncate">
                {i === 0 ? 'Как дедушка строил дом' : i === 1 ? 'Первый велосипед' : 'Новый год 1990'}
              </p>
              <p className="text-xs text-[hsl(25_15%_42%)] mt-0.5 line-clamp-2">
                {i === 0 ? 'История о том, как всё начиналось...' : i === 1 ? 'Мне было 5 лет, папа принёс...' : 'Мандарины, ёлка и бенгальские...'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Headphones className="h-3 w-3 text-[hsl(25_45%_35%)]" />
                <span className="text-[10px] text-[hsl(25_15%_42%)]">Слушать</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Concept 6: Living History (green) ─── */
function ConceptLiving() {
  return (
    <div className="rounded-2xl overflow-hidden border-2 border-[hsl(140_15%_88%)] bg-[hsl(0_0%_98%)]" style={{ maxHeight: 520 }}>
      <div className="bg-[hsl(142_45%_32%)] text-white px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase">Живая история</span>
        <BookOpen className="h-4 w-4 opacity-70" />
      </div>
      <div className="p-4 space-y-4 overflow-hidden" style={{ maxHeight: 440 }}>
        {/* Memoir card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[hsl(140_15%_88%)]">
          <div className="flex items-center gap-3 mb-3">
            <img src={DEMO_AVATARS[0]} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-green-200" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Мария Ивановна</p>
              <p className="text-[10px] text-gray-500">Бабушка · 1935–2018</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed italic">
            «В тот год мы впервые поехали на море. Дети были в восторге, а Николай всё фотографировал на свою "Смену"...»
          </p>
        </div>
        {/* Photo grid */}
        <div className="grid grid-cols-2 gap-2">
          {DEMO_PHOTOS.slice(0, 4).map((src, i) => (
            <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-green-700/80 px-2 py-1">
                  <p className="text-[10px] text-white font-medium">Крым, 1987</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CONCEPTS = [
  { id: 'magazine', title: 'Журнальная обложка', subtitle: 'Тёплый крем · Редакторская вёрстка · Фото на весь экран', Component: ConceptMagazine },
  { id: 'timeline', title: 'Хронология', subtitle: 'Красный акцент · Таймлайн · Группировка по годам', Component: ConceptTimeline },
  { id: 'minimal', title: 'Минимализм', subtitle: 'Монохром · Чистая типографика · Грейскейл', Component: ConceptMinimal },
  { id: 'retro', title: 'Ретро / Поляроид', subtitle: 'Винтаж 70-х · Сепия · Рукописные подписи', Component: ConceptRetro },
  { id: 'journal', title: 'Журнал + Плеер', subtitle: 'Аудио-рассказы · Тёплый сепия · Для слабовидящих', Component: ConceptJournal },
  { id: 'living', title: 'Живая история', subtitle: 'Зелёный акцент · Мемуары · Цитаты родных', Component: ConceptLiving },
];

export default function DesignShowcasePage() {
  const navigate = useNavigate();

  return (
    <AppLayout hideNav>
      <TopBar title="Дизайн-концепты" onBack={() => navigate(-1)} />
      <div className="px-4 pt-4 pb-10 page-enter">
        <p className="section-title text-primary mb-1">UI Mini App</p>
        <h1 className="text-2xl font-bold text-foreground mb-1">Семейный альбом</h1>
        <p className="text-base text-muted-foreground mb-6">
          6 вариантов оформления. Нажмите, чтобы увеличить.
        </p>

        <div className="space-y-8">
          {CONCEPTS.map(({ id, title, subtitle, Component }) => (
            <div key={id} className="space-y-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              </div>
              <div className="mx-auto" style={{ maxWidth: 360 }}>
                <Component />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
