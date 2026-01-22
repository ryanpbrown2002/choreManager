import express from 'express';
import multer from 'multer';
import { Assignment, Chore, User } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { generateId } from '../utils/index.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + generateId();
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.use(authenticate);

router.get('/all', (req, res) => {
  try {
    const assignments = Assignment.findByGroup(req.groupId);
    res.json(assignments);
  } catch (error) {
    console.error('Get all assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

router.get('/my', (req, res) => {
  try {
    const assignments = Assignment.findByUser(req.userId);
    res.json(assignments);
  } catch (error) {
    console.error('Get user assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

router.get('/pending', (req, res) => {
  try {
    const assignments = Assignment.findPending(req.userId);
    res.json(assignments);
  } catch (error) {
    console.error('Get pending assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch pending assignments' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const assignment = Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.user_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

router.post('/', requireAdmin, (req, res) => {
  try {
    const { choreId, userId, weekStart } = req.body;

    if (!choreId || !userId || !weekStart) {
      return res.status(400).json({ error: 'choreId, userId, and weekStart are required' });
    }

    const chore = Chore.findById(choreId);
    if (!chore) {
      return res.status(404).json({ error: 'Chore not found' });
    }

    if (chore.group_id !== req.groupId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const assignmentId = generateId();
    Assignment.create({
      id: assignmentId,
      choreId,
      userId,
      weekStart
    });

    const assignment = Assignment.findById(assignmentId);
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

router.post('/:id/complete', upload.single('photo'), (req, res) => {
  try {
    const assignment = Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Can only complete your own assignments' });
    }

    if (assignment.status === 'completed') {
      return res.status(400).json({ error: 'Assignment already completed' });
    }

    const chore = Chore.findById(assignment.chore_id);

    if (chore.requires_photo && !req.file) {
      return res.status(400).json({ error: 'Photo verification required for this chore' });
    }

    const photoPath = req.file ? req.file.path : null;
    Assignment.complete(req.params.id, photoPath);

    const updated = Assignment.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Complete assignment error:', error);
    res.status(500).json({ error: 'Failed to complete assignment' });
  }
});

router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const assignment = Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    Assignment.delete(req.params.id);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

router.post('/rotate', requireAdmin, (req, res) => {
  try {
    const { weekStart } = req.body;

    if (!weekStart) {
      return res.status(400).json({ error: 'weekStart is required' });
    }

    const chores = Chore.findByGroup(req.groupId);
    const members = User.findByGroup(req.groupId);

    if (members.length === 0) {
      return res.status(400).json({ error: 'No members in group' });
    }

    if (chores.length === 0) {
      return res.status(400).json({ error: 'No chores to assign' });
    }

    const currentAssignments = Assignment.findByGroup(req.groupId);

    // Build a map of chore -> last assigned user (most recent assignment)
    const choreToLastUser = {};
    currentAssignments.forEach(assignment => {
      if (!choreToLastUser[assignment.chore_id]) {
        choreToLastUser[assignment.chore_id] = assignment.user_id;
      }
    });

    const createdAssignments = [];

    chores.forEach((chore) => {
      // Find the last person assigned to this chore
      const lastUserId = choreToLastUser[chore.id];
      const lastUserIndex = members.findIndex(m => m.id === lastUserId);

      // Rotate to the next person (or start at 0 if no previous assignment)
      const nextUserIndex = lastUserIndex === -1 ? 0 : (lastUserIndex + 1) % members.length;
      const nextUser = members[nextUserIndex];

      // Create new assignment for the specified week
      const assignmentId = generateId();
      Assignment.create({
        id: assignmentId,
        choreId: chore.id,
        userId: nextUser.id,
        weekStart
      });

      createdAssignments.push(Assignment.findById(assignmentId));
    });

    res.json({
      message: 'Chores rotated successfully',
      assignments: createdAssignments
    });
  } catch (error) {
    console.error('Rotate assignments error:', error);
    res.status(500).json({ error: 'Failed to rotate assignments' });
  }
});

export default router;
