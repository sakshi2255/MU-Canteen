/**
 * Utility to generate secure, readable pickup tokens for canteen orders.
 * Example: MU-7842
 */
export function generatePickupToken(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // avoiding ambiguous 0/O, 1/I
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MU-${code}`;
}

export function generateOrderNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `#MU-${num}`;
}

export function normalizeToken(token: string): string {
  const clean = token.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.startsWith('MU')) {
    return `MU-${clean.slice(2)}`;
  }
  return `MU-${clean}`;
}

