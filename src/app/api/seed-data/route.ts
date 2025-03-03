import { NextRequest, NextResponse } from 'next/server';

// This endpoint is no longer needed as the app has been pivoted from 
// an Oscars prediction game to a movie trivia game.
// It was used to seed categories and nominees for predictions.

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. The app has been pivoted to a movie trivia game.',
      status: 'deprecated'
    },
    { status: 410 }
  );
}
