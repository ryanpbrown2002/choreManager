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
    return db.prepare('SELECT id, name, email, role, in_rotation, rotation_position FROM users WHERE group_id = ? ORDER BY name').all(groupId);
  },

  findByGroupInRotation(groupId) {
    return db.prepare('SELECT id, name, email, role, in_rotation, rotation_position FROM users WHERE group_id = ? AND in_rotation = 1 ORDER BY rotation_position, name').all(groupId);
  },

  getMaxRotationPosition(groupId) {
    const result = db.prepare('SELECT MAX(rotation_position) as max_pos FROM users WHERE group_id = ? AND in_rotation = 1').get(groupId);
    return result?.max_pos || 0;
  },

  updateRotationPosition(userId, position) {
    return db.prepare('UPDATE users SET rotation_position = ? WHERE id = ?').run(position, userId);
  },

  async create({ id, groupId, name, email, password, role = 'member' }) {
    const passwordHash = await bcrypt.hash(password, 10);
    // New users in rotation get the next available position
    const rotationPosition = this.getMaxRotationPosition(groupId) + 1;
    return db.prepare(
      'INSERT INTO users (id, group_id, name, email, password_hash, role, rotation_position) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, groupId, name, email, passwordHash, role, rotationPosition);
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

  updateInRotation(id, inRotation, groupId) {
    if (inRotation) {
      // When adding to rotation, assign the next available position
      const nextPosition = this.getMaxRotationPosition(groupId) + 1;
      return db.prepare('UPDATE users SET in_rotation = 1, rotation_position = ? WHERE id = ?').run(nextPosition, id);
    } else {
      // When removing from rotation, clear the position
      return db.prepare('UPDATE users SET in_rotation = 0, rotation_position = NULL WHERE id = ?').run(id);
    }
  },

  listAll() {
    return db.prepare('SELECT id, name, email, role, group_id FROM users ORDER BY name').all();
  },

  delete(id) {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  }
};