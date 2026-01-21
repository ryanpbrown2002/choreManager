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

console.log('Migrations completed successfully!');
