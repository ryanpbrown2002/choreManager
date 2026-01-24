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

// Secure photo serving endpoint - requires authentication and group membership
// Note: This endpoint accepts token via query param since <img> tags can't send headers
// Must be defined BEFORE router.use(authenticate) to handle auth manually
router.get('/photos/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const token = req.query.token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify the token and get user info
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
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
    if (assignment.group_id !== user.group_id) {
      return res.status(403).json({ error: 'Access denied' });
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
    const { weekStart } = req.body;

    if (!weekStart) {
      return res.status(400).json({ error: 'weekStart is required' });
    }

    const chores = Chore.findByGroup(req.groupId);
    const members = User.findByGroupInRotation(req.groupId);

    if (members.length === 0) {
      return res.status(400).json({ error: 'No members in rotation' });
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
