import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch current user from database to get up-to-date role
    const user = User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.userId = user.id;
    req.userRole = user.role; // Use current role from DB, not token
    req.groupId = user.group_id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireSameUser = (req, res, next) => {
  const targetUserId = req.params.id || req.params.userId;

  if (req.userId !== targetUserId && req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};
