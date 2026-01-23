import express from 'express';
import { User } from '../models/index.js';
import { authenticate, requireSameUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/me', (req, res) => {
  try {
    const user = User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    delete user.password_hash;
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.get('/:id', requireSameUser, (req, res) => {
  try {
    const user = User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.group_id !== req.groupId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    delete user.password_hash;
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.patch('/:id', requireSameUser, (req, res) => {
  try {
    const { name, email } = req.body;
    const user = User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.group_id !== req.groupId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    User.update(req.params.id, { name, email });

    const updated = User.findById(req.params.id);
    delete updated.password_hash;

    res.json(updated);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.patch('/:id/password', requireSameUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    const user = User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await User.verifyPassword(user, currentPassword);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    await User.updatePassword(req.params.id, newPassword);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

router.patch('/:id/role', requireAdmin, (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Valid role required (admin or member)' });
    }

    const user = User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.group_id !== req.groupId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Prevent admin from demoting themselves
    if (user.id === req.userId && role === 'member') {
      return res.status(400).json({ error: 'Cannot demote yourself' });
    }

    User.updateRole(req.params.id, role);

    const updated = User.findById(req.params.id);
    delete updated.password_hash;

    res.json(updated);
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

router.patch('/:id/rotation', requireAdmin, (req, res) => {
  try {
    const { inRotation } = req.body;

    if (typeof inRotation !== 'boolean') {
      return res.status(400).json({ error: 'inRotation must be a boolean' });
    }

    const user = User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.group_id !== req.groupId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    User.updateInRotation(req.params.id, inRotation);

    const updated = User.findById(req.params.id);
    delete updated.password_hash;

    res.json(updated);
  } catch (error) {
    console.error('Update rotation error:', error);
    res.status(500).json({ error: 'Failed to update rotation status' });
  }
});

router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const user = User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.group_id !== req.groupId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.userId) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    User.delete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
