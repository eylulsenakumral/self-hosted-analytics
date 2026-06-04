import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = parseInt(searchParams.get('range') || '7', 10);

    const cutoffTime = Date.now() - range * 24 * 60 * 60 * 1000;
    const db = getDb();

    // Top pages with view counts and unique visitors
    const pagesStmt = db.prepare(`
      SELECT
        json_extract(properties, '$.path') as path,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM events
      WHERE type = ? AND created_at >= ?
      GROUP BY path
      ORDER BY views DESC
      LIMIT 20
    `);

    const pages = pagesStmt.all('pageview', cutoffTime) as Array<{
      path: string | null;
      views: number;
      unique_visitors: number;
    }>;

    const formatted = pages
      .filter(p => p.path)
      .map(p => ({
        path: p.path,
        views: p.views,
        uniqueVisitors: p.unique_visitors,
      }));

    return NextResponse.json({ pages: formatted });
  } catch (error) {
    console.error('Pages endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
