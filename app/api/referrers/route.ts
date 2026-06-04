import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = parseInt(searchParams.get('range') || '7', 10);

    const cutoffTime = Date.now() - range * 24 * 60 * 60 * 1000;
    const db = getDb();

    // Top referrers
    const referrersStmt = db.prepare(`
      SELECT
        json_extract(properties, '$.referrer') as referrer,
        COUNT(*) as count
      FROM events
      WHERE type = ? AND created_at >= ?
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 10
    `);

    const referrers = referrersStmt.all('pageview', cutoffTime) as Array<{
      referrer: string | null;
      count: number;
    }>;

    const formatted = referrers
      .filter(r => r.referrer && r.referrer !== 'direct')
      .map(r => {
        // Extract domain from referrer URL
        let domain = r.referrer;
        try {
          const url = new URL(r.referrer!); // Non-null asserted after filter
          domain = url.hostname;
        } catch {
          // Keep original if parsing fails
        }
        return {
          referrer: domain,
          count: r.count,
        };
      });

    return NextResponse.json({ referrers: formatted });
  } catch (error) {
    console.error('Referrers endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
