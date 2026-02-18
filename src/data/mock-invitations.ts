import { Invitation } from '@/types';

export const mockInvitations: Invitation[] = [
  { id: 'inv1', fromId: 'm5', toEmail: 'cousin.anna@email.com', link: 'https://angelo.app/invite/abc123', status: 'sent', createdAt: '2025-12-10T10:00:00Z' },
  { id: 'inv2', fromId: 'm3', toPhone: '+39 333 444 5555', link: 'https://angelo.app/invite/def456', status: 'accepted', createdAt: '2025-11-01T08:00:00Z' },
  { id: 'inv3', fromId: 'm6', toEmail: 'elena@email.com', link: 'https://angelo.app/invite/ghi789', status: 'sent', createdAt: '2025-12-15T14:00:00Z' },
];
