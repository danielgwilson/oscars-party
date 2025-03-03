import { NextRequest, NextResponse } from 'next/server';

// This route is vestigial from the previous Oscars prediction app
// In the new movie trivia app, scores are updated directly when players answer questions

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Scores are now updated directly when players answer questions.',
      status: 'deprecated'
    },
    { status: 410 }
  );
}
