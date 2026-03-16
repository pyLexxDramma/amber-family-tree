import { FamilyMember } from '@/types';

export const mockMembers: FamilyMember[] = [
  { id: 'm1', firstName: 'Владимир', lastName: 'Фадеев', middleName: 'Николаевич', nickname: 'Дедушка', birthDate: '1959-01-17', city: 'Ленинград', about: 'Папа Алины Фадеевой. Любит рыбалку и поездки на природу.', role: 'member', isActive: true, generation: 1, relations: [{ memberId: 'm4', type: 'child' }] },
  { id: 'm2', firstName: 'Ольга', lastName: 'Никулина', middleName: 'Васильевна', nickname: 'Бабушка', birthDate: '1961-04-11', city: 'Уфа', about: 'Мама Романа Никулина. Главный хранитель рецептов и семейных традиций.', role: 'member', isActive: true, generation: 1, relations: [{ memberId: 'm3', type: 'child' }] },
  { id: 'm3', firstName: 'Роман', lastName: 'Никулин', nickname: 'Папа', birthDate: '1984-03-12', city: 'Вологда', about: 'Папа Елизаветы. Спокойный и надёжный, умеет поддержать в нужный момент.', role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm2', type: 'parent' }, { memberId: 'm4', type: 'spouse' }, { memberId: 'm5', type: 'child' }] },
  { id: 'm4', firstName: 'Алина', lastName: 'Фадеева', nickname: 'Мама', birthDate: '1985-09-20', city: 'Москва', about: 'Мама Елизаветы. Любит сохранять семейные истории и тёплые моменты.', role: 'admin', isActive: true, generation: 2, relations: [{ memberId: 'm1', type: 'parent' }, { memberId: 'm3', type: 'spouse' }, { memberId: 'm5', type: 'child' }] },
  { id: 'm5', firstName: 'Елизавета', lastName: 'Никулина', nickname: 'Лиза', birthDate: '2010-08-17', city: 'Москва', about: 'Дочь. Добрая, смелая, умеет радоваться мелочам.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm3', type: 'parent' }, { memberId: 'm4', type: 'parent' }] },
];

export const currentUserId = 'm4';
export const getCurrentUser = () => mockMembers.find(m => m.id === currentUserId)!;
export const getMember = (id: string) => mockMembers.find(m => m.id === id);
