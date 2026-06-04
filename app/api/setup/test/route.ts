import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();

    // Create a test event
    const testEvent = {
      id: randomUUID(),
      type: 'pageview',
      properties: JSON.stringify({
        path: '/test',
        referrer: 'direct',
        userAgent: 'Test-Agent/1.0',
      }),
      session_id: randomUUID(),
      created_at: Date.now(),
    };

    const stmt = db.prepare(
      'INSERT INTO events (id, type, properties, session_id, created_at) VALUES (?, ?, ?, ?, ?)'
    );

    stmt.run(
      testEvent.id,
      testEvent.type,
      testEvent.properties,
      testEvent.session_id,
      testEvent.created_at
    );

    // Verify the event was stored
    const verifyStmt = db.prepare('SELECT * FROM events WHERE id = ?');
    const stored = verifyStmt.get(testEvent.id) as any;

    if (stored) {
      return NextResponse.json({
        success: true,
        message: 'Test event created successfully',
        event: {
          id: stored.id,
          type: stored.type,
          created_at: stored.created_at,
        },
      });
    }

    return NextResponse.json(
      { error: 'Failed to verify test event' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Setup test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
