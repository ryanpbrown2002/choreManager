import express from 'express';
import { Group, Assignment } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';

const router = express.Router();

router.use(authenticate);

router.post('/send', requireAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;
    const group = Group.findById(req.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const members = Group.getMembers(req.groupId);
    const targetMembers = userIds && userIds.length > 0
      ? members.filter(m => userIds.includes(m.id))
      : members;

    if (targetMembers.length === 0) {
      return res.status(400).json({ error: 'No members to notify' });
    }

    const messageTemplate = group.notification_message ||
      'Hey {name}, just a friendly reminder that you have chores to complete this week!';

    let sent = 0;
    let failed = 0;

    for (const member of targetMembers) {
      const pendingAssignments = Assignment.findPending(member.id);

      const personalMessage = messageTemplate.replace(/\{name\}/g, member.name);

      let choreListHtml = '';
      let choreListText = '';
      if (pendingAssignments.length > 0) {
        choreListHtml = '<ul>' +
          pendingAssignments.map(a => `<li>${a.chore_name}</li>`).join('') +
          '</ul>';
        choreListText = pendingAssignments.map(a => `- ${a.chore_name}`).join('\n');
      } else {
        choreListHtml = '<p><em>You have no pending chores right now!</em></p>';
        choreListText = 'You have no pending chores right now!';
      }

      try {
        await sendEmail({
          to: member.email,
          subject: `${group.name} - Chore Reminder`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${group.name}</h2>
              <p>${personalMessage}</p>
              <h3>Your pending chores:</h3>
              ${choreListHtml}
              <br>
              <p><a href="${process.env.APP_URL}" style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Open Chorho</a></p>
            </div>
          `,
          text: `${personalMessage}\n\nYour pending chores:\n${choreListText}\n\nOpen Chorho: ${process.env.APP_URL}`,
        });
        sent++;
      } catch (err) {
        console.error(`Failed to notify ${member.email}:`, err.message);
        failed++;
      }
    }

    res.json({ sent, failed });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

export default router;
