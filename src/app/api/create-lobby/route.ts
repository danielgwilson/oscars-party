import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateLobbyCode } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { hostName } = await request.json();
    
    if (!hostName) {
      return NextResponse.json(
        { error: 'Host name is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Generate a code
    const code = generateLobbyCode();
    console.log('Generated code:', code);
    
    // Insert simple values (minimal approach to identify issues)
    const { data: lobby, error: lobbyError } = await supabase
      .from('lobbies')
      .insert({
        code: code,
        host_id: 'test-host-id', // Simplified ID for testing
      })
      .select()
      .single();
    
    if (lobbyError) {
      console.error('Lobby creation error:', lobbyError);
      return NextResponse.json(
        { error: `Error creating lobby: ${lobbyError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      code: code,
      lobbyId: lobby.id,
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}