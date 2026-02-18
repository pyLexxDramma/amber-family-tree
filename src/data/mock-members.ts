import { FamilyMember } from '@/types';

export const mockMembers: FamilyMember[] = [
  // Generation 1 — Grandparents
  { id: 'm1', firstName: 'Angelo', lastName: 'Rossi', nickname: 'Nonno Angelo', birthDate: '1942-03-15', city: 'Florence', about: 'Family patriarch, loves gardening and old Italian songs.', role: 'admin', isActive: true, generation: 1, relations: [{ memberId: 'm3', type: 'child' }, { memberId: 'm2', type: 'spouse' }] },
  { id: 'm2', firstName: 'Maria', lastName: 'Rossi', nickname: 'Nonna Maria', birthDate: '1945-07-22', city: 'Florence', about: 'Best cook in the family. Keeper of all the old recipes.', role: 'member', isActive: true, generation: 1, relations: [{ memberId: 'm3', type: 'child' }, { memberId: 'm1', type: 'spouse' }] },
  // Generation 2 — Parents
  { id: 'm3', firstName: 'Luca', lastName: 'Rossi', nickname: 'Papà', birthDate: '1970-11-08', city: 'Rome', about: 'Architect, amateur photographer, family historian.', role: 'admin', isActive: true, generation: 2, relations: [{ memberId: 'm1', type: 'parent' }, { memberId: 'm2', type: 'parent' }, { memberId: 'm4', type: 'spouse' }, { memberId: 'm5', type: 'child' }] },
  { id: 'm4', firstName: 'Sofia', lastName: 'Rossi', middleName: 'Elena', nickname: 'Mamma', birthDate: '1973-04-19', city: 'Rome', about: 'Teacher and storyteller. Loves writing family stories.', role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm3', type: 'spouse' }, { memberId: 'm5', type: 'child' }] },
  // Generation 3 — Current user
  { id: 'm5', firstName: 'Elena', lastName: 'Rossi', birthDate: '1998-09-12', city: 'Milan', about: 'The one who brought the family online! Designer by day.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm3', type: 'parent' }, { memberId: 'm4', type: 'parent' }] },
  // Extended family for tree
  { id: 'm6', firstName: 'Marco', lastName: 'Rossi', birthDate: '1972-02-28', city: 'Naples', about: 'Uncle Marco, the family comedian.', role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm1', type: 'parent' }, { memberId: 'm2', type: 'parent' }, { memberId: 'm7', type: 'spouse' }] },
  { id: 'm7', firstName: 'Giulia', lastName: 'Bianchi', birthDate: '1975-06-10', city: 'Naples', about: 'Aunt Giulia, an avid reader.', role: 'member', isActive: false, generation: 2, relations: [{ memberId: 'm6', type: 'spouse' }, { memberId: 'm8', type: 'child' }] },
  { id: 'm8', firstName: 'Matteo', lastName: 'Rossi', birthDate: '2000-01-05', city: 'Naples', about: 'Cousin Matteo, music lover.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm6', type: 'parent' }, { memberId: 'm7', type: 'parent' }] },
  { id: 'm9', firstName: 'Isabella', lastName: 'Rossi', birthDate: '2003-08-30', city: 'Milan', about: 'Youngest cousin, studies art history.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm6', type: 'parent' }, { memberId: 'm7', type: 'parent' }] },
  { id: 'm10', firstName: 'Giovanni', lastName: 'Rossi', birthDate: '1940-12-01', city: 'Florence', about: 'Great uncle, WWII historian.', role: 'member', isActive: false, generation: 1, relations: [{ memberId: 'm1', type: 'sibling' }] },
  { id: 'm11', firstName: 'Rosa', lastName: 'Moretti', birthDate: '1943-05-17', city: 'Florence', about: 'Great aunt Rosa, loves opera.', role: 'member', isActive: false, generation: 1, relations: [{ memberId: 'm10', type: 'spouse' }] },
  { id: 'm12', firstName: 'Paolo', lastName: 'Rossi', birthDate: '1968-09-25', city: 'Turin', about: 'Second cousin, runs a vineyard.', role: 'member', isActive: true, generation: 2, relations: [{ memberId: 'm10', type: 'parent' }] },
  { id: 'm13', firstName: 'Chiara', lastName: 'Rossi', birthDate: '1995-03-14', city: 'Turin', about: 'Paolo\'s daughter, aspiring sommelier.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm12', type: 'parent' }] },
  { id: 'm14', firstName: 'Francesco', lastName: 'Conti', birthDate: '1971-07-03', city: 'Rome', about: 'Family friend who became family.', role: 'member', isActive: true, generation: 2, relations: [] },
  { id: 'm15', firstName: 'Alessia', lastName: 'Rossi', birthDate: '2005-11-20', city: 'Milan', about: 'Elena\'s younger cousin, loves dancing.', role: 'member', isActive: true, generation: 3, relations: [{ memberId: 'm3', type: 'parent' }, { memberId: 'm4', type: 'parent' }] },
];

export const currentUserId = 'm5';
export const getCurrentUser = () => mockMembers.find(m => m.id === currentUserId)!;
export const getMember = (id: string) => mockMembers.find(m => m.id === id);
