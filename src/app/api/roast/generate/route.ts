import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/generated/supabase';
import { z } from 'zod';

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
    
    const supabase = await createClient();
    
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
    
    // Define types from Supabase
    type FavoriteMovie = Database['public']['Tables']['favorite_movies']['Row'];
    type Answer = Database['public']['Tables']['answers']['Row'];
    type Question = Database['public']['Tables']['questions']['Row'];
    
    let roastContent = '';
    
    // Try to use OpenAI if API key exists
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (openaiApiKey) {
      try {
        // Generate a roast using OpenAI
        roastContent = await generateOpenAIRoast(
          player_name,
          question,
          wrong_answer,
          correct_answer,
          favoriteMovies as FavoriteMovie[] || [],
          answerHistory as Answer[] || [],
          questionData as Question,
          openaiApiKey
        );
      } catch (aiError) {
        console.error('Error generating roast with OpenAI:', aiError);
        // Fallback to mock roast if AI generation fails
        roastContent = generateMockRoast(
          player_name,
          question,
          wrong_answer,
          correct_answer,
          favoriteMovies || [],
          answerHistory || [],
          questionData
        );
      }
    } else {
      // Use mock roast generator if no API key
      console.log('OpenAI API key not set, using mock roast generator');
      roastContent = generateMockRoast(
        player_name,
        question,
        wrong_answer,
        correct_answer,
        favoriteMovies || [],
        answerHistory || [],
        questionData
      );
    }
    
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

// OpenAI roast generator
async function generateOpenAIRoast(
  playerName: string,
  question: string,
  wrongAnswer: string,
  correctAnswer: string,
  favoriteMovies: Database['public']['Tables']['favorite_movies']['Row'][],
  answerHistory: Database['public']['Tables']['answers']['Row'][],
  questionData: Database['public']['Tables']['questions']['Row'],
  apiKey: string
): Promise<string> {
  // Calculate how many mistakes the player has made
  const mistakeCount = answerHistory.filter(a => !a.is_correct).length;
  
  // Get favorite movies for context
  const favoriteMovieTitles = favoriteMovies.map(m => m.movie_title).join(', ');
  
  // Create system message
  const systemMessage = `You are a hilarious but slightly mean movie trivia host. 
Your job is to roast players when they get a question wrong. Make your roasts funny, movie-related, 
and tailored to the specific player and question they got wrong. Keep responses under 120 characters.`;

  // Create prompt with all context
  const prompt = `The player ${playerName} just got a movie trivia question wrong.

Question: "${question}"
Their wrong answer: "${wrongAnswer}"
The correct answer: "${correctAnswer}"

Additional context:
- This is their ${mistakeCount + 1}${mistakeCount === 0 ? 'st' : mistakeCount === 1 ? 'nd' : mistakeCount === 2 ? 'rd' : 'th'} incorrect answer
${favoriteMovieTitles ? `- Their favorite movies include: ${favoriteMovieTitles}` : ''}
${questionData.movie_id ? `- This question was about a movie they claimed to have watched` : ''}

Generate a short, witty roast (max 120 characters) that playfully mocks their movie knowledge. 
Be funny but not truly mean. Make specific references to their mistake if possible.`;

  try {
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
        max_tokens: 120
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
    
    // Clean up the response (remove quotes if present)
    return content.replace(/^["'](.*)["']$/s, '$1').trim();
  } catch (error) {
    console.error('Error generating roast with OpenAI:', error);
    // Throw the error up to be handled by the caller
    throw error;
  }
}

// Mock roast generator as fallback
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