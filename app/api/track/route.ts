import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Expected non-empty events array' },
        { status: 400 }
      );
    }

    const db = getDb();
    const stmt = db.prepare(
      'INSERT INTO events (id, type, properties, session_id, created_at) VALUES (?, ?, ?, ?, ?)'
    );

    const inserted = [];
    for (const event of events) {
      const { type, properties, session_id, created_at } = event;

      if (!type || !created_at) {
        continue; // Skip invalid events
      }

      try {
        stmt.run(
          randomUUID(),
          type,
          JSON.stringify(properties || {}),
          session_id || null,
          created_at
        );
        inserted.push(event);
      } catch (err) {
        console.error('Failed to insert event:', err);
      }
    }

    return NextResponse.json({ received: inserted.length });
  } catch (error) {
    console.error('Track endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
