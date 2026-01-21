# Setup Instructions

## Prerequisites
- Node.js (v18 or higher)
- npm

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Edit the `.env` file and set your configuration values (especially `JWT_SECRET`)

5. Run database migrations:
```bash
npm run migrate
```

6. Start the development server:
```bash
npm run dev
```

The backend will run on http://localhost:3000

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on http://localhost:5173

## Getting Started

1. Open http://localhost:5173 in your browser
2. Click "Register" to create a new account
3. Choose "Create Group" to start a new group (you'll be the admin)
4. Share the invite code with your housemates (found in Settings)
5. The main dashboard shows:
   - Assignment manager (admins can assign/rotate chores)
   - Week navigator (view past and future weeks)
   - Weekly assignments table (all assignments for the selected week)
   - Completion stats (track performance by member or chore)
6. The Settings page contains:
   - Profile information
   - Group information and invite code
   - Members management (view all, admins can edit/delete)
   - Chores management (view all, admins can create/edit/delete)
7. Members can mark their own assignments as complete with photo verification
8. Everyone sees the same information, but only admins can manage chores and members

## Project Structure

```
chore/
├── backend/           # Express + SQLite backend
│   ├── src/
│   │   ├── db/       # Database setup and migrations
│   │   ├── models/   # Data models
│   │   ├── routes/   # API routes
│   │   ├── middleware/ # Auth middleware
│   │   └── utils/    # Utility functions
│   └── uploads/      # Photo uploads
├── frontend/         # React + Vite frontend
│   └── src/
│       ├── components/ # Reusable components
│       ├── pages/      # Page components
│       ├── hooks/      # Custom hooks
│       └── api/        # API client
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `PATCH /api/users/:id/password` - Update password
- `PATCH /api/users/:id/role` - Update user role (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Groups
- `GET /api/groups` - Get current user's group
- `GET /api/groups/members` - Get group members
- `PATCH /api/groups` - Update group (admin only)

### Chores
- `GET /api/chores` - Get all chores
- `GET /api/chores/:id` - Get chore by ID
- `POST /api/chores` - Create chore (admin only)
- `PATCH /api/chores/:id` - Update chore (admin only)
- `DELETE /api/chores/:id` - Delete chore (admin only)

### Assignments
- `GET /api/assignments/all` - Get all assignments for the group
- `GET /api/assignments/my` - Get user's assignments
- `GET /api/assignments/pending` - Get pending assignments
- `GET /api/assignments/:id` - Get assignment by ID
- `POST /api/assignments` - Create assignment manually (admin only)
- `POST /api/assignments/rotate` - Rotate all chores to next person (admin only)
- `POST /api/assignments/:id/complete` - Mark assignment complete (with photo upload)
- `DELETE /api/assignments/:id` - Delete assignment (admin only)
