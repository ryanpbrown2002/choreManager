import { db } from './database.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schemaPath = join(__dirname, 'schema.sql');
const schema = readFileSync(schemaPath, 'utf-8');

const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

console.log('Running database migrations...');

for (const statement of statements) {
  try {
    db.exec(statement);
  } catch (error) {
    console.error('Migration error:', error.message);
    throw error;
  }
}

// Add in_rotation column if it doesn't exist (for existing databases)
try {
  const columns = db.prepare("PRAGMA table_info(users)").all();
  const hasInRotation = columns.some(col => col.name === 'in_rotation');
  if (!hasInRotation) {
    console.log('Adding in_rotation column to users table...');
    db.exec('ALTER TABLE users ADD COLUMN in_rotation INTEGER NOT NULL DEFAULT 1');
  }
} catch (error) {
  console.error('Migration error adding in_rotation:', error.message);
}

// Add order_num column to chores if it doesn't exist
try {
  const choreColumns = db.prepare("PRAGMA table_info(chores)").all();
  const hasOrderNum = choreColumns.some(col => col.name === 'order_num');
  if (!hasOrderNum) {
    console.log('Adding order_num column to chores table...');
    db.exec('ALTER TABLE chores ADD COLUMN order_num INTEGER');

    // Initialize existing chores with sequential order numbers (alphabetical order within each group)
    console.log('Initializing order_num for existing chores...');
    const groups = db.prepare('SELECT DISTINCT group_id FROM chores').all();
    for (const group of groups) {
      const chores = db.prepare('SELECT id FROM chores WHERE group_id = ? ORDER BY name').all(group.group_id);
      chores.forEach((chore, index) => {
        db.prepare('UPDATE chores SET order_num = ? WHERE id = ?').run(index + 1, chore.id);
      });
    }
  }
} catch (error) {
  console.error('Migration error adding order_num:', error.message);
}

// Add rotation_position column to users if it doesn't exist
try {
  const userColumns = db.prepare("PRAGMA table_info(users)").all();
  const hasRotationPosition = userColumns.some(col => col.name === 'rotation_position');
  if (!hasRotationPosition) {
    console.log('Adding rotation_position column to users table...');
    db.exec('ALTER TABLE users ADD COLUMN rotation_position INTEGER');

    // Initialize existing users with sequential positions (alphabetical order within each group)
    console.log('Initializing rotation_position for existing users...');
    const groups = db.prepare('SELECT DISTINCT group_id FROM users').all();
    for (const group of groups) {
      const users = db.prepare('SELECT id FROM users WHERE group_id = ? AND in_rotation = 1 ORDER BY name').all(group.group_id);
      users.forEach((user, index) => {
        db.prepare('UPDATE users SET rotation_position = ? WHERE id = ?').run(index + 1, user.id);
      });
    }
  }
} catch (error) {
  console.error('Migration error adding rotation_position:', error.message);
}

console.log('Migrations completed successfully!');
