# New Features Summary

## 1. Week-Based View

The app now uses a **fixed week view** that shows all chores for a specific week.

### Features:
- **Week Navigator**: Navigate between weeks using Previous/Next buttons
- **Current Week Indicator**: Jump back to the current week easily
- **Week Range Display**: Shows the date range for the selected week (e.g., "Jan 14 - Jan 20, 2026")
- **Filtered Assignments**: Only shows assignments due within the selected week

### How to Use:
1. The dashboard defaults to showing the current week
2. Click "Previous Week" or "Next Week" to navigate
3. Click "Jump to Current Week" to return to today's week
4. All assignments are filtered to show only those due in the selected week

## 2. Completion Tracking & Statistics

Track how well members and chores are being completed.

### By Member View:
- Total assignments given to each member
- Completed, pending, and overdue counts
- Completion rate percentage with visual progress bar
- Members sorted by completion rate (highest first)

### By Chore View:
- Total times each chore has been assigned
- Completed, pending, and overdue counts
- Completion rate percentage with visual progress bar
- Chores sorted by completion rate (highest first)

### How to Use:
1. Scroll to the "Completion Stats" section
2. Toggle between "By Member" and "By Chore" views
3. View detailed statistics for each member or chore
4. Use the completion rate to identify:
   - Top performers
   - Chores that need attention
   - Members who may need help

## 3. Photo Verification (Fixed)

Photo viewing now works correctly!

### What Was Fixed:
- Added proxy configuration for `/uploads` route
- Photos submitted with completed chores can now be viewed

### How to Use:
1. When marking a chore as complete, upload a photo (if required)
2. After submission, a "View Photo" link appears in the Actions column
3. Click the link to open the photo in a new tab

## 4. Manual Assignment & Rotation

Admins can now assign chores in two ways:

### Manual Assignment:
- Choose specific chore
- Choose specific member
- Set custom due date (days from now)

### Automatic Rotation:
- Rotates ALL chores at once
- Smart rotation: assigns each chore to the next person in sequence
- Automatically calculates due dates based on frequency:
  - Daily: 1 day
  - Weekly: 7 days
  - Biweekly: 14 days
  - Monthly: 30 days

### How to Use:

**Manual Assignment:**
1. Click "Manual Assignment" button
2. Select chore, member, and days until due
3. Click "Create Assignment"

**Rotation:**
1. Click "Rotate All Chores" button
2. Confirm the action
3. System creates new assignments for all chores

## 5. Member Management (Admin Only)

Admins can now manage member roles and remove members from the group.

### Edit Member Role:
- Change any member between "admin" and "member" roles
- Simply click the role dropdown for any member (except yourself)
- Changes take effect immediately
- Cannot demote yourself (prevents accidental lockout)

### Delete Member:
- Remove members from the group entirely
- Click "Delete" button next to any member (except yourself)
- Confirms before deletion
- Cannot delete yourself

### Restrictions:
- Only admins see role editing and delete options
- Cannot edit your own role (prevents accidental demotion)
- Cannot delete yourself (prevents accidental lockout)
- Deleting a member also deletes their assignments

## Dashboard Layout

The dashboard is now focused on weekly assignments and tracking:

1. **Group Header** - Group name and welcome message
2. **Assign Chores** - Admin-only section for manual/automatic assignment
3. **Week Navigator** - Navigate between weeks
4. **Chore Assignments This Week** - Filtered assignments table
5. **Completion Stats** - Toggle between member and chore statistics

## Settings Page Layout

Management features have been moved to Settings:

1. **Profile** - Your name, email, and role
2. **Group Information** - Group name and invite code
3. **Members** - View and manage members (admin: edit roles, delete members)
4. **Chores** - View and manage chores (admin: create, edit, delete chores)

## Tips for Usage

### For Admins:
- **Dashboard**: Use "Rotate All Chores" at the start of each week
- **Dashboard**: Monitor completion stats to identify issues
- **Dashboard**: Navigate to previous weeks to review past performance
- **Dashboard**: Delete incorrect assignments if needed
- **Settings**: Manage chores (create, edit, delete)
- **Settings**: Manage members (promote to admin, delete from group)
- **Settings**: View and share the invite code

### For Members:
- **Dashboard**: Check current week for your assignments (highlighted in blue)
- **Dashboard**: Mark chores complete with photos when required
- **Dashboard**: Navigate to past weeks to see your history
- **Dashboard**: Check completion stats to see your performance
- **Settings**: View all members and chores (read-only)
- **Settings**: Check your profile and the invite code

### For Everyone:
- **Dashboard**: Week view shows what's due THIS WEEK only
- **Dashboard**: Previous/Next buttons let you review past weeks or plan ahead
- **Dashboard**: Completion stats help track accountability
- **Dashboard**: Photos provide proof of completion
- **Settings**: Management and configuration in one place
