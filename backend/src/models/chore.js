import { db } from '../db/database.js';

export const Chore = {
  findById(id) {
    return db.prepare('SELECT * FROM chores WHERE id = ?').get(id);
  },

  findByGroup(groupId) {
    return db.prepare('SELECT * FROM chores WHERE group_id = ? ORDER BY order_num, name').all(groupId);
  },

  getMaxOrderNum(groupId) {
    const result = db.prepare('SELECT MAX(order_num) as max_order FROM chores WHERE group_id = ?').get(groupId);
    return result?.max_order || 0;
  },

  create({ id, groupId, name, frequency, requiresPhoto = 0, orderNum }) {
    // Auto-calculate orderNum if not provided
    const finalOrderNum = orderNum ?? (this.getMaxOrderNum(groupId) + 1);
    return db.prepare(
      `INSERT INTO chores (id, group_id, name, frequency, requires_photo, order_num)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, groupId, name, frequency, requiresPhoto, finalOrderNum);
  },

  update(id, { name, frequency, requiresPhoto, orderNum }) {
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
    if (orderNum !== undefined) {
      fields.push('order_num = ?');
      values.push(orderNum);
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
