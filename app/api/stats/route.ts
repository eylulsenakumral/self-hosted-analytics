import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = parseInt(searchParams.get('range') || '7', 10);

    // Calculate timestamp for N days ago
    const cutoffTime = Date.now() - range * 24 * 60 * 60 * 1000;

    const db = getDb();

    // Total page views
    const pageViewsStmt = db.prepare(
      'SELECT COUNT(*) as count FROM events WHERE type = ? AND created_at >= ?'
    );
    const pageViewsResult = pageViewsStmt.get('pageview', cutoffTime) as { count: number };
    const pageViews = pageViewsResult.count;

    // Unique visitors (unique session IDs)
    const visitorsStmt = db.prepare(
      'SELECT COUNT(DISTINCT session_id) as count FROM events WHERE type = ? AND created_at >= ? AND session_id IS NOT NULL'
    );
    const visitorsResult = visitorsStmt.get('pageview', cutoffTime) as { count: number };
    const uniqueVisitors = visitorsResult.count;

    // Active sessions (sessions with activity in last 30 minutes)
    const recentCutoff = Date.now() - 30 * 60 * 1000;
    const sessionsStmt = db.prepare(
      'SELECT COUNT(DISTINCT session_id) as count FROM events WHERE created_at >= ? AND session_id IS NOT NULL'
    );
    const sessionsResult = sessionsStmt.get(recentCutoff) as { count: number };
    const activeSessions = sessionsResult.count;

    // Daily breakdown for chart
    const dailyStmt = db.prepare(`
      SELECT
        DATE(created_at / 1000, 'unixepoch', 'localtime') as date,
        COUNT(*) as count
      FROM events
      WHERE type = ? AND created_at >= ?
      GROUP BY date
      ORDER BY date ASC
    `);
    const dailyData = dailyStmt.all('pageview', cutoffTime) as Array<{ date: string; count: number }>;

    return NextResponse.json({
      pageViews,
      uniqueVisitors,
      activeSessions,
      daily: dailyData.map(d => ({
        date: d.date,
        views: d.count,
      })),
    });
  } catch (error) {
    console.error('Stats endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
