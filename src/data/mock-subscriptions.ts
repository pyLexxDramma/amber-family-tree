import { SubscriptionPlan, Subscription } from '@/types';

export const plans: SubscriptionPlan[] = [
  { id: 'free', name: 'Free', price: 0, maxPlaces: 5, features: ['Up to 5 family members', '1 GB storage', 'Basic family tree', 'Photo publications'] },
  { id: 'premium', name: 'Premium', price: 4.99, maxPlaces: 50, features: ['Up to 50 family members', '50 GB storage', 'Advanced family tree', 'All media types', 'AI features', 'Priority support', 'Custom themes'] },
];

export const currentSubscription: Subscription = { planId: 'free', usedPlaces: 3, expiresAt: '2026-12-31' };
