import express from 'express';
import { Chore } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { generateId } from '../utils/index.js';

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  try {
    const chores = Chore.findByGroup(req.groupId);
    res.json(chores);
  } catch (error) {
    console.error('Get chores error:', error);
    res.status(500).json({ error: 'Failed to fetch chores' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const chore = Chore.findById(req.params.id);

    if (!chore) {
      return res.status(404).json({ error: 'Chore not found' });
    }

    if (chore.group_id !== req.groupId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(chore);
  } catch (error) {
    console.error('Get chore error:', error);
    res.status(500).json({ error: 'Failed to fetch chore' });
  }
});

router.post('/', requireAdmin, (req, res) => {
  try {
    const { name, frequency, requiresPhoto } = req.body;

    if (!name || !frequency) {
      return res.status(400).json({ error: 'Name and frequency are required' });
    }

    const validFrequencies = ['daily', 'weekly', 'biweekly', 'monthly'];
    if (!validFrequencies.includes(frequency)) {
      return res.status(400).json({ error: 'Invalid frequency' });
    }

    const choreId = generateId();
    Chore.create({
      id: choreId,
      groupId: req.groupId,
      name,
      frequency,
      requiresPhoto: requiresPhoto ? 1 : 0
    });

    const chore = Chore.findById(choreId);
    res.status(201).json(chore);
  } catch (error) {
    console.error('Create chore error:', error);
    res.status(500).json({ error: 'Failed to create chore' });
  }
});

router.patch('/:id', requireAdmin, (req, res) => {
  try {
    const chore = Chore.findById(req.params.id);

    if (!chore) {
      return res.status(404).json({ error: 'Chore not found' });
    }

    if (chore.group_id !== req.groupId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, frequency, requiresPhoto } = req.body;

    Chore.update(req.params.id, {
      name,
      frequency,
      requiresPhoto: requiresPhoto !== undefined ? (requiresPhoto ? 1 : 0) : undefined
    });

    const updated = Chore.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Update chore error:', error);
    res.status(500).json({ error: 'Failed to update chore' });
  }
});

router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const chore = Chore.findById(req.params.id);

    if (!chore) {
      return res.status(404).json({ error: 'Chore not found' });
    }

    if (chore.group_id !== req.groupId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    Chore.delete(req.params.id);
    res.json({ message: 'Chore deleted successfully' });
  } catch (error) {
    console.error('Delete chore error:', error);
    res.status(500).json({ error: 'Failed to delete chore' });
  }
});

export default router;
