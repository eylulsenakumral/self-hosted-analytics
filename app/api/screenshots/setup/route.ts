import { generateSetupWizardSVG } from '@/lib/screenshot-placeholders';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const step = parseInt(searchParams.get('step') || '1', 10);

  if (step < 1 || step > 4) {
    return NextResponse.json(
      { error: 'Step must be between 1 and 4' },
      { status: 400 }
    );
  }

  try {
    const svg = generateSetupWizardSVG(step);

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Screenshot generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate screenshot' },
      { status: 500 }
    );
  }
}