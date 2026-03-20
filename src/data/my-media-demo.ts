export type MyMediaType = 'photo' | 'video' | 'audio';

export interface MyMediaItem {
  id: string;
  type: MyMediaType;
  src: string;
  thumbnail?: string;
  title: string;
  eventDate: string;
  year: string;
  category: string;
  publicationId?: string;
}

const REF_DIR = '../../_ref/Демо/Медиа для демо аккаунта + описание/Медиа для демо аккаунта + описание';
const REF_ASSETS = import.meta.glob(
  '../../_ref/Демо/Медиа для демо аккаунта + описание/Медиа для демо аккаунта + описание/*.{jpg,png,mp3,mp4}',
  { eager: true, import: 'default', query: '?url' },
) as Record<string, string>;

const publicDemoUrl = (file: string) => `${import.meta.env.BASE_URL}demo/media/${encodeURIComponent(file)}`;
const refUrl = (file: string) => REF_ASSETS[`${REF_DIR}/${file}`] ?? publicDemoUrl(file);

const baseMediaItems: MyMediaItem[] = [
  { id: 'mm1', type: 'photo', src: refUrl('Фото 1.jpg'), title: 'Семейный портрет с родителями', eventDate: '2019-04-12', year: '2019', category: 'Семья', publicationId: 'p1' },
  { id: 'mm2', type: 'photo', src: refUrl('Фото 2.png'), title: 'Поездка к бабушке и дедушке', eventDate: '2018-06-10', year: '2018', category: 'Семья', publicationId: 'p2' },
  { id: 'mm3', type: 'photo', src: refUrl('Фото 3.png'), title: 'Новый год с партнёром и детьми', eventDate: '2023-12-31', year: '2023', category: 'Праздник', publicationId: 'p3' },
  { id: 'mm4', type: 'photo', src: refUrl('Фото 4.png'), title: 'Выезд на природу с детьми', eventDate: '2024-07-01', year: '2024', category: 'Путешествие', publicationId: 'p4' },
  { id: 'mm5', type: 'photo', src: refUrl('Фото 5.png'), title: 'Воскресный обед у тёти Оли', eventDate: '2024-11-10', year: '2024', category: 'Семья', publicationId: 'p5' },
  { id: 'mm6', type: 'photo', src: refUrl('Фото 6.png'), title: 'Семейный рецепт пирога', eventDate: '2024-08-14', year: '2024', category: 'Семья', publicationId: 'p6' },
  { id: 'mm6a', type: 'audio', src: refUrl('Аудио 1.mp3'), thumbnail: refUrl('Фото 6.png'), title: 'Рецепт идеальной шарлотки', eventDate: '2024-08-28', year: '2024', category: 'Семья', publicationId: 'p8' },
  { id: 'mm7', type: 'photo', src: refUrl('Фото7.png'), title: 'Горжусь дочкой Софией', eventDate: '2024-05-19', year: '2024', category: 'Семья', publicationId: 'p7' },
  { id: 'mm8', type: 'video', src: refUrl('Фото 1.jpg'), title: 'Архив: поздравление маме и бабушке', eventDate: '2016-03-07', year: '2016', category: 'Праздник', publicationId: 'p9' },
];

const STRESS = String(import.meta.env.VITE_USE_MOCK_API ?? '').toLowerCase() === 'true';
const STRESS_PHOTOS = ['Фото 1.jpg', 'Фото 2.png', 'Фото 3.png', 'Фото 4.png', 'Фото 5.png', 'Фото 6.png', 'Фото7.png'];
const STRESS_CATEGORIES = ['Семья', 'Праздник', 'Путешествие'];
const STRESS_COUNT = 250;

const stressItems: MyMediaItem[] = STRESS
  ? Array.from({ length: STRESS_COUNT }, (_, i) => {
      const base = baseMediaItems[i % baseMediaItems.length];
      const year = `${2011 + (i % 14)}`;
      return {
        ...base,
        id: `mm-stress-${i}`,
        type: 'photo' as const,
        src: refUrl(STRESS_PHOTOS[i % STRESS_PHOTOS.length]),
        thumbnail: refUrl(STRESS_PHOTOS[i % STRESS_PHOTOS.length]),
        title: `Фото ${i + 1}`,
        eventDate: `${year}-${String((i % 12) + 1).padStart(2, '0')}-15`,
        year,
        category: STRESS_CATEGORIES[i % STRESS_CATEGORIES.length],
        publicationId: `stress-${i}`,
      };
    })
  : [];

export const myMediaDemoItems: MyMediaItem[] = [...baseMediaItems, ...stressItems];
