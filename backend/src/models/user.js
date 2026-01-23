import { db } from '../db/database.js';
import bcrypt from 'bcrypt';

export const User = {
  findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  findByGroup(groupId) {
    return db.prepare('SELECT id, name, email, role, in_rotation FROM users WHERE group_id = ? ORDER BY name').all(groupId);
  },

  findByGroupInRotation(groupId) {
    return db.prepare('SELECT id, name, email, role, in_rotation FROM users WHERE group_id = ? AND in_rotation = 1 ORDER BY name').all(groupId);
  },

  async create({ id, groupId, name, email, password, role = 'member' }) {
    const passwordHash = await bcrypt.hash(password, 10);
    return db.prepare(
      'INSERT INTO users (id, group_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, groupId, name, email, passwordHash, role);
  },

  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  },

  update(id, { name, email }) {
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      values.push(email);
    }

    if (fields.length === 0) return;

    values.push(id);
    return db.prepare(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
    ).run(...values);
  },

  async updatePassword(id, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    return db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);
  },

  updateRole(id, role) {
    return db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  },

  updateInRotation(id, inRotation) {
    return db.prepare('UPDATE users SET in_rotation = ? WHERE id = ?').run(inRotation ? 1 : 0, id);
  },

  listAll() {
    return db.prepare('SELECT id, name, email, role, group_id FROM users ORDER BY name').all();
  },

  delete(id) {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  }
};