import { db } from '../db/database.js';

export const Group = {
  findById(id) {
    return db.prepare('SELECT * FROM groups WHERE id = ?').get(id);
  },

  findByInviteCode(inviteCode) {
    return db.prepare('SELECT * FROM groups WHERE invite_code = ?').get(inviteCode);
  },

  create({ id, name, inviteCode }) {
    return db.prepare(
      'INSERT INTO groups (id, name, invite_code) VALUES (?, ?, ?)'
    ).run(id, name, inviteCode);
  },

  update(id, { name }) {
    return db.prepare('UPDATE groups SET name = ? WHERE id = ?').run(name, id);
  },

  getMembers(id) {
    return db.prepare(
      'SELECT id, name, email, role FROM users WHERE group_id = ? ORDER BY name'
    ).all(id);
  },

  getChores(id) {
    return db.prepare(
      'SELECT * FROM chores WHERE group_id = ? ORDER BY name'
    ).all(id);
  },

  delete(id) {
    return db.prepare('DELETE FROM groups WHERE id = ?').run(id);
  }
};
