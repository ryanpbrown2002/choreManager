import express from 'express';
import jwt from 'jsonwebtoken';
import { User, Group, PasswordReset } from '../models/index.js';
import { generateId, generateInviteCode } from '../utils/index.js';
import { sendEmail } from '../services/email.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, groupName, inviteCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (name.length > 100) return res.status(400).json({ error: 'Name must be 100 characters or less' });
    if (email.length > 254) return res.status(400).json({ error: 'Email must be 254 characters or less' });
    if (password.length > 128) return res.status(400).json({ error: 'Password must be 128 characters or less' });
    if (groupName && groupName.length > 100) return res.status(400).json({ error: 'Group name must be 100 characters or less' });

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
    if (email.length > 254) return res.status(400).json({ error: 'Email must be 254 characters or less' });
    if (password.length > 128) return res.status(400).json({ error: 'Password must be 128 characters or less' });

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

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const genericMessage = 'If that email is registered, a reset link has been sent.';

    const user = User.findByEmail(email);
    if (!user) {
      return res.json({ message: genericMessage });
    }

    const rawToken = PasswordReset.create(user.id);
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${rawToken}`;
    const safeName = user.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    await sendEmail({
      to: user.email,
      subject: 'Chorho - Password Reset',
      html: `
        <h2>Password Reset</h2>
        <p>Hi ${safeName},</p>
        <p>You requested a password reset for your Chorho account.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
      text: `Hi ${user.name},\n\nYou requested a password reset. Visit this link to reset your password:\n\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`,
    });

    res.json({ message: genericMessage });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (newPassword.length > 128) return res.status(400).json({ error: 'Password must be 128 characters or less' });

    const resetRecord = PasswordReset.findValidToken(token);
    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    await User.updatePassword(resetRecord.user_id, newPassword);
    PasswordReset.markUsed(resetRecord.id);

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
