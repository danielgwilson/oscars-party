import { createRouteHandlerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Database } from '@/types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      player_id, 
      question_id, 
      player_name, 
      question, 
      wrong_answer, 
      correct_answer 
    } = body;
    
    if (!player_id || !question_id) {
      return NextResponse.json(
        { error: 'Player ID and Question ID are required' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get player's answer history for context
    const { data: answerHistory, error: historyError } = await supabase
      .from('answers')
      .select('*')
      .eq('player_id', player_id)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (historyError) {
      console.error('Error fetching answer history:', historyError);
    }
    
    // Get player's favorite movies for better roasting
    const { data: favoriteMovies, error: favoritesError } = await supabase
      .from('favorite_movies')
      .select('*')
      .eq('player_id', player_id);
      
    if (favoritesError) {
      console.error('Error fetching favorite movies:', favoritesError);
    }
    
    // Get question details
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', question_id)
      .single();
      
    if (questionError) {
      console.error('Error fetching question:', questionError);
    }
    
    // In a real implementation, this would call OpenAI to generate a personalized roast
    // For now, we'll generate a simple mock roast
    const roastContent = generateMockRoast(
      player_name,
      question,
      wrong_answer,
      correct_answer,
      favoriteMovies || [],
      answerHistory || [],
      questionData
    );
    
    // Store the roast in the database
    const { data: roast, error: roastError } = await supabase
      .from('roasts')
      .insert({
        player_id,
        question_id,
        content: roastContent
      })
      .select()
      .single();
      
    if (roastError) {
      return NextResponse.json(
        { error: 'Failed to create roast' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      roast
    });
  } catch (error) {
    console.error('Error generating roast:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock roast generator
function generateMockRoast(
  playerName: string,
  question: string,
  wrongAnswer: string,
  correctAnswer: string,
  favoriteMovies: any[],
  answerHistory: any[],
  questionData: any
): string {
  // Calculate how many mistakes the player has made
  const mistakeCount = answerHistory.filter(a => !a.is_correct).length;
  
  // Get a random favorite movie if available
  const randomFavorite = favoriteMovies.length > 0 
    ? favoriteMovies[Math.floor(Math.random() * favoriteMovies.length)]
    : null;
  
  // Generate a variety of funny roasts
  const roasts = [
    `Oh ${playerName}, I've seen better movie knowledge from someone who thinks "The Godfather" is about gardening. The answer was "${correctAnswer}", not "${wrongAnswer}".`,
    
    `${playerName}, you claim to love movies but just failed a softball question! Hand over your Netflix subscription immediately.`,
    
    `Wow ${playerName}, that's embarrassing. Even my grandmother who thinks all movies are "too loud these days" would have known the answer was "${correctAnswer}".`,
    
    `${playerName}, I'd say your movie knowledge is like a Michael Bay film - all flash, no substance.`,
    
    `That's ${mistakeCount + 1} wrong answers now, ${playerName}. Maybe try books instead?`,
    
    randomFavorite 
      ? `You listed "${randomFavorite.movie_title}" as a favorite but can't even answer this? I'm starting to think you just watched the trailer.` 
      : `I'm beginning to think your idea of "watching movies" is scrolling through Netflix thumbnails.`,
      
    `${playerName}, that answer was more disappointing than the Game of Thrones finale.`,
    
    `Oh no ${playerName}! The correct answer was "${correctAnswer}". Maybe stick to coloring books?`
  ];
  
  // Return a random roast
  return roasts[Math.floor(Math.random() * roasts.length)];
}