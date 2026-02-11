import { db } from '../db/database.js';
import { createHash, randomBytes } from 'crypto';

export const PasswordReset = {
  create(userId) {
    const id = randomBytes(16).toString('hex');
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour

    // Invalidate any existing unused tokens for this user
    db.prepare(
      'UPDATE password_resets SET used_at = ? WHERE user_id = ? AND used_at IS NULL'
    ).run(Math.floor(Date.now() / 1000), userId);

    db.prepare(
      'INSERT INTO password_resets (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)'
    ).run(id, userId, tokenHash, expiresAt);

    return rawToken;
  },

  findValidToken(rawToken) {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const now = Math.floor(Date.now() / 1000);
    return db.prepare(
      'SELECT * FROM password_resets WHERE token_hash = ? AND expires_at > ? AND used_at IS NULL'
    ).get(tokenHash, now);
  },

  markUsed(id) {
    const now = Math.floor(Date.now() / 1000);
    return db.prepare('UPDATE password_resets SET used_at = ? WHERE id = ?').run(now, id);
  },
};
