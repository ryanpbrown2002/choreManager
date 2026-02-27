import express from 'express';
import { Group } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  try {
    const group = Group.findById(req.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

router.get('/members', (req, res) => {
  try {
    const members = Group.getMembers(req.groupId);
    members.forEach(member => delete member.password_hash);
    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

router.patch('/', requireAdmin, (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }
    if (name.length > 100) return res.status(400).json({ error: 'Group name must be 100 characters or less' });

    Group.update(req.groupId, { name });

    const updated = Group.findById(req.groupId);
    res.json(updated);
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

const ALLOWED_MESSAGE_KEYS = ['friendly', 'direct', 'urgent'];

router.patch('/notification-message', requireAdmin, (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !ALLOWED_MESSAGE_KEYS.includes(message)) {
      return res.status(400).json({ error: 'Invalid notification message selection' });
    }

    Group.updateNotificationMessage(req.groupId, message);

    const updated = Group.findById(req.groupId);
    res.json(updated);
  } catch (error) {
    console.error('Update notification message error:', error);
    res.status(500).json({ error: 'Failed to update notification message' });
  }
});

export default router;
