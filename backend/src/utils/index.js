import { randomBytes } from 'crypto';

export function generateId() {
  return randomBytes(16).toString('hex');
}

export function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getDaysFromNow(days) {
  return Math.floor((Date.now() + days * 24 * 60 * 60 * 1000) / 1000);
}

export function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000);
}
