import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
    const range = parseInt(searchParams.get('range') || '90', 10);

    // Calculate timestamp for N days ago
    const cutoffTime = Date.now() - range * 24 * 60 * 60 * 1000;

    const db = getDb();

    // Fetch all events with session data
    const eventsStmt = db.prepare(`
      SELECT
        e.id,
        e.type,
        e.properties,
        e.session_id,
        e.created_at,
        s.user_agent,
        s.referrer as session_referrer
      FROM events e
      LEFT JOIN sessions s ON e.session_id = s.id
      WHERE e.created_at >= ?
      ORDER BY e.created_at DESC
    `);

    const events = eventsStmt.all(cutoffTime) as Array<{
      id: string;
      type: string;
      properties: string;
      session_id: string | null;
      created_at: number;
      user_agent: string | null;
      session_referrer: string | null;
    }>;

    if (format === 'json') {
      // Return JSON array
      const jsonData = events.map(event => ({
        id: event.id,
        type: event.type,
        properties: JSON.parse(event.properties || '{}'),
        session_id: event.session_id,
        created_at: new Date(event.created_at).toISOString(),
        user_agent: event.user_agent,
        referrer: event.session_referrer,
      }));

      return NextResponse.json(jsonData, {
        headers: {
          'Content-Disposition': `attachment; filename="analytics-export-${new Date().toISOString().split('T')[0]}.json"`,
          'Content-Type': 'application/json',
        },
      });
    }

    // Default: CSV format
    const csvHeaders = [
      'id',
      'type',
      'path',
      'referrer',
      'session_id',
      'user_agent',
      'created_at',
    ];

    const csvRows = events.map(event => {
      const props = JSON.parse(event.properties || '{}');
      return [
        event.id,
        event.type,
        props.path || '',
        props.referrer || '',
        event.session_id || '',
        event.user_agent || '',
        new Date(event.created_at).toISOString(),
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows,
    ].join('\n');

    return NextResponse.json(csvContent, {
      headers: {
        'Content-Disposition': `attachment; filename="analytics-export-${new Date().toISOString().split('T')[0]}.csv"`,
        'Content-Type': 'text/csv',
      },
    });
  } catch (error) {
    console.error('Export endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
