import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Database path - configurable via env or default to .data directory
const DATA_DIR = join(process.cwd(), '.data');
const DB_PATH = process.env.DATABASE_PATH || join(DATA_DIR, 'analytics.db');

// Ensure .data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

let db: Database.Database | null = null;
let isInitializing = false;

export function getDb(): Database.Database {
  // Fast path: already initialized
  if (db) {
    return db;
  }

  // Prevent race condition with initialization flag
  if (isInitializing) {
    throw new Error('Database initialization in progress - retry shortly');
  }

  try {
    isInitializing = true;
    db = new Database(DB_PATH, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
    });
    db.pragma('journal_mode = WAL');
    initializeSchema(db);
    console.log('Database initialized:', DB_PATH);
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    db = null;
    throw new Error(`Failed to initialize database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    isInitializing = false;
  }
}

function initializeSchema(database: Database.Database) {
  // Events table
  database.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      properties TEXT,
      session_id TEXT,
      created_at INTEGER NOT NULL
    )
  `);

  // Sessions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      started_at INTEGER NOT NULL,
      user_agent TEXT,
      referrer TEXT
    )
  `);

  // Indexes for performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
    CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
  `);
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

// Cleanup old events to prevent unbounded database growth
export function cleanupOldData(daysToKeep: number = 90) {
  const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
  const db = getDb();

  const result = db.prepare('DELETE FROM events WHERE created_at < ?').run(cutoff);
  console.log(`Cleaned up ${result.changes} events older than ${daysToKeep} days`);

  // VACUUM to reclaim space after deletion
  try {
    db.exec('VACUUM');
    console.log('Database VACUUM completed');
  } catch (error) {
    console.error('Database VACUUM failed:', error);
  }

  return result.changes;
}
