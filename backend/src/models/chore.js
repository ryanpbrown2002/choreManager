import { db } from '../db/database.js';

export const Chore = {
  findById(id) {
    return db.prepare('SELECT * FROM chores WHERE id = ?').get(id);
  },

  findByGroup(groupId) {
    return db.prepare('SELECT * FROM chores WHERE group_id = ? ORDER BY name').all(groupId);
  },

  create({ id, groupId, name, frequency, requiresPhoto = 0 }) {
    return db.prepare(
      `INSERT INTO chores (id, group_id, name, frequency, requires_photo)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, groupId, name, frequency, requiresPhoto);
  },

  update(id, { name, frequency, requiresPhoto }) {
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (frequency !== undefined) {
      fields.push('frequency = ?');
      values.push(frequency);
    }
    if (requiresPhoto !== undefined) {
      fields.push('requires_photo = ?');
      values.push(requiresPhoto);
    }

    if (fields.length === 0) return;

    values.push(id);
    return db.prepare(
      `UPDATE chores SET ${fields.join(', ')} WHERE id = ?`
    ).run(...values);
  },

  delete(id) {
    return db.prepare('DELETE FROM chores WHERE id = ?').run(id);
  }
};
