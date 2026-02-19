import { Invitation } from '@/types';

export const mockInvitations: Invitation[] = [
  { id: 'inv1', fromId: 'm5', toEmail: 'cousin.anna@email.com', link: 'https://angelo.app/invite/abc123', status: 'sent', createdAt: '2025-12-10T10:00:00Z' },
  { id: 'inv2', fromId: 'm3', toPhone: '+39 333 444 5555', link: 'https://angelo.app/invite/def456', status: 'accepted', createdAt: '2025-11-01T08:00:00Z' },
  { id: 'inv3', fromId: 'm6', toEmail: 'elena@email.com', link: 'https://angelo.app/invite/ghi789', status: 'sent', createdAt: '2025-12-15T14:00:00Z' },
];

/** Входящие приглашения (от других пользователей текущему) */
export const mockIncomingInvitations: Invitation[] = [
  { id: 'inv-in1', fromId: 'm1', toEmail: 'anna@family.org', link: 'https://angelo.app/invite/incoming1', status: 'sent', createdAt: '2025-12-18T09:00:00Z' },
  { id: 'inv-in2', fromId: 'm14', toPhone: '+7 999 000 11 22', link: 'https://angelo.app/invite/incoming2', status: 'sent', createdAt: '2025-12-17T14:00:00Z' },
];
