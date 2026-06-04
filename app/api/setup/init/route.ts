import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { existsSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const dbPath = process.env.DATABASE_PATH || join(process.cwd(), '.data', 'analytics.db');

    // Check if database already exists
    if (existsSync(dbPath)) {
      return NextResponse.json({
        success: true,
        message: 'Database already initialized',
        exists: true,
      });
    }

    // Initialize database by calling getDb()
    const db = getDb();

    // Verify tables were created
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as Array<{ name: string }>;

    if (tables.some((t) => t.name === 'events')) {
      return NextResponse.json({
        success: true,
        message: 'Database initialized successfully',
        exists: false,
      });
    }

    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Setup init error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const dbPath = process.env.DATABASE_PATH || join(process.cwd(), '.data', 'analytics.db');
  const exists = existsSync(dbPath);

  return NextResponse.json({
    initialized: exists,
    path: dbPath,
  });
}
