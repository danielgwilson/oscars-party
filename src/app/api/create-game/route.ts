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
        game_stage: 'lobby', // Initialize with lobby stage
        config: { question_count: 10, time_limit: 20 } // Default game config
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
        streak: 0,
        correct_answers: 0,
        incorrect_answers: 0,
        has_been_roasted: false
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
    
    // Seed data is no longer needed for the movie trivia game
    // We'll generate trivia later when players submit their favorite movies
    
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