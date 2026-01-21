# How to Restart the Application

## Important: Database Changes

The database schema has been updated to remove `points` and `description` fields from chores. You need to delete the old database and recreate it with the new schema.

## Step-by-Step Restart Instructions

### 1. Stop All Running Servers

If you have the backend or frontend running, stop them by pressing `Ctrl+C` in each terminal.

### 2. Delete the Old Database

```bash
# From the project root directory
rm backend/chore.db
rm backend/chore.db-shm 2>/dev/null
rm backend/chore.db-wal 2>/dev/null
```

Or manually delete these files if they exist:
- `backend/chore.db`
- `backend/chore.db-shm`
- `backend/chore.db-wal`

### 3. Restart the Backend

```bash
cd backend

# Install dependencies if you haven't already
npm install

# Create the database with the new schema
npm run migrate

# Start the backend server
npm run dev
```

The backend should now be running on http://localhost:3000

### 4. Restart the Frontend

In a **new terminal window**:

```bash
cd frontend

# Install dependencies if you haven't already
npm install

# Start the frontend development server
npm run dev
```

The frontend should now be running on http://localhost:5173

### 5. Test the Application

1. Open http://localhost:5173 in your browser
2. Register a new account (create a new group)
3. Try creating a chore - you'll notice:
   - No more "Description" field
   - No more "Points" field
   - Just name, frequency, and photo requirement
4. If you're an admin, you'll see:
   - "Assign Chores" section with manual assignment and rotate options

## What Changed

**Removed from chores:**
- Description field
- Points system

**Simplified chore form now has:**
- Chore name (required)
- Frequency (daily/weekly/biweekly/monthly)
- Photo verification checkbox

**New assignment features:**
- Manual assignment: Assign specific chores to specific people
- Rotate button: Automatically rotate all chores to the next person
- Delete assignments (admin only)
- Week view: Navigate between weeks to see past and future assignments
- Completion stats: Track completion by member and by chore

**Bug fixes:**
- Photo viewing now works correctly (fixed proxy configuration)

## Troubleshooting

**If the backend won't start:**
- Make sure you deleted the old database files
- Run `npm run migrate` again
- Check that port 3000 is not in use

**If the frontend won't start:**
- Make sure the backend is running first
- Check that port 5173 is not in use
- Try clearing your browser cache

**If you get database errors:**
- Stop both servers
- Delete all `.db` files in the backend folder
- Run `npm run migrate` again
- Restart both servers
