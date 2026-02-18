import { FamilyMember } from '@/types';

export const mockMembers: FamilyMember[] = [
  // Поколение 1 — Дедушки и бабушки
  { id: 'm1', firstName: 'Николай', lastName: 'Соколов', nickname: 'Дедушка Коля', birthDate: '1940-05-12', city: 'Москва', about: 'Патриарх семьи. Любит сад и старые песни. Ветеран труда.', role: 'admin', isActive: true, generation: 1, relations: [{ memberId: 'm3', type: 'child' }, { memberId: 'm2', type: 'spouse' }] },
  { id: 'm2', firstName: 'Мария', lastName: 'Соколова', nickname: 'Бабушка Маша', birthDate: '1943-08-22', city: 'Москва', about: 'Лучшая кулинарка в семье. Хранит все старые рецепты.', role: 'member', isActive: true, generation: 1, relations: [{ memberId: 'm3', type: 'child' }, { memberId: 'm1', type: 'spouse' }] },
  { id: 'm10', firstName: 'Александр', lastName: 'Соколов', birthDate: '1938-11-01', city: 'Санкт-Петербург', about: 'Дядя Саша, историк. Участник восстановления Ленинграда.', role: 'member', isActive: false, generation: 1, relations: [{ memberId: 'm1', type: 'sibling' }] },
  { id: 'm11', firstName: 'Ольга', lastName: 'Кузнецова', birthDate: '1941-03-17', city: 'Санкт-Петербург', about: 'Тётя Оля, любит оперу и театр.', role: 'member', isActive: false, generation: 1, relations: [{ memberId: 'm10', type: 'spouse' }] },
  // Поколение 2 — Родители
  { id: 'm3', firstName: 'Дмитрий', lastName: 'Соколов', nickname: 'Папа', birthDate: '1968-06-15', city: 'Москва', about: 'Архитектор, фотограф-любитель, хранитель семейной истории.', role: 'admin', isActive: true, generation: 2, relations: [{ memberId: 'm1', type: 'parent' }, { memberId: 'm2', type: 'parent' }, { memberId: 'm4', type: 'spouse' }, { memberId: 'm5', type: 'child' }, { memberId: 'm15', type: 'child' }] },
  { id: 'm4', firstName: 'Елена', lastName: 'Соколова', middleName: 'Викторовна', nickname: 'Мама', birthDate: '1971-04-19', city: 'Москва', about: 'Учитель и рассказчик. Пишет семейные истории.', role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm3', type: 'spouse' }, { memberId: 'm5', type: 'child' }, { memberId: 'm15', type: 'child' }] },
  { id: 'm6', firstName: 'Андрей', lastName: 'Соколов', birthDate: '1970-02-28', city: 'Казань', about: 'Дядя Андрей, семейный юморист. Инженер.', role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm1', type: 'parent' }, { memberId: 'm2', type: 'parent' }, { memberId: 'm7', type: 'spouse' }] },
  { id: 'm7', firstName: 'Светлана', lastName: 'Соколова', birthDate: '1973-06-10', city: 'Казань', about: 'Тётя Света, заядлый читатель. Библиотекарь.', role: 'member', isActive: false, generation: 2, relations: [{ memberId: 'm6', type: 'spouse' }, { memberId: 'm8', type: 'child' }, { memberId: 'm9', type: 'child' }] },
  { id: 'm12', firstName: 'Игорь', lastName: 'Соколов', birthDate: '1966-09-25', city: 'Краснодар', about: 'Винодел, держит семейный виноградник.', role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm10', type: 'parent' }, { memberId: 'm13', type: 'child' }] },
  { id: 'm14', firstName: 'Наталья', lastName: 'Волкова', birthDate: '1969-07-03', city: 'Москва', about: 'Подруга семьи, которая стала своей.', role: 'member', isActive: true, generation: 2, relations: [] },
  // Поколение 3 — Дети и внуки
  { id: 'm5', firstName: 'Анна', lastName: 'Соколова', birthDate: '1996-09-12', city: 'Москва', about: 'Тот, кто собрал семью онлайн! Дизайнер.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm3', type: 'parent' }, { memberId: 'm4', type: 'parent' }] },
  { id: 'm8', firstName: 'Максим', lastName: 'Соколов', birthDate: '1998-01-05', city: 'Казань', about: 'Двоюродный брат, любитель музыки. Звукорежиссёр.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm6', type: 'parent' }, { memberId: 'm7', type: 'parent' }] },
  { id: 'm9', firstName: 'Ксения', lastName: 'Соколова', birthDate: '2001-08-30', city: 'Москва', about: 'Младшая двоюродная сестра, изучает искусство.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm6', type: 'parent' }, { memberId: 'm7', type: 'parent' }] },
  { id: 'm13', firstName: 'Виктория', lastName: 'Соколова', birthDate: '1993-03-14', city: 'Краснодар', about: 'Дочь Игоря, сомелье. Работает на винограднике.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm12', type: 'parent' }] },
  { id: 'm15', firstName: 'Артём', lastName: 'Соколов', birthDate: '2003-11-20', city: 'Москва', about: 'Младший брат Анны. Увлекается танцами и программированием.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm3', type: 'parent' }, { memberId: 'm4', type: 'parent' }] },
  { id: 'm16', firstName: 'Даниил', lastName: 'Соколов', birthDate: '1995-05-08', city: 'Казань', about: 'Старший племянник. Фотограф, путешественник.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm6', type: 'parent' }, { memberId: 'm7', type: 'parent' }] },
  { id: 'm17', firstName: 'Полина', lastName: 'Соколова', birthDate: '2005-02-14', city: 'Москва', about: 'Самая младшая в семье. Школьница, рисует.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm3', type: 'parent' }, { memberId: 'm4', type: 'parent' }] },
];

export const currentUserId = 'm5';
export const getCurrentUser = () => mockMembers.find(m => m.id === currentUserId)!;
export const getMember = (id: string) => mockMembers.find(m => m.id === id);
