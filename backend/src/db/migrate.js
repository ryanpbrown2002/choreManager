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

console.log('Migrations completed successfully!');
