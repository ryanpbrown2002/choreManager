import express from 'express';
import jwt from 'jsonwebtoken';
import { User, Group } from '../models/index.js';
import { generateId, generateInviteCode } from '../utils/index.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, groupName, inviteCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    let groupId;
    let role = 'member';

    if (inviteCode) {
      const group = Group.findByInviteCode(inviteCode);
      if (!group) {
        return res.status(400).json({ error: 'Invalid invite code' });
      }
      groupId = group.id;
    } else if (groupName) {
      groupId = generateId();
      const newInviteCode = generateInviteCode();
      Group.create({ id: groupId, name: groupName, inviteCode: newInviteCode });
      role = 'admin';
    } else {
      return res.status(400).json({ error: 'Either groupName or inviteCode is required' });
    }

    const userId = generateId();
    await User.create({ id: userId, groupId, name, email, password, role });

    const token = jwt.sign(
      { userId, role, groupId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const user = User.findById(userId);
    delete user.password_hash;

    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await User.verifyPassword(user, password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, groupId: user.group_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete user.password_hash;

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
