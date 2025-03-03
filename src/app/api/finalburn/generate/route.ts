import { createRouteHandlerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Database } from '@/types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lobbyId } = body;
    
    if (!lobbyId) {
      return NextResponse.json(
        { error: 'Lobby ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get all players in the lobby
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('lobby_id', lobbyId)
      .order('score', { ascending: true });
      
    if (playersError || !players || players.length === 0) {
      return NextResponse.json(
        { error: 'Failed to fetch players' },
        { status: 500 }
      );
    }
    
    // The worst player is the one with the lowest score
    const worstPlayer = players[0];
    
    // Get all answers from the lobby
    const { data: allAnswers, error: answersError } = await supabase
      .from('answers')
      .select('*, questions(*)')
      .in(
        'player_id',
        players.map(p => p.id)
      );
      
    if (answersError) {
      console.error('Error fetching answers:', answersError);
    }
    
    // Get favorite movies for context
    const { data: favoriteMovies, error: favoritesError } = await supabase
      .from('favorite_movies')
      .select('*')
      .in(
        'player_id',
        players.map(p => p.id)
      );
      
    if (favoritesError) {
      console.error('Error fetching favorite movies:', favoritesError);
    }
    
    // In a real implementation, this would call OpenAI to generate a grand final burn
    // For now, we'll generate a mock burn
    const burnContent = generateMockFinalBurn(
      worstPlayer,
      players,
      allAnswers || [],
      favoriteMovies || []
    );
    
    // Create shame list for the worst performers
    const worstAnswers = (allAnswers || [])
      .filter(a => !a.is_correct)
      .sort((a, b) => {
        // Group by player and count occurrences
        const playerACount = allAnswers?.filter(ans => 
          ans.player_id === a.player_id && !ans.is_correct
        ).length || 0;
        
        const playerBCount = allAnswers?.filter(ans => 
          ans.player_id === b.player_id && !ans.is_correct
        ).length || 0;
        
        return playerBCount - playerACount;
      })
      .slice(0, 3);
      
    // Insert shame movies
    for (const answer of worstAnswers) {
      const player = players.find(p => p.id === answer.player_id);
      const question = answer.questions;
      
      if (!player || !question) continue;
      
      if (question.movie_id) {
        // Get movie details
        const { data: movie } = await supabase
          .from('movies')
          .select('*')
          .eq('id', question.movie_id)
          .single();
          
        if (movie) {
          // Insert shame movie
          await supabase
            .from('shame_movies')
            .insert({
              lobby_id: lobbyId,
              player_id: player.id,
              movie_title: movie.title,
              tmdb_id: movie.tmdb_id,
              reason: `Failed to answer "${question.question}" correctly`
            });
        }
      }
    }
    
    // Record final burn in database
    const { data: finalBurn, error: burnError } = await supabase
      .from('final_burns')
      .insert({
        lobby_id: lobbyId,
        content: burnContent,
        worst_player_id: worstPlayer.id
      })
      .select()
      .single();
      
    if (burnError) {
      return NextResponse.json(
        { error: 'Failed to create final burn' },
        { status: 500 }
      );
    }
    
    // Mark the lobby as ended
    await supabase
      .from('lobbies')
      .update({
        ended_at: new Date().toISOString()
      })
      .eq('id', lobbyId);
    
    return NextResponse.json({
      success: true,
      finalBurn
    });
  } catch (error) {
    console.error('Error generating final burn:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock final burn generator
function generateMockFinalBurn(
  worstPlayer: any,
  allPlayers: any[],
  allAnswers: any[],
  favoriteMovies: any[]
): string {
  const playerCount = allPlayers.length;
  const bestPlayer = allPlayers[allPlayers.length - 1]; // Last player has highest score
  
  // Get worst player's favorite movies
  const worstPlayerFavorites = favoriteMovies
    .filter(m => m.player_id === worstPlayer.id)
    .map(m => m.movie_title);
    
  // Count worst player's wrong answers
  const wrongAnswerCount = allAnswers
    .filter(a => a.player_id === worstPlayer.id && !a.is_correct)
    .length;
    
  // Generate a humorous final burn
  return `Ladies and gentlemen, we've witnessed a historic failure tonight. ${worstPlayer.name} managed to score a pathetic ${worstPlayer.score} points, placing dead last out of ${playerCount} players. 

${worstPlayer.name} claims to be a movie fan, but their performance suggests they think "Jaws" is about dentistry. They missed a whopping ${wrongAnswerCount} questions${worstPlayerFavorites.length > 0 ? ` despite listing "${worstPlayerFavorites[0]}" as a favorite movie` : ''}.

Meanwhile, ${bestPlayer.name} dominated with ${bestPlayer.score} points - that's ${bestPlayer.score - worstPlayer.score} more than our cinematic catastrophe. Perhaps ${worstPlayer.name} should stick to watching paint dry - it might be more their intellectual speed.

Better luck next time, ${worstPlayer.name}. Maybe try reading the movie descriptions before claiming to have watched them?`;
}