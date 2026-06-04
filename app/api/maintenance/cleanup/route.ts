import { NextResponse } from 'next/server';
import { cleanupOldData } from '@/lib/db';

/**
 * Maintenance endpoint to clean up old events
 * Call this periodically (e.g., weekly cron) to prevent unbounded database growth
 *
 * Example: POST /api/maintenance/cleanup?days=90
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const daysParam = url.searchParams.get('days');
    const daysToKeep = daysParam ? parseInt(daysParam, 10) : 90;

    if (daysToKeep < 1 || daysToKeep > 365) {
      return NextResponse.json(
        { error: 'days parameter must be between 1 and 365' },
        { status: 400 }
      );
    }

    const deletedCount = cleanupOldData(daysToKeep);

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} events older than ${daysToKeep} days`,
      deletedCount,
      daysToKeep,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
