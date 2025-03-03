import { createRouteHandlerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Database, FavoriteMovie, Question } from '@/types';

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
      .eq('lobby_id', lobbyId);
      
    if (playersError || !players) {
      return NextResponse.json(
        { error: 'Failed to fetch players' },
        { status: 500 }
      );
    }
    
    // Fetch all favorite movies from players in this lobby
    const { data: favoriteMovies, error: favoritesError } = await supabase
      .from('favorite_movies')
      .select('*')
      .in(
        'player_id',
        players.map(p => p.id)
      );
      
    if (favoritesError || !favoriteMovies) {
      return NextResponse.json(
        { error: 'Failed to fetch favorite movies' },
        { status: 500 }
      );
    }
    
    // Group favorite movies by player
    const favoritesByPlayer = favoriteMovies.reduce((acc, movie) => {
      if (!acc[movie.player_id]) {
        acc[movie.player_id] = [];
      }
      acc[movie.player_id].push(movie);
      return acc;
    }, {} as Record<string, FavoriteMovie[]>);
    
    // Create a set of unique movie titles
    const uniqueMovieTitles = new Set(favoriteMovies.map(m => m.movie_title));
    
    // Get TMDb data for all unique movies (if available)
    const movieDetails = await Promise.all(
      Array.from(uniqueMovieTitles).map(async (title) => {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&api_key=${process.env.TMDB_API_KEY}`
          );
          
          if (!response.ok) {
            throw new Error('TMDb API request failed');
          }
          
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            return {
              title,
              tmdb_id: data.results[0].id,
              poster_path: data.results[0].poster_path,
              backdrop_path: data.results[0].backdrop_path,
              release_date: data.results[0].release_date,
              overview: data.results[0].overview
            };
          }
          return { title, not_found: true };
        } catch (error) {
          console.error(`Error fetching TMDb data for ${title}:`, error);
          return { title, not_found: true };
        }
      })
    );
    
    // Filter out movies without TMDb data
    const moviesWithDetails = movieDetails.filter(m => !m.not_found);
    
    // Store movie details in database
    if (moviesWithDetails.length > 0) {
      const moviesToInsert = moviesWithDetails.map(movie => ({
        tmdb_id: movie.tmdb_id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_date: movie.release_date,
        overview: movie.overview
      }));
      
      const { error: insertError } = await supabase.from('movies').insert(moviesToInsert);
      
      if (insertError) {
        console.error('Error inserting movies:', insertError);
      }
    }
    
    // Get the movies we've already inserted
    const { data: existingMovies } = await supabase
      .from('movies')
      .select('*')
      .in(
        'title',
        Array.from(uniqueMovieTitles)
      );
    
    // Generate trivia questions based on favorite movies
    // In a real implementation, this would use OpenAI to generate questions
    // For now, we'll use mock questions for demonstration
    const triviaQuestions: Partial<Question>[] = generateMockQuestions(
      favoritesByPlayer,
      players,
      existingMovies || []
    );
    
    // Insert trivia questions
    const { error: questionsError } = await supabase
      .from('questions')
      .insert(
        triviaQuestions.map(q => ({
          ...q,
          lobby_id: lobbyId
        }))
      );
    
    if (questionsError) {
      return NextResponse.json(
        { error: 'Failed to insert questions' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Generated ${triviaQuestions.length} questions`,
      questions: triviaQuestions
    });
  } catch (error) {
    console.error('Error in trivia generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock question generator
function generateMockQuestions(
  favoritesByPlayer: Record<string, FavoriteMovie[]>,
  players: any[],
  movies: any[]
): Partial<Question>[] {
  const questions: Partial<Question>[] = [];
  
  // Define some difficulties with points
  const difficulties = [
    { level: 'easy' as const, points: 100 },
    { level: 'medium' as const, points: 200 },
    { level: 'hard' as const, points: 300 }
  ];
  
  // For each player, create at least 2 questions based on their favorites
  for (const playerId in favoritesByPlayer) {
    const player = players.find(p => p.id === playerId);
    const playerFavorites = favoritesByPlayer[playerId] || [];
    
    // Skip if player has no favorites
    if (playerFavorites.length === 0) continue;
    
    // Get up to 2 random favorites for this player
    const selectedFavorites = playerFavorites
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(2, playerFavorites.length));
    
    for (const favorite of selectedFavorites) {
      // Find movie details
      const movie = movies.find(m => m.title === favorite.movie_title);
      
      if (!movie) continue;
      
      // Create a question
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      
      questions.push({
        question: `In the movie "${movie.title}", who played the main character?`,
        options: [
          'Tom Hanks',
          'Leonardo DiCaprio',
          'Jennifer Lawrence',
          'Samuel L. Jackson'
        ],
        correct_answer: 'Leonardo DiCaprio',
        explanation: `This is a sample question about ${movie.title}.`,
        movie_id: movie.id,
        difficulty: difficulty.level,
        points: difficulty.points,
        image_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined
      });
    }
  }
  
  // Add some general movie trivia questions
  const generalQuestions = [
    {
      question: 'Which film won the Academy Award for Best Picture in 2020?',
      options: ['1917', 'Joker', 'Parasite', 'Once Upon a Time in Hollywood'],
      correct_answer: 'Parasite',
      explanation: 'Parasite, directed by Bong Joon-ho, was the first non-English language film to win Best Picture.',
      difficulty: 'medium' as const,
      points: 200
    },
    {
      question: 'Who directed the 1994 film "Pulp Fiction"?',
      options: ['Martin Scorsese', 'Quentin Tarantino', 'Steven Spielberg', 'Francis Ford Coppola'],
      correct_answer: 'Quentin Tarantino',
      explanation: 'Pulp Fiction was directed by Quentin Tarantino and won the Palme d\'Or at Cannes.',
      difficulty: 'easy' as const,
      points: 100
    },
    {
      question: 'Which actor has received the most Oscar nominations in history?',
      options: ['Jack Nicholson', 'Meryl Streep', 'Katharine Hepburn', 'Daniel Day-Lewis'],
      correct_answer: 'Meryl Streep',
      explanation: 'Meryl Streep has received 21 Academy Award nominations, winning three times.',
      difficulty: 'hard' as const,
      points: 300
    }
  ];
  
  // Add the general questions to our set
  questions.push(...generalQuestions);
  
  // Shuffle the questions
  return questions.sort(() => Math.random() - 0.5);
}