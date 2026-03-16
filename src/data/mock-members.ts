import { FamilyMember } from '@/types';

const FIRST_NAMES = ['Александр', 'Мария', 'Дмитрий', 'Елена', 'Сергей', 'Ольга', 'Андрей', 'Наталья', 'Михаил', 'Ирина', 'Алексей', 'Татьяна', 'Иван', 'Светлана', 'Николай', 'Анна', 'Евгений', 'Юлия', 'Владимир', 'Екатерина'];
const LAST_NAMES = ['Иванов', 'Петров', 'Сидоров', 'Козлов', 'Новиков', 'Морозов', 'Волков', 'Соколов', 'Лебедев', 'Кузнецов', 'Попов', 'Васильев', 'Смирнов', 'Михайлов', 'Фёдоров', 'Андреев', 'Алексеев', 'Романов', 'Никитин', 'Орлов'];
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород', 'Вологда', 'Сочи', 'Калининград', 'Самара'];

const baseMembers: FamilyMember[] = [
  { id: 'm1', firstName: 'Владимир', lastName: 'Фадеев', middleName: 'Николаевич', nickname: 'Дедушка', birthDate: '1959-01-17', city: 'Ленинград', about: 'Папа Алины Фадеевой. Любит рыбалку и поездки на природу.', role: 'member', isActive: true, generation: 1, relations: [{ memberId: 'm4', type: 'child' }] },
  { id: 'm2', firstName: 'Ольга', lastName: 'Никулина', middleName: 'Васильевна', nickname: 'Бабушка', birthDate: '1961-04-11', city: 'Уфа', about: 'Мама Романа Никулина. Главный хранитель рецептов и семейных традиций.', role: 'member', isActive: true, generation: 1, relations: [{ memberId: 'm3', type: 'child' }] },
  { id: 'm3', firstName: 'Роман', lastName: 'Никулин', nickname: 'Папа', birthDate: '1984-03-12', city: 'Вологда', about: 'Папа Елизаветы. Спокойный и надёжный, умеет поддержать в нужный момент.', role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm2', type: 'parent' }, { memberId: 'm4', type: 'spouse' }, { memberId: 'm5', type: 'child' }] },
  { id: 'm4', firstName: 'Алина', lastName: 'Фадеева', nickname: 'Мама', birthDate: '1985-09-20', city: 'Москва', about: 'Мама Елизаветы. Любит сохранять семейные истории и тёплые моменты.', role: 'admin', isActive: true, generation: 2, relations: [{ memberId: 'm1', type: 'parent' }, { memberId: 'm3', type: 'spouse' }, { memberId: 'm5', type: 'child' }] },
  { id: 'm5', firstName: 'Елизавета', lastName: 'Никулина', nickname: 'Лиза', birthDate: '2010-08-17', city: 'Москва', about: 'Дочь. Добрая, смелая, умеет радоваться мелочам.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm3', type: 'parent' }, { memberId: 'm4', type: 'parent' }] },
];

const STRESS = String(import.meta.env.VITE_USE_MOCK_API ?? '').toLowerCase() === 'true';
const STRESS_MEMBER_COUNT = 45;

const stressMembers: FamilyMember[] = STRESS
  ? Array.from({ length: STRESS_MEMBER_COUNT }, (_, i) => ({
      id: `m${i + 6}`,
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
