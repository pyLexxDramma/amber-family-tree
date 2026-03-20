import { FamilyMember } from '@/types';

const FIRST_NAMES = ['Александр', 'Мария', 'Дмитрий', 'Елена', 'Сергей', 'Ольга', 'Андрей', 'Наталья', 'Михаил', 'Ирина', 'Алексей', 'Татьяна', 'Иван', 'Светлана', 'Николай', 'Анна', 'Евгений', 'Юлия', 'Владимир', 'Екатерина'];
const LAST_NAMES = ['Иванов', 'Петров', 'Сидоров', 'Козлов', 'Новиков', 'Морозов', 'Волков', 'Соколов', 'Лебедев', 'Кузнецов', 'Попов', 'Васильев', 'Смирнов', 'Михайлов', 'Фёдоров', 'Андреев', 'Алексеев', 'Романов', 'Никитин', 'Орлов'];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород', 'Вологда', 'Сочи', 'Калининград', 'Самара'];

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+/g, '/');
const PROTO = `${BASE}prototype`.replace(/\/+/g, '/');
function avatarFor(memberId: string): string {
  const map: Record<string, string> = {
    m1: `${PROTO}/avatars/avatar-man-elderly.png`,
    m2: `${PROTO}/avatars/avatar-woman-elderly.png`,
    m3: `${PROTO}/avatars/avatar-man-dad.png`,
    m4: `${PROTO}/avatars/avatar-man-elderly.png`,
    m5: `${PROTO}/avatars/avatar-woman-elderly.png`,
    m6: `${PROTO}/avatars/avatar-woman-mom.png`,
    m7: `${PROTO}/avatars/avatar-man-beard-glasses.png`,
    m8: `${PROTO}/avatars/avatar-woman-young.png`,
    m9: `${PROTO}/avatars/avatar-woman-mom.png`,
    m10: `${PROTO}/avatars/avatar-test-dmitry.png`,
    m11: `${BASE}generated/avatars/avatar-m11-maxim.png`,
    m12: `${BASE}generated/avatars/avatar-m12-kirill.png`,
    m13: `${BASE}generated/avatars/avatar-m13-vera.png`,
    m14: `${PROTO}/avatars/avatar-test-maria.png`,
    m15: `${BASE}generated/avatars/avatar-m15-sofia.png`,
    m16: `${BASE}generated/avatars/avatar-m16-ilya.png`,
    m17: `${BASE}generated/avatars/avatar-m17-vladimir.png`,
    m18: `${BASE}generated/avatars/avatar-m18-tatyana.png`,
  };
  return map[memberId] ?? `${PROTO}/avatars/avatar-man-elderly.png`;
}

const baseMembers: FamilyMember[] = [
  { id: 'm1', firstName: 'Павел', lastName: 'Смирнов', middleName: 'Игоревич', nickname: 'Дедушка Павел', birthDate: '1957-02-12', city: 'Ярославль', about: 'Дедушка по линии папы.', avatar: avatarFor('m1'), role: 'member', isActive: true, generation: 1, relations: [{ memberId: 'm3', type: 'child' }, { memberId: 'm7', type: 'child' }, { memberId: 'm2', type: 'spouse' }] },
  { id: 'm2', firstName: 'Людмила', lastName: 'Смирнова', middleName: 'Сергеевна', nickname: 'Бабушка Люда', birthDate: '1959-09-28', city: 'Ярославль', about: 'Бабушка по линии папы.', avatar: avatarFor('m2'), role: 'member', isActive: true, generation: 1, relations: [{ memberId: 'm3', type: 'child' }, { memberId: 'm7', type: 'child' }, { memberId: 'm1', type: 'spouse' }] },
  { id: 'm3', firstName: 'Алексей', lastName: 'Смирнов', nickname: 'Папа', birthDate: '1983-05-04', city: 'Москва', about: 'Отец test_profile.', avatar: avatarFor('m3'), role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm1', type: 'parent' }, { memberId: 'm2', type: 'parent' }, { memberId: 'm6', type: 'spouse' }, { memberId: 'm7', type: 'sibling' }, { memberId: 'm10', type: 'child' }, { memberId: 'm11', type: 'child' }] },
  { id: 'm4', firstName: 'Георгий', lastName: 'Кузнецов', middleName: 'Петрович', nickname: 'Дедушка Георгий', birthDate: '1958-01-22', city: 'Тверь', about: 'Дедушка по линии мамы.', avatar: avatarFor('m4'), role: 'member', isActive: true, generation: 1, relations: [{ memberId: 'm6', type: 'child' }, { memberId: 'm8', type: 'child' }, { memberId: 'm5', type: 'spouse' }] },
  { id: 'm5', firstName: 'Наталья', lastName: 'Кузнецова', middleName: 'Ивановна', nickname: 'Бабушка Наташа', birthDate: '1960-07-11', city: 'Тверь', about: 'Бабушка по линии мамы.', avatar: avatarFor('m5'), role: 'member', isActive: true, generation: 1, relations: [{ memberId: 'm6', type: 'child' }, { memberId: 'm8', type: 'child' }, { memberId: 'm4', type: 'spouse' }] },
  { id: 'm6', firstName: 'Елена', lastName: 'Кузнецова', nickname: 'Мама', birthDate: '1986-08-19', city: 'Москва', about: 'Мать test_profile.', avatar: avatarFor('m6'), role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm4', type: 'parent' }, { memberId: 'm5', type: 'parent' }, { memberId: 'm3', type: 'spouse' }, { memberId: 'm8', type: 'sibling' }, { memberId: 'm10', type: 'child' }, { memberId: 'm11', type: 'child' }] },
  { id: 'm7', firstName: 'Игорь', lastName: 'Смирнов', nickname: 'Дядя Игорь', birthDate: '1981-11-02', city: 'Ярославль', about: 'Брат отца.', avatar: avatarFor('m7'), role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm1', type: 'parent' }, { memberId: 'm2', type: 'parent' }, { memberId: 'm3', type: 'sibling' }, { memberId: 'm9', type: 'spouse' }, { memberId: 'm12', type: 'child' }] },
  { id: 'm8', firstName: 'Ольга', lastName: 'Кузнецова', nickname: 'Тётя Оля', birthDate: '1988-03-10', city: 'Тверь', about: 'Сестра матери.', avatar: avatarFor('m8'), role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm4', type: 'parent' }, { memberId: 'm5', type: 'parent' }, { memberId: 'm6', type: 'sibling' }, { memberId: 'm13', type: 'child' }], managedById: 'm10' },
  { id: 'm9', firstName: 'Марина', lastName: 'Смирнова', nickname: 'Тётя Марина', birthDate: '1982-12-14', city: 'Ярославль', about: 'Жена дяди Игоря.', avatar: avatarFor('m9'), role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm7', type: 'spouse' }, { memberId: 'm12', type: 'child' }], managedById: 'm10' },
  { id: 'm10', firstName: 'Андрей', lastName: 'Смирнов', nickname: 'test_profile', birthDate: '1994-04-16', city: 'Москва', about: 'Тестовый профиль для проверки построения дерева.', avatar: avatarFor('m10'), role: 'admin', isActive: true, generation: 3, relations: [{ memberId: 'm3', type: 'parent' }, { memberId: 'm6', type: 'parent' }, { memberId: 'm11', type: 'sibling' }, { memberId: 'm14', type: 'spouse' }, { memberId: 'm15', type: 'child' }, { memberId: 'm16', type: 'child' }] },
  { id: 'm11', firstName: 'Максим', lastName: 'Смирнов', nickname: 'Брат Максим', birthDate: '1998-09-03', city: 'Москва', about: 'Младший брат test_profile.', avatar: avatarFor('m11'), role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm3', type: 'parent' }, { memberId: 'm6', type: 'parent' }, { memberId: 'm10', type: 'sibling' }] },
  { id: 'm12', firstName: 'Кирилл', lastName: 'Смирнов', nickname: 'Кузен Кирилл', birthDate: '2007-06-25', city: 'Ярославль', about: 'Сын дяди Игоря и тёти Марины.', avatar: avatarFor('m12'), role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm7', type: 'parent' }, { memberId: 'm9', type: 'parent' }], managedById: 'm10' },
  { id: 'm13', firstName: 'Вера', lastName: 'Кузнецова', nickname: 'Кузина Вера', birthDate: '2010-11-21', city: 'Тверь', about: 'Дочь тёти Оли.', avatar: avatarFor('m13'), role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm8', type: 'parent' }], managedById: 'm10' },
  { id: 'm14', firstName: 'Мария', lastName: 'Орлова', nickname: 'Супруга Мария', birthDate: '1992-01-30', city: 'Москва', about: 'Супруга test_profile.', avatar: avatarFor('m14'), role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm10', type: 'spouse' }, { memberId: 'm17', type: 'parent' }, { memberId: 'm18', type: 'parent' }, { memberId: 'm15', type: 'child' }, { memberId: 'm16', type: 'child' }] },
  { id: 'm15', firstName: 'София', lastName: 'Орлова', nickname: 'Дочь София', birthDate: '2018-05-01', city: 'Москва', about: 'Старшая дочь test_profile.', avatar: avatarFor('m15'), role: 'member', isActive: true, generation: 4, relations: [{ memberId: 'm10', type: 'parent' }, { memberId: 'm14', type: 'parent' }, { memberId: 'm16', type: 'sibling' }], managedById: 'm10' },
  { id: 'm16', firstName: 'Илья', lastName: 'Орлов', nickname: 'Сын Илья', birthDate: '2021-02-15', city: 'Москва', about: 'Младший сын test_profile.', avatar: avatarFor('m16'), role: 'member', isActive: true, generation: 4, relations: [{ memberId: 'm10', type: 'parent' }, { memberId: 'm14', type: 'parent' }, { memberId: 'm15', type: 'sibling' }], managedById: 'm10' },
  { id: 'm17', firstName: 'Владимир', lastName: 'Орлов', middleName: 'Семенович', nickname: 'Свёкор Владимир', birthDate: '1963-03-08', city: 'Рязань', about: 'Отец партнёра.', avatar: avatarFor('m17'), role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm14', type: 'child' }, { memberId: 'm18', type: 'spouse' }] },
  { id: 'm18', firstName: 'Татьяна', lastName: 'Орлова', middleName: 'Андреевна', nickname: 'Свекровь Татьяна', birthDate: '1964-10-29', city: 'Рязань', about: 'Мать партнёра.', avatar: avatarFor('m18'), role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm14', type: 'child' }, { memberId: 'm17', type: 'spouse' }] },
];

const STRESS = String(import.meta.env.VITE_USE_MOCK_API ?? '').toLowerCase() === 'true';
const STRESS_MEMBER_COUNT = 45;

const stressMembers: FamilyMember[] = STRESS
  ? Array.from({ length: STRESS_MEMBER_COUNT }, (_, i) => ({
      id: `m${i + 11}`,
      firstName: FIRST_NAMES[i % FIRST_NAMES.length],
      lastName: LAST_NAMES[i % LAST_NAMES.length],
      middleName: undefined,
      nickname: undefined,
      birthDate: `${1960 + (i % 50)}-${String((i % 12) + 1).padStart(2, '0')}-15`,
      city: CITIES[i % CITIES.length],
      about: `Член семьи ${i + 6}.`,
      role: 'member' as const,
      isActive: true,
      generation: (i % 3) + 1,
      relations: [],
    }))
  : [];

export const mockMembers: FamilyMember[] = [...baseMembers, ...stressMembers];

export const currentUserId = 'm10';
export const getCurrentUser = () => mockMembers.find(m => m.id === currentUserId)!;
export const getMember = (id: string) => mockMembers.find(m => m.id === id);
