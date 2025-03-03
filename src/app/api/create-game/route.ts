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
    
    // Generate a unique 4-letter code
    let code = generateLobbyCode();
    let isUnique = false;
    
    while (!isUnique) {
      const { data } = await supabase
        .from('lobbies')
        .select('code')
        .eq('code', code)
        .single();
      
      if (!data) {
        isUnique = true;
      } else {
        code = generateLobbyCode();
      }
    }
    
    // Create the lobby
    const hostId = crypto.randomUUID();
    console.log('Creating lobby with code:', code, 'and host_id:', hostId);
    
    const { data: lobby, error: lobbyError } = await supabase
      .from('lobbies')
      .insert({
        code,
        host_id: hostId,
      })
      .select()
      .single();
    
    if (lobbyError) {
      console.error('Error creating lobby:', lobbyError);
      return NextResponse.json(
        { error: `Failed to create lobby: ${lobbyError.message}` },
        { status: 500 }
      );
    }
    
    console.log('Lobby created successfully:', lobby);
    
    // Create the host player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        lobby_id: lobby.id,
        name: hostName,
        is_host: true,
        score: 0,
      })
      .select()
      .single();
    
    if (playerError) {
      console.error('Error creating player:', playerError);
      // Clean up the created lobby
      await supabase.from('lobbies').delete().eq('id', lobby.id);
      return NextResponse.json(
        { error: 'Failed to create player' },
        { status: 500 }
      );
    }
    
    // Seed categories and nominees
    try {
      await fetch(`${request.nextUrl.origin}/api/seed-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lobbyId: lobby.id }),
      });
    } catch (seedError) {
      console.error('Error seeding data:', seedError);
      // Continue anyway, the main game is created
    }
    
    return NextResponse.json(
      {
        success: true,
        lobbyId: lobby.id,
        playerId: player.id,
        lobbyCode: code,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in create-game API:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}