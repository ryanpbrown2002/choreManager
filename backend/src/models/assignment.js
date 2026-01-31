import { db } from '../db/database.js';

export const Assignment = {
  findById(id) {
    return db.prepare('SELECT * FROM assignments WHERE id = ?').get(id);
  },

  findByUser(userId) {
    return db.prepare(
      `SELECT a.*, c.name as chore_name, c.requires_photo
       FROM assignments a
       JOIN chores c ON a.chore_id = c.id
       WHERE a.user_id = ?
       ORDER BY a.week_start ASC`
    ).all(userId);
  },

  findByChore(choreId) {
    return db.prepare(
      `SELECT a.*, u.name as user_name, u.email
       FROM assignments a
       JOIN users u ON a.user_id = u.id
       WHERE a.chore_id = ?
       ORDER BY a.week_start DESC`
    ).all(choreId);
  },

  findByGroup(groupId) {
    return db.prepare(
      `SELECT a.*, c.name as chore_name, c.requires_photo, c.order_num as chore_order, u.name as user_name, u.email
       FROM assignments a
       JOIN chores c ON a.chore_id = c.id
       JOIN users u ON a.user_id = u.id
       WHERE c.group_id = ?
       ORDER BY a.week_start ASC, c.order_num ASC`
    ).all(groupId);
  },

  findPending(userId) {
    return db.prepare(
      `SELECT a.*, c.name as chore_name, c.requires_photo
       FROM assignments a
       JOIN chores c ON a.chore_id = c.id
       WHERE a.user_id = ? AND a.status = 'pending'
       ORDER BY a.week_start ASC`
    ).all(userId);
  },

  create({ id, choreId, userId, weekStart }) {
    return db.prepare(
      `INSERT INTO assignments (id, chore_id, user_id, week_start)
       VALUES (?, ?, ?, ?)`
    ).run(id, choreId, userId, weekStart);
  },

  complete(id, photoPath = null) {
    const completedAt = Math.floor(Date.now() / 1000);
    return db.prepare(
      `UPDATE assignments
       SET status = 'completed', completed_at = ?, photo_path = ?
       WHERE id = ?`
    ).run(completedAt, photoPath, id);
  },

  reject(id) {
    return db.prepare(
      `UPDATE assignments
       SET status = 'pending', completed_at = NULL, photo_path = NULL
       WHERE id = ?`
    ).run(id);
  },

  delete(id) {
    return db.prepare('DELETE FROM assignments WHERE id = ?').run(id);
  },

  deleteByWeek(groupId, weekStart) {
    return db.prepare(
      `DELETE FROM assignments
       WHERE id IN (
         SELECT a.id FROM assignments a
         JOIN chores c ON a.chore_id = c.id
         WHERE c.group_id = ? AND a.week_start = ?
       )`
    ).run(groupId, weekStart);
  },

  findByPhotoPath(photoPath) {
    // Search for assignments where photo_path contains the filename
    // Handles both single path strings and JSON arrays
    return db.prepare(
      `SELECT a.*, c.group_id
       FROM assignments a
       JOIN chores c ON a.chore_id = c.id
       WHERE a.photo_path LIKE ?`
    ).get(`%${photoPath}%`);
  }
};
