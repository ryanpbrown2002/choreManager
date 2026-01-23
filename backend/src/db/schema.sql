-- Groups table (houses, dorms, co-ops)
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  invite_code TEXT UNIQUE NOT NULL
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'member')) DEFAULT 'member',
  in_rotation INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Chores table
CREATE TABLE IF NOT EXISTS chores (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  requires_photo INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Assignments table (rotating schedule)
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  chore_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  week_start INTEGER NOT NULL,
  completed_at INTEGER,
  photo_path TEXT,
  status TEXT NOT NULL CHECK(status IN ('pending', 'completed')) DEFAULT 'pending',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (chore_id) REFERENCES chores(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_group ON users(group_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_chores_group ON chores(group_id);
CREATE INDEX IF NOT EXISTS idx_assignments_chore ON assignments(chore_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_week_start ON assignments(week_start);
