import { Publication, MediaItem } from '@/types';

const REF_DIR = '../../_ref/Демо/Медиа для демо аккаунта + описание/Медиа для демо аккаунта + описание';
const REF_ASSETS = import.meta.glob(
  '../../_ref/Демо/Медиа для демо аккаунта + описание/Медиа для демо аккаунта + описание/*.{jpg,png,mp3,mp4}',
  { eager: true, import: 'default', query: '?url' },
) as Record<string, string>;

const publicDemoUrl = (file: string) => `${import.meta.env.BASE_URL}demo/media/${encodeURIComponent(file)}`;
export const refUrl = (file: string) => REF_ASSETS[`${REF_DIR}/${file}`] ?? publicDemoUrl(file);

const photo = (id: number, file: string, name: string): MediaItem => ({
  id: `ph${id}`,
  type: 'photo',
  url: refUrl(file),
  thumbnail: refUrl(file),
  name,
  size: 2_800_000 + id * 10_000,
});

const audio = (id: number, file: string, name: string, thumbnailFile?: string): MediaItem => ({
  id: `au${id}`,
  type: 'audio',
  url: refUrl(file),
  thumbnail: thumbnailFile ? refUrl(thumbnailFile) : undefined,
  name,
  size: 7_500_000 + id * 50_000,
  duration: 165,
});

const video = (id: number, file: string, name: string, thumbnailFile: string): MediaItem => ({
  id: `vi${id}`,
  type: 'video',
  url: refUrl(file),
  thumbnail: refUrl(thumbnailFile),
  name,
  size: 35_000_000 + id * 150_000,
  duration: 28,
});

const basePublications: Publication[] = [
  {
    id: 'p1',
    type: 'photo',
    authorId: 'm4',
    coAuthorIds: [],
    title: 'Лизе 1 год!',
    text: 'Ровно год назад наша жизнь разделилась на «до» и «после» — и стала в сто раз счастливее. В этой студии мы впервые фотографировались втроём, когда Лизе был месяц, и вот мы снова здесь, но наша малышка уже вовсю стоит (и даже пытается бежать от мамы с папой!). Смотрю на этот кадр и не верю, что пролетел целый год. Спасибо вам за ваши тёплые слова и поддержку всё это время!',
    eventDate: '2011-08-17',
    place: 'Москва',
    publishDate: '2026-03-16',
    media: [photo(1, 'Фото 1.jpg', 'Лизе 1 год')],
    participantIds: ['m3', 'm4', 'm5'],
    topicTag: 'День рождения',
    likes: ['m3', 'm2'],
    comments: [
      { id: 'c1', authorId: 'm2', text: 'Какая красавица! ❤️', createdAt: '2026-03-01T10:10:00Z', likes: ['m4'] },
    ],
    isRead: true,
  },
  {
    id: 'p2',
    type: 'photo',
    authorId: 'm4',
    coAuthorIds: [],
    title: 'Первые шаги Лизы',
    text: 'Этот кадр — моё сердце. Лизе 10 месяцев, и в прошлые выходные она наконец решилась отпустить наши пальцы и сделать несколько шагов сама! Рома присел рядом и ловил каждое её движение, пока я бегала с соской на всякий случай. Смотрю на это фото и слышу этот день: Лизин восторженный визг и папино «давай, малыш, ещё шаг!». Бабушка Оля потом сказала, что Рома в детстве точно так же топал — вся в папу!',
    eventDate: '2011-07-04',
    place: 'Москва',
    publishDate: '2026-03-15',
    media: [photo(2, 'Фото 2.png', 'Первые шаги')],
    participantIds: ['m3', 'm4', 'm5'],
    topicTag: 'Будни',
    likes: ['m3', 'm1'],
    comments: [],
    isRead: true,
  },
  {
    id: 'p3',
    type: 'photo',
    authorId: 'm4',
    coAuthorIds: [],
    title: 'Новый 2014-й: первые праздники на новой месте',
    text: '31 декабря, мы только недавно въехали, кругом коробки, но ёлку собрали обязательно — без неё ведь не Новый год! Лизе три, и она впервые осознанно помогала наряжать: Рома сажал её на плечи, чтобы она достала до верхних веток, а мой папа руководил процессом с дивана и ловил разбитые игрушки. Спасибо ему, что приехал к нам в Москву встречать праздник — без дедушки совсем не то. Этот Новый год запомнился запахом мандаринов, свежего ремонта и невероятным чувством: у нас наконец-то СВОЙ угол.',
    eventDate: '2013-12-31',
    place: 'Москва',
    publishDate: '2026-03-14',
    media: [photo(3, 'Фото 3.png', 'Новый год')],
    participantIds: ['m3', 'm4', 'm5', 'm1'],
    topicTag: 'Праздники',
    likes: ['m3', 'm2', 'm1'],
    comments: [],
    isRead: true,
  },
  {
    id: 'p4',
    type: 'photo',
    authorId: 'm4',
    coAuthorIds: [],
    title: 'Дикарями на Волге. Июль 2018',
    text: 'Это был наш первый длинный выход с палатками! Лизе восемь, и она впервые увидела, как просыпается Волга. Мы с Ромой долго спорили, брать ли горелку или просто костёр, но в итоге победил дедушка — сказал, что настоящая рыбалка бывает только с дымком. На фото я помогаю Лизе собрать рюкзак (она утрамбовала туда три пачки зефира и любимую книжку), а мой папа уже подготовил лодку и ждёт Лизу. «Деда, а клюёт?» — «Клюёт, только если ты побыстрее соберёшься!» Тот самый день, когда мы поняли, что палатка лучше любого отеля.',
    eventDate: '2018-07-01',
    place: 'Ржев',
    publishDate: '2026-03-13',
    media: [photo(4, 'Фото 4.png', 'Палатки на Волге')],
    participantIds: ['m3', 'm4', 'm5', 'm1'],
    topicTag: 'Путешествия',
    likes: ['m3'],
    comments: [],
    isRead: true,
  },
  {
    id: 'p5',
    type: 'photo',
    authorId: 'm4',
    coAuthorIds: [],
    title: 'Майский Сочи: когда обманули календарь',
    text: 'Май— мы сбежали из Москвы на три дня, и это было лучшее решение. Вода в море ещё холодная, но воздух уже совсем летний. Мы гуляли по гальке босиком, Рома тащил подстилку и бутерброды, а я ловила момент и думала: вот оно, счастье — просто идти вдоль воды и держать их за руки. Лизе стесняется, когда её фотографируют, но тут забылась и смеялась по-настоящему. Сочи, спасибо за это тепло в начале мая.',
    eventDate: '2019-05-02',
    place: 'Сочи',
    publishDate: '2026-03-12',
    media: [photo(5, 'Фото 5.png', 'Сочи')],
    participantIds: ['m3', 'm4', 'm5'],
    topicTag: 'Путешествия',
    likes: ['m3', 'm1'],
    comments: [],
    isRead: true,
  },
  {
    id: 'p6',
    type: 'photo',
    authorId: 'm4',
    coAuthorIds: [],
    title: 'Бабушкины рецепты — лучшие',
    text: 'Урожай яблок в тот год был такой, что мы не знали, куда их девать — Ольга Васильевна сказала: «Будем печь шарлотку!» Лиза впервые готовила почти полностью сама (я только щёлкала камерой, пока Рома пытался объяснить, как правильно взбивать яйца). Бабушка руководила процессом: «Муку просей, сахара не жалей, и никаких миксеров — венчиком вкуснее!» Скоро пирог отправится в духовку, а на столе уже заваривается чай.',
    eventDate: '2020-08-14',
    place: 'Подмосковье',
    publishDate: '2026-03-11',
    media: [photo(6, 'Фото 6.png', 'Шарлотка')],
    participantIds: ['m3', 'm4', 'm5', 'm2'],
    topicTag: 'Рецепты',
    likes: ['m3', 'm2'],
    comments: [],
    isRead: true,
  },
  {
    id: 'p7',
    type: 'photo',
    authorId: 'm4',
    coAuthorIds: [],
    title: 'Наша гордость',
    text: '19 мая, школьный актовый зал. Лизе вручили грамоту за волонтёрский проект — она весь год помогала в приюте для животных и организовала сбор корма Пока ее приглашали на сцену, я чуть не расплакалась в третьем ряду. Рома с бабушкой Олей пробрались поближе к сцене и встретили её вот такими объятиями. Лиза смущается, но по глазам видно — ей важно, что они здесь. Смотрю на эту фотку и думаю: наш ребёнок растёт не просто умной, а доброй. Мы всё делаем правильно.',
    eventDate: '2024-05-19',
    place: 'Москва',
    publishDate: '2026-03-10',
    media: [photo(7, 'Фото7.png', 'Грамота')],
    participantIds: ['m3', 'm4', 'm5', 'm2'],
    topicTag: 'Истории',
    likes: ['m3', 'm1', 'm2'],
    comments: [],
    isRead: true,
  },
  {
    id: 'p8',
    type: 'audio',
    authorId: 'm4',
    coAuthorIds: [],
    title: 'Рецепт идеальной шарлотки',
    text: 'Помните нашу дачную шарлотку с фото? Я решила записать голосовое с рецептом своего пирога, пока свежо в памяти. Вдруг кому-то пригодится!',
    eventDate: '2020-08-28',
    place: 'Москва',
    publishDate: '2026-03-09',
    media: [audio(1, 'Аудио 1.mp3', 'Рецепт идеальной шарлотки', 'Фото 6.png')],
    participantIds: ['m4', 'm5', 'm2', 'm3'],
    topicTag: 'Рецепты',
    likes: ['m3', 'm2', 'm5'],
    comments: [],
    isRead: true,
  },
  {
    id: 'p9',
    type: 'video',
    authorId: 'm4',
    coAuthorIds: [],
    title: 'Лиза поздравляет бабушку с 8 Марта)',
    text: 'Нашла в архивах это видео - 7 марта 2017 года, Лиза в садике поздравляет бабушку с 8 Марта. Ей тогда шесть лет. Мы с бабушкой Олей сели в первый ряд, чтобы снять получше, но Лиза так старательно выводила «Ба-а-абушки, ба-а-абушки», что забыла развернуться к нам. Жаль, качество не айфонское, зато эмоции настоящие. Пересматриваю и таю) Бабушка до сих пор вспоминает: «Зато старалась лучше всех!»',
    eventDate: '2017-03-07',
    place: 'Москва',
    publishDate: '2026-03-08',
    media: [photo(8, 'Фото 1.jpg', 'Видео: 8 Марта'), video(1, 'Видео 1.mp4', 'Видео 8 Марта', 'Фото 1.jpg')],
    participantIds: ['m4', 'm5', 'm2'],
    topicTag: 'Праздники',
    likes: ['m3', 'm2', 'm5'],
    comments: [],
    isRead: true,
  },
];

const STRESS = String(import.meta.env.VITE_USE_MOCK_API ?? '').toLowerCase() === 'true';
const STRESS_PHOTO_FILES = ['Фото 1.jpg', 'Фото 2.png', 'Фото 3.png', 'Фото 4.png', 'Фото 5.png', 'Фото 6.png', 'Фото7.png'];
const REF_PROFILE_ID = 'm4';
const STRESS_TOPICS = ['Праздники', 'День рождения', 'Будни', 'Путешествия', 'Рецепты', 'Истории'];
const STRESS_COUNT = 250;

const stressPublications: Publication[] = STRESS
  ? Array.from({ length: STRESS_COUNT }, (_, i) => {
      const base = basePublications[i % basePublications.length];
      const phFile = STRESS_PHOTO_FILES[i % STRESS_PHOTO_FILES.length];
      const participants = [REF_PROFILE_ID, 'm3', 'm5', 'm1', 'm2'].slice(0, (i % 4) + 2);
      const hasComments = i % 7 === 0;
      const comments = hasComments
        ? [{ id: `c-stress-${i}`, authorId: 'm3', text: 'Отличное фото!', createdAt: `${2025}-01-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z`, likes: [] }]
        : [];
      return {
        ...base,
        id: `stress-${i}`,
        authorId: REF_PROFILE_ID,
        publishDate: `${2024 - Math.floor(i / 24)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        eventDate: `${2020 + (i % 5)}-${String((i % 12) + 1).padStart(2, '0')}-15`,
        media: [photo(1000 + i, phFile, `Фото ${i + 1}`)],
        participantIds: participants,
        topicTag: STRESS_TOPICS[i % STRESS_TOPICS.length],
        likes: i % 5 === 0 ? ['m3', 'm2'] : [],
        comments,
      };
    })
  : [];

export const mockPublications: Publication[] = [...basePublications, ...stressPublications];

export const allMediaItems: MediaItem[] = Array.from(
  new Map(mockPublications.flatMap(p => p.media).map(m => [m.id, m])).values(),
);

export const topicTags = ['Праздники', 'День рождения', 'Будни', 'Путешествия', 'Рецепты', 'Истории'];
