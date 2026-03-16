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

const refUrl = (file: string) => REF_ASSETS[`${REF_DIR}/${file}`] ?? '';

export const myMediaDemoItems: MyMediaItem[] = [
  { id: 'mm1', type: 'photo', src: refUrl('Фото 1.jpg'), title: 'Лизе 1 год!', eventDate: '2011-08-17', year: '2011', category: 'Семья', publicationId: 'p1' },
  { id: 'mm2', type: 'photo', src: refUrl('Фото 2.png'), title: 'Первые шаги Лизы', eventDate: '2011-07-04', year: '2011', category: 'Семья', publicationId: 'p2' },
  { id: 'mm3', type: 'photo', src: refUrl('Фото 3.png'), title: 'Новый 2014-й: первые праздники на новой месте', eventDate: '2013-12-31', year: '2013', category: 'Праздник', publicationId: 'p3' },
  { id: 'mm4', type: 'photo', src: refUrl('Фото 4.png'), title: 'Дикарями на Волге. Июль 2018', eventDate: '2018-07-01', year: '2018', category: 'Путешествие', publicationId: 'p4' },
  { id: 'mm5', type: 'photo', src: refUrl('Фото 5.png'), title: 'Майский Сочи: когда обманули календарь', eventDate: '2019-05-02', year: '2019', category: 'Путешествие', publicationId: 'p5' },
  { id: 'mm6', type: 'photo', src: refUrl('Фото 6.png'), title: 'Бабушкины рецепты — лучшие', eventDate: '2020-08-14', year: '2020', category: 'Семья', publicationId: 'p6' },
  { id: 'mm6a', type: 'audio', src: refUrl('Аудио 1.mp3'), thumbnail: refUrl('Фото 6.png'), title: 'Рецепт идеальной шарлотки', eventDate: '2020-08-28', year: '2020', category: 'Семья', publicationId: 'p8' },
  { id: 'mm7', type: 'photo', src: refUrl('Фото7.png'), title: 'Наша гордость', eventDate: '2024-05-19', year: '2024', category: 'Семья', publicationId: 'p7' },
  { id: 'mm8', type: 'video', src: refUrl('Фото 1.jpg'), title: 'Лиза поздравляет бабушку с 8 Марта)', eventDate: '2017-03-07', year: '2017', category: 'Праздник', publicationId: 'p9' },
];
