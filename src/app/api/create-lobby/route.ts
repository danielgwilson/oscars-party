import { NextRequest, NextResponse } from 'next/server';

// This is a vestigial route from the previous app version
// Use /api/create-game instead for creating new lobbies

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Use /api/create-game instead.',
      status: 'deprecated'
    },
    { status: 410 }
  );
}