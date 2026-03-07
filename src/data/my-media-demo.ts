export type MyMediaType = 'photo' | 'video';

export interface MyMediaItem {
  id: string;
  type: MyMediaType;
  src: string;
  title: string;
  eventDate: string;
  year: string;
  category: string;
  publicationId?: string;
}

const BASE = '/prototype';

export const myMediaDemoItems: MyMediaItem[] = [
  { id: 'mm1', type: 'photo', src: `${BASE}/pub-family-old.png`, title: 'Семейный праздник', eventDate: '2025-12-01', year: '2025', category: 'Праздник', publicationId: 'p1' },
  { id: 'mm2', type: 'photo', src: `${BASE}/pub-birthday.png`, title: 'День рождения', eventDate: '1997-09-12', year: '1997', category: 'Праздник', publicationId: 'p2' },
  { id: 'mm3', type: 'photo', src: `${BASE}/pub-village.png`, title: 'Лето в деревне', eventDate: '1985-07-15', year: '1985', category: 'Путешествие', publicationId: 'p1' },
  { id: 'mm4', type: 'video', src: `${BASE}/pub-birthday.png`, title: 'Рецепт бабушкиных блинов', eventDate: '2025-10-20', year: '2025', category: 'Семья', publicationId: 'p3' },
  { id: 'mm5', type: 'photo', src: `${BASE}/pub-family-old.png`, title: 'Москва: новые места', eventDate: '2025-08-15', year: '2025', category: 'Путешествие', publicationId: 'p8' },
  { id: 'mm7', type: 'photo', src: `${BASE}/pub-village.png`, title: 'Путешествия', eventDate: '2025-08-20', year: '2025', category: 'Путешествие', publicationId: 'p8' },
  { id: 'mm8', type: 'video', src: `${BASE}/pub-family-old.png`, title: 'Новогодняя ночь 2025', eventDate: '2025-01-01', year: '2025', category: 'Праздник', publicationId: 'p12' },
  { id: 'mm9', type: 'photo', src: `${BASE}/my-media/photo-family.jpg`, title: 'Семейный обед', eventDate: '2025-11-03', year: '2025', category: 'Семья', publicationId: 'p7' },
  { id: 'mm10', type: 'photo', src: `${BASE}/my-media/photo-travel.jpg`, title: 'Отдых на природе', eventDate: '2025-09-28', year: '2025', category: 'Путешествие', publicationId: 'p8' },
  { id: 'mm11', type: 'photo', src: `${BASE}/my-media/photo-childhood.jpg`, title: 'Детство', eventDate: '1997-09-12', year: '1997', category: 'Семья', publicationId: 'p2' },
  { id: 'mm12', type: 'photo', src: `${BASE}/pub-birthday.png`, title: 'Праздник', eventDate: '2025-05-12', year: '2025', category: 'Праздник', publicationId: 'p15' },
];
