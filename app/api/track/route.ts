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

    // Validate array size to prevent memory issues
    if (events.length > 1000) {
      return NextResponse.json(
        { error: 'Too many events in batch (max 1000)' },
        { status: 413 }
      );
    }

    const db = getDb();
    const stmt = db.prepare(
      'INSERT INTO events (id, type, properties, session_id, created_at) VALUES (?, ?, ?, ?, ?)'
    );

    const inserted = [];
    const skipped = [];

    for (const event of events) {
      const { type, properties, session_id, created_at } = event;

      // Validate required fields
      if (!type || typeof type !== 'string') {
        skipped.push({ reason: 'missing_or_invalid_type', event });
        continue;
      }

      if (!created_at || typeof created_at !== 'number') {
        skipped.push({ reason: 'missing_or_invalid_created_at', event });
        continue;
      }

      // Validate timestamp is reasonable (not future, not too old)
      const now = Date.now();
      const maxFuture = 60 * 1000; // 1 minute in future allowed for clock drift
      const maxPast = 365 * 24 * 60 * 60 * 1000; // 1 year in past

      if (created_at > now + maxFuture || created_at < now - maxPast) {
        skipped.push({ reason: 'invalid_timestamp', event });
        continue;
      }

      try {
        stmt.run(
          randomUUID(),
          type,
          JSON.stringify(properties || {}),
          session_id || null,
          created_at
        );
        inserted.push({ type, created_at });
      } catch (err) {
        console.error('Failed to insert event:', err);
        skipped.push({ reason: 'database_error', error: err instanceof Error ? err.message : 'Unknown', event });
      }
    }

    // Log batch processing stats
    if (process.env.NODE_ENV === 'development') {
      console.log(`Track batch: ${inserted.length} inserted, ${skipped.length} skipped`);
    }

    return NextResponse.json({
      received: inserted.length,
      skipped: skipped.length,
      skipped_reasons: skipped.slice(0, 10) // Return first 10 skipped for debugging
    });
  } catch (error) {
    console.error('Track endpoint error:', error);

    // Handle JSON parse errors specifically
    if (error instanceof SyntaxError && 'message' in error && error.message.includes('JSON')) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
