import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { gameCode, playerName } = await request.json();
    
    if (!gameCode || !playerName) {
      return NextResponse.json(
        { error: 'Game code and player name are required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Format the game code (uppercase, remove spaces)
    const formattedCode = gameCode.toUpperCase().replace(/\s/g, '');
    
    // Find the lobby with this code
    const { data: lobby, error: lobbyError } = await supabase
      .from('lobbies')
      .select('id')
      .eq('code', formattedCode)
      .single();
    
    if (lobbyError) {
      return NextResponse.json(
        { error: 'Invalid game code' },
        { status: 404 }
      );
    }
    
    // Create a new player in this lobby
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        lobby_id: lobby.id,
        name: playerName,
        is_host: false,
        score: 0,
      })
      .select()
      .single();
    
    if (playerError) {
      console.error('Error creating player:', playerError);
      return NextResponse.json(
        { error: 'Failed to join game' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        lobbyId: lobby.id,
        playerId: player.id,
        lobbyCode: formattedCode,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in join-game API:', error);
    return NextResponse.json(
      { error: 'Failed to join game' },
      { status: 500 }
    );
  }
}