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
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.groupId = decoded.groupId;
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
