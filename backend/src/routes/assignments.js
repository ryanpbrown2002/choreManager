import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Assignment, Chore, User } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { generateId } from '../utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const MAX_PHOTOS = 3;

// Secure photo serving endpoint - uses short-lived photo tokens
// Must be defined BEFORE router.use(authenticate) to handle auth manually
router.get('/photos/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const token = req.query.token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify the short-lived photo token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Photo link expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify this is a photo token and matches the requested file
    if (decoded.type !== 'photo' || decoded.filename !== filename) {
      return res.status(403).json({ error: 'Token not valid for this photo' });
    }

    // Prevent directory traversal attacks
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    // Construct the file path and verify it exists
    const uploadsDir = resolve(__dirname, '../../uploads');
    const filePath = join(uploadsDir, filename);

    // Ensure the resolved path is still within the uploads directory (prevent traversal)
    if (!filePath.startsWith(uploadsDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'Photo file not found' });
    }

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Serve photo error:', error);
    res.status(500).json({ error: 'Failed to serve photo' });
  }
});

// All routes below require authentication
router.use(authenticate);

// Generate a short-lived token for photo access (5 minutes)
router.post('/photo-token', (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Prevent directory traversal attacks
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    // Find the assignment that contains this photo
    const assignment = Assignment.findByPhotoPath(filename);

    if (!assignment) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Verify the requesting user belongs to the same group
    if (assignment.group_id !== req.groupId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate a short-lived token (5 minutes) specifically for this photo
    const photoToken = jwt.sign(
      {
        type: 'photo',
        filename: filename,
        groupId: req.groupId
      },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    res.json({ token: photoToken });
  } catch (error) {
    console.error('Generate photo token error:', error);
    res.status(500).json({ error: 'Failed to generate photo token' });
  }
});

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

router.post('/:id/complete', upload.array('photos', MAX_PHOTOS), (req, res) => {
  try {
    const assignment = Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const isAdmin = req.userRole === 'admin';
    const isOwnAssignment = assignment.user_id === req.userId;

    if (!isOwnAssignment && !isAdmin) {
      return res.status(403).json({ error: 'Can only complete your own assignments' });
    }

    if (assignment.status === 'completed') {
      return res.status(400).json({ error: 'Assignment already completed' });
    }

    const chore = Chore.findById(assignment.chore_id);
    const hasPhotos = req.files && req.files.length > 0;

    // Only require photo for non-admin users completing their own chores
    if (chore.requires_photo && !hasPhotos && !isAdmin) {
      return res.status(400).json({ error: 'Photo verification required for this chore' });
    }

    // Store photo paths as JSON array for multiple photos, or null if none
    const photoPaths = hasPhotos ? JSON.stringify(req.files.map(f => f.path)) : null;
    Assignment.complete(req.params.id, photoPaths);

    const updated = Assignment.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Complete assignment error:', error);
    res.status(500).json({ error: 'Failed to complete assignment' });
  }
});

router.post('/:id/reject', requireAdmin, (req, res) => {
  try {
    const assignment = Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.status !== 'completed') {
      return res.status(400).json({ error: 'Can only reject completed assignments' });
    }

    Assignment.reject(req.params.id);

    const updated = Assignment.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Reject assignment error:', error);
    res.status(500).json({ error: 'Failed to reject assignment' });
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
    const { weekStart, previousWeekStart } = req.body;

    if (!weekStart || !previousWeekStart) {
      return res.status(400).json({ error: 'weekStart and previousWeekStart are required' });
    }

    // Get all chores ordered by order_num
    const chores = Chore.findByGroup(req.groupId);

    if (chores.length === 0) {
      return res.status(400).json({ error: 'No chores exist' });
    }

    // Get assignments from the previous week
    const allAssignments = Assignment.findByGroup(req.groupId);
    const previousWeekAssignments = allAssignments.filter(a => a.week_start === previousWeekStart);

    if (previousWeekAssignments.length === 0) {
      return res.status(400).json({
        error: 'No chores assigned in previous week, rotate not available',
        code: 'NO_PREVIOUS_ASSIGNMENTS'
      });
    }

    // Build a map of chore_id -> order_num for quick lookup
    const choreOrderMap = {};
    chores.forEach(c => {
      choreOrderMap[c.id] = c.order_num;
    });

    // Get the chores that were assigned last week (by order_num), sorted
    const previousChoreOrders = previousWeekAssignments
      .map(a => choreOrderMap[a.chore_id])
      .filter(order => order !== undefined)
      .sort((a, b) => a - b);

    if (previousChoreOrders.length === 0) {
      return res.status(400).json({
        error: 'Previous week chores no longer exist',
        code: 'NO_PREVIOUS_ASSIGNMENTS'
      });
    }

    // Find min and max order_num from previous week's chores
    const minOrder = Math.min(...previousChoreOrders);
    const maxOrder = Math.max(...previousChoreOrders);

    const createdAssignments = [];

    // For each assignment from previous week, move user to next chore
    for (const prevAssignment of previousWeekAssignments) {
      const currentChoreOrder = choreOrderMap[prevAssignment.chore_id];

      if (currentChoreOrder === undefined) {
        // Chore was deleted, skip this user
        continue;
      }

      // Calculate next chore order: if at max, wrap to min; otherwise go to next
      let nextChoreOrder;
      if (currentChoreOrder >= maxOrder) {
        nextChoreOrder = minOrder;
      } else {
        // Find the next order_num that exists in the previous week's chores
        const higherOrders = previousChoreOrders.filter(o => o > currentChoreOrder);
        nextChoreOrder = higherOrders.length > 0 ? Math.min(...higherOrders) : minOrder;
      }

      // Find the chore with this order_num
      const nextChore = chores.find(c => c.order_num === nextChoreOrder);

      if (nextChore) {
        const assignmentId = generateId();
        Assignment.create({
          id: assignmentId,
          choreId: nextChore.id,
          userId: prevAssignment.user_id,
          weekStart
        });
        createdAssignments.push(Assignment.findById(assignmentId));
      }
    }

    res.json({
      message: 'Chores rotated successfully',
      assignments: createdAssignments
    });
  } catch (error) {
    console.error('Rotate assignments error:', error);
    res.status(500).json({ error: 'Failed to rotate assignments' });
  }
});

// Delete all assignments for a specific week
router.delete('/week/:weekStart', requireAdmin, (req, res) => {
  try {
    const weekStart = parseInt(req.params.weekStart, 10);

    if (isNaN(weekStart)) {
      return res.status(400).json({ error: 'Invalid weekStart' });
    }

    const deleted = Assignment.deleteByWeek(req.groupId, weekStart);

    res.json({
      message: 'Assignments deleted successfully',
      deletedCount: deleted.changes
    });
  } catch (error) {
    console.error('Delete week assignments error:', error);
    res.status(500).json({ error: 'Failed to delete assignments' });
  }
});

export default router;
