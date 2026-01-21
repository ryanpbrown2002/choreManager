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
       ORDER BY a.due_date ASC`
    ).all(userId);
  },

  findByChore(choreId) {
    return db.prepare(
      `SELECT a.*, u.name as user_name, u.email
       FROM assignments a
       JOIN users u ON a.user_id = u.id
       WHERE a.chore_id = ?
       ORDER BY a.assigned_date DESC`
    ).all(choreId);
  },

  findByGroup(groupId) {
    return db.prepare(
      `SELECT a.*, c.name as chore_name, c.requires_photo, u.name as user_name, u.email
       FROM assignments a
       JOIN chores c ON a.chore_id = c.id
       JOIN users u ON a.user_id = u.id
       WHERE c.group_id = ?
       ORDER BY a.due_date ASC`
    ).all(groupId);
  },

  findPending(userId) {
    return db.prepare(
      `SELECT a.*, c.name as chore_name, c.requires_photo
       FROM assignments a
       JOIN chores c ON a.chore_id = c.id
       WHERE a.user_id = ? AND a.status = 'pending'
       ORDER BY a.due_date ASC`
    ).all(userId);
  },

  findOverdue() {
    const now = Math.floor(Date.now() / 1000);
    return db.prepare(
      `SELECT a.*, c.name as chore_name, u.name as user_name, u.email
       FROM assignments a
       JOIN chores c ON a.chore_id = c.id
       JOIN users u ON a.user_id = u.id
       WHERE a.status = 'pending' AND a.due_date < ?`
    ).all(now);
  },

  create({ id, choreId, userId, assignedDate, dueDate }) {
    return db.prepare(
      `INSERT INTO assignments (id, chore_id, user_id, assigned_date, due_date)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, choreId, userId, assignedDate, dueDate);
  },

  complete(id, photoPath = null) {
    const completedAt = Math.floor(Date.now() / 1000);
    return db.prepare(
      `UPDATE assignments
       SET status = 'completed', completed_at = ?, photo_path = ?
       WHERE id = ?`
    ).run(completedAt, photoPath, id);
  },

  markOverdue(id) {
    return db.prepare(
      `UPDATE assignments SET status = 'overdue' WHERE id = ?`
    ).run(id);
  },

  delete(id) {
    return db.prepare('DELETE FROM assignments WHERE id = ?').run(id);
  }
};
