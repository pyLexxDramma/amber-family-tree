import { FamilyMember } from '@/types';

const FIRST_NAMES = ['Александр', 'Мария', 'Дмитрий', 'Елена', 'Сергей', 'Ольга', 'Андрей', 'Наталья', 'Михаил', 'Ирина', 'Алексей', 'Татьяна', 'Иван', 'Светлана', 'Николай', 'Анна', 'Евгений', 'Юлия', 'Владимир', 'Екатерина'];
const LAST_NAMES = ['Иванов', 'Петров', 'Сидоров', 'Козлов', 'Новиков', 'Морозов', 'Волков', 'Соколов', 'Лебедев', 'Кузнецов', 'Попов', 'Васильев', 'Смирнов', 'Михайлов', 'Фёдоров', 'Андреев', 'Алексеев', 'Романов', 'Никитин', 'Орлов'];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород', 'Вологда', 'Сочи', 'Калининград', 'Самара'];

const baseMembers: FamilyMember[] = [
  { id: 'm1', firstName: 'Владимир', lastName: 'Фадеев', middleName: 'Николаевич', nickname: 'Дедушка', birthDate: '1959-01-17', city: 'Ленинград', about: 'Папа Алины Фадеевой. Любит рыбалку и поездки на природу.', role: 'member', isActive: true, generation: 1, relations: [{ memberId: 'm4', type: 'child' }, { memberId: 'm0a', type: 'parent' }] },
  { id: 'm2', firstName: 'Ольга', lastName: 'Никулина', middleName: 'Васильевна', nickname: 'Бабушка', birthDate: '1961-04-11', city: 'Уфа', about: 'Мама Романа Никулина. Главный хранитель рецептов и семейных традиций.', role: 'member', isActive: true, generation: 1, relations: [{ memberId: 'm3', type: 'child' }] },
  { id: 'm3', firstName: 'Роман', lastName: 'Никулин', nickname: 'Папа', birthDate: '1984-03-12', city: 'Вологда', about: 'Папа Елизаветы. Спокойный и надёжный, умеет поддержать в нужный момент.', role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm2', type: 'parent' }, { memberId: 'm4', type: 'spouse' }, { memberId: 'm5', type: 'child' }] },
  { id: 'm4', firstName: 'Алина', lastName: 'Фадеева', nickname: 'Мама', birthDate: '1985-09-20', city: 'Москва', about: 'Мама Елизаветы. Любит сохранять семейные истории и тёплые моменты.', role: 'admin', isActive: true, generation: 2, relations: [{ memberId: 'm1', type: 'parent' }, { memberId: 'm3', type: 'spouse' }, { memberId: 'm5', type: 'child' }] },
  { id: 'm5', firstName: 'Елизавета', lastName: 'Никулина', nickname: 'Лиза', birthDate: '2010-08-17', city: 'Москва', about: 'Дочь. Добрая, смелая, умеет радоваться мелочам.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm3', type: 'parent' }, { memberId: 'm4', type: 'parent' }] },
  { id: 'm6', firstName: 'Анна', lastName: 'Соколова', nickname: 'Аня (тест)', birthDate: '1998-05-22', city: 'Казань', about: 'Двоюродная сестра. Тестовый участник для демонстрации.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm8', type: 'parent' }], avatar: '/prototype/avatars/avatar-test-anna.png' },
  { id: 'm7', firstName: 'Дмитрий', lastName: 'Волков', nickname: 'Дядя Дима (тест)', birthDate: '1981-11-08', city: 'Вологда', about: 'Брат Владимира. Тестовый участник для демонстрации.', role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm0a', type: 'parent' }, { memberId: 'm1', type: 'sibling' }], avatar: '/prototype/avatars/avatar-test-dmitry.png' },
  { id: 'm8', firstName: 'Светлана', lastName: 'Петрова', nickname: 'Тётя Света (тест)', birthDate: '1979-03-15', city: 'Уфа', about: 'Сестра Владимира. Тестовый участник для демонстрации.', role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm0a', type: 'parent' }], avatar: '/prototype/avatars/avatar-test-svetlana.png' },
  { id: 'm9', firstName: 'Кирилл', lastName: 'Морозов', nickname: 'Кирилл (тест)', birthDate: '2001-07-30', city: 'Сочи', about: 'Двоюродный брат. Тестовый участник для демонстрации.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm7', type: 'parent' }], avatar: '/prototype/avatars/avatar-test-kirill.png' },
  { id: 'm10', firstName: 'Мария', lastName: 'Лебедева', nickname: 'Маша (тест)', birthDate: '2012-02-14', city: 'Вологда', about: 'Двоюродная сестра. Тестовый участник для демонстрации.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm8', type: 'parent' }], avatar: '/prototype/avatars/avatar-test-maria.png' },
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

export const currentUserId = 'm4';
export const getCurrentUser = () => mockMembers.find(m => m.id === currentUserId)!;
export const getMember = (id: string) => mockMembers.find(m => m.id === id);
