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
    const { weekStart } = req.body;

    if (!weekStart) {
      return res.status(400).json({ error: 'weekStart is required' });
    }

    // Get chores ordered by order_num
    const chores = Chore.findByGroup(req.groupId);
    // Get members in rotation with their rotation_position
    const members = User.findByGroupInRotation(req.groupId);

    if (members.length === 0) {
      return res.status(400).json({ error: 'No members in rotation' });
    }

    if (chores.length === 0) {
      return res.status(400).json({ error: 'No chores to assign' });
    }

    const totalMembers = members.length;
    const numChores = chores.length;

    // Rotate all members: new_pos = (current_pos % total_members) + 1
    // Update each member's rotation_position in DB
    for (const member of members) {
      const currentPos = member.rotation_position || 1;
      const newPos = (currentPos % totalMembers) + 1;
      User.updateRotationPosition(member.id, newPos);
      member.rotation_position = newPos; // Update in-memory for assignment logic
    }

    const createdAssignments = [];

    // For each member with new_pos <= num_chores, assign chore at that position
    // Chores are ordered by order_num, so chore at index 0 has order_num 1, etc.
    for (const member of members) {
      const pos = member.rotation_position;
      if (pos <= numChores) {
        // Find the chore at this position (order_num = pos)
        const chore = chores.find(c => c.order_num === pos);
        if (chore) {
          const assignmentId = generateId();
          Assignment.create({
            id: assignmentId,
            choreId: chore.id,
            userId: member.id,
            weekStart
          });
          createdAssignments.push(Assignment.findById(assignmentId));
        }
      }
      // Members with pos > numChores get no assignment (they're "off")
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

export default router;
