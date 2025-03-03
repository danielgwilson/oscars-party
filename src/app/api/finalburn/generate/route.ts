import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/generated/supabase';
import { z } from 'zod';

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

    const supabase = await createClient();

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
        players.map((p) => p.id)
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
        players.map((p) => p.id)
      );

    if (favoritesError) {
      console.error('Error fetching favorite movies:', favoritesError);
    }

    // Define types from Supabase
    type Player = Database['public']['Tables']['players']['Row'];
    type Answer = Database['public']['Tables']['answers']['Row'] & {
      questions: Database['public']['Tables']['questions']['Row']
    };
    type FavoriteMovie = Database['public']['Tables']['favorite_movies']['Row'];
    
    // Try to use OpenAI if API key exists
    const openaiApiKey = process.env.OPENAI_API_KEY;
    let burnContent: string;
    
    if (openaiApiKey) {
      try {
        // Generate a final burn using OpenAI
        burnContent = await generateOpenAIFinalBurn(
          worstPlayer as Player,
          players as Player[],
          allAnswers as Answer[] || [],
          favoriteMovies as FavoriteMovie[] || [],
          openaiApiKey
        );
      } catch (aiError) {
        console.error('Error generating final burn with OpenAI:', aiError);
        // Fallback to mock burn if AI generation fails
        burnContent = generateMockFinalBurn(
          worstPlayer,
          players,
          allAnswers || [],
          favoriteMovies || []
        );
      }
    } else {
      // Use mock burn generator if no API key
      console.log('OpenAI API key not set, using mock final burn generator');
      burnContent = generateMockFinalBurn(
        worstPlayer,
        players,
        allAnswers || [],
        favoriteMovies || []
      );
    }

    // Create shame list for the worst performers
    const worstAnswers = (allAnswers || [])
      .filter((a) => !a.is_correct)
      .sort((a, b) => {
        // Group by player and count occurrences
        const playerACount =
          allAnswers?.filter(
            (ans) => ans.player_id === a.player_id && !ans.is_correct
          ).length || 0;

        const playerBCount =
          allAnswers?.filter(
            (ans) => ans.player_id === b.player_id && !ans.is_correct
          ).length || 0;

        return playerBCount - playerACount;
      })
      .slice(0, 3);

    // Insert shame movies
    for (const answer of worstAnswers) {
      const player = players.find((p) => p.id === answer.player_id);
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
          await supabase.from('shame_movies').insert({
            lobby_id: lobbyId,
            player_id: player.id,
            movie_title: movie.title,
            tmdb_id: movie.tmdb_id,
            reason: `Failed to answer "${question.question}" correctly`,
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
        player_id: worstPlayer.id,
        shame_list: [],
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
        ended_at: new Date().toISOString(),
      })
      .eq('id', lobbyId);

    return NextResponse.json({
      success: true,
      finalBurn,
    });
  } catch (error) {
    console.error('Error generating final burn:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OpenAI final burn generator
async function generateOpenAIFinalBurn(
  worstPlayer: Database['public']['Tables']['players']['Row'],
  allPlayers: Database['public']['Tables']['players']['Row'][],
  allAnswers: Array<Database['public']['Tables']['answers']['Row'] & {
    questions: Database['public']['Tables']['questions']['Row']
  }>,
  favoriteMovies: Database['public']['Tables']['favorite_movies']['Row'][],
  apiKey: string
): Promise<string> {
  // Get some stats to help the AI
  const playerCount = allPlayers.length;
  const bestPlayer = [...allPlayers].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  
  // Get worst player's favorite movies
  const worstPlayerFavorites = favoriteMovies
    .filter((m) => m.player_id === worstPlayer.id)
    .map((m) => m.movie_title);
    
  // Count worst player's wrong answers
  const wrongAnswerCount = allAnswers.filter(
    (a) => a.player_id === worstPlayer.id && !a.is_correct
  ).length;
  
  // Get some of the specific questions they missed
  const missedQuestions = allAnswers
    .filter((a) => a.player_id === worstPlayer.id && !a.is_correct)
    .map(a => ({
      question: a.questions?.question ?? '',
      wrongAnswer: a.answer,
      correctAnswer: a.questions?.correct_answer ?? ''
    }))
    .slice(0, 3);
  
  // Create system message
  const systemMessage = `You are a hilarious, sarcastic movie trivia host presenting a "Final Burn" roast at the end of a movie trivia game. 
Your job is to create a funny, mildly brutal roast of the player who performed the worst. 
Your tone should be like a Comedy Central Roast - funny, sarcastic, and filled with movie references, 
but ultimately good-natured. Limit your response to 400 characters.`;

  // Create prompt with all context
  const promptData = {
    worstPlayer: {
      name: worstPlayer.name,
      score: worstPlayer.score ?? 0,
      favoriteMovies: worstPlayerFavorites,
      wrongAnswers: wrongAnswerCount
    },
    bestPlayer: {
      name: bestPlayer.name,
      score: bestPlayer.score ?? 0
    },
    gameStats: {
      playerCount,
      scoreDifference: (bestPlayer.score ?? 0) - (worstPlayer.score ?? 0),
      missedQuestions: missedQuestions
    }
  };

  const prompt = `Create a hilarious "Final Burn" roast for the worst-performing player in our movie trivia game.
  
Game stats:
- ${promptData.worstPlayer.name} came in last place with ${promptData.worstPlayer.score} points
- They got ${promptData.worstPlayer.wrongAnswers} questions wrong
${promptData.worstPlayer.favoriteMovies.length > 0 ? `- Their favorite movies include: ${promptData.worstPlayer.favoriteMovies.join(', ')}` : ''}
- The best player (${promptData.bestPlayer.name}) got ${promptData.bestPlayer.score} points
- That's a difference of ${promptData.gameStats.scoreDifference} points
- There were ${promptData.gameStats.playerCount} players total

${missedQuestions.length > 0 ? `Here are some questions they missed:
${missedQuestions.map(q => `- Question: "${q.question}" (They answered: "${q.wrongAnswer}", correct was: "${q.correctAnswer}")`).join('\n')}` : ''}

Write a funny, movie-themed roast (max 400 characters) that playfully mocks their terrible performance.
Include movie-related jokes and make specific references to their performance where possible.
Be cleverly mean but ultimately good-natured.`;

  try {
    // Define a Zod schema for validation
    const ResponseSchema = z.object({
      content: z.string()
    });
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 400
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }
    
    // Return the content
    return content.trim();
  } catch (error) {
    console.error('Error generating final burn with OpenAI:', error);
    throw error;
  }
}

// Mock final burn generator as fallback
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
    .filter((m) => m.player_id === worstPlayer.id)
    .map((m) => m.movie_title);

  // Count worst player's wrong answers
  const wrongAnswerCount = allAnswers.filter(
    (a) => a.player_id === worstPlayer.id && !a.is_correct
  ).length;

  // Generate a humorous final burn
  return `Ladies and gentlemen, we've witnessed a historic failure tonight. ${
    worstPlayer.name
  } managed to score a pathetic ${
    worstPlayer.score
  } points, placing dead last out of ${playerCount} players. 

${
  worstPlayer.name
} claims to be a movie fan, but their performance suggests they think "Jaws" is about dentistry. They missed a whopping ${wrongAnswerCount} questions${
    worstPlayerFavorites.length > 0
      ? ` despite listing "${worstPlayerFavorites[0]}" as a favorite movie`
      : ''
  }.

Meanwhile, ${bestPlayer.name} dominated with ${
    bestPlayer.score
  } points - that's ${
    bestPlayer.score - worstPlayer.score
  } more than our cinematic catastrophe. Perhaps ${
    worstPlayer.name
  } should stick to watching paint dry - it might be more their intellectual speed.

Better luck next time, ${
    worstPlayer.name
  }. Maybe try reading the movie descriptions before claiming to have watched them?`;
}
