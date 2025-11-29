import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/generated/supabase';
import { z } from 'zod';

export const runtime = 'edge';

type FavoriteMovie = Database['public']['Tables']['favorite_movies']['Row'];
type QuestionRow = Database['public']['Tables']['questions']['Row'];
type Question = QuestionRow;
type Movie = Database['public']['Tables']['movies']['Row'];

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

    // Check for TMDB API key
    const tmdbApiKey = process.env.TMDB_API_KEY;
    if (!tmdbApiKey) {
      console.error('TMDB_API_KEY environment variable is not set');
      // Continue without movie details - we'll generate generic questions
    }
    
    const supabase = await createClient();
    
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
      
    if (favoritesError) {
      console.error('Error fetching favorite movies:', favoritesError);
      // Continue with empty favorites - we'll generate generic questions
    }
    
    // Group favorite movies by player
    const favoritesByPlayer = (favoriteMovies || []).reduce((acc, movie) => {
      if (!acc[movie.player_id as string]) {
        acc[movie.player_id as string] = [];
      }
      acc[movie.player_id as string].push(movie);
      return acc;
    }, {} as Record<string, FavoriteMovie[]>);
    
    // Create a set of unique movie titles
    const uniqueMovieTitles = new Set((favoriteMovies || []).map(m => m.movie_title));
    
    let movieDetails: any[] = [];
    let existingMovies: any[] = [];
    
    // Only fetch TMDb data if we have the API key
    if (tmdbApiKey && uniqueMovieTitles.size > 0) {
      console.log(`Fetching TMDb data for ${uniqueMovieTitles.size} movies`);
      
      // Get TMDb data for all unique movies (if available)
      movieDetails = await Promise.all(
        Array.from(uniqueMovieTitles).map(async (title) => {
          try {
            const response = await fetch(
              `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&api_key=${tmdbApiKey}`
            );
            
            if (!response.ok) {
              console.error(`TMDB API error for ${title}: ${response.status} ${response.statusText}`);
              return { title, not_found: true };
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
      
      // Store movie details in database - handle possible errors
      if (moviesWithDetails.length > 0) {
        try {
          const moviesToInsert = moviesWithDetails.map(movie => ({
            tmdb_id: movie.tmdb_id,
            title: movie.title,
            poster_path: movie.poster_path || null,
            backdrop_path: movie.backdrop_path || null,
            release_date: movie.release_date || null,
            overview: movie.overview || null
          }));
          
          // Try to upsert movies to handle duplicates
          try {
            const { error: insertError } = await supabase
              .from('movies')
              .upsert(moviesToInsert, { onConflict: 'title' });
            
            if (insertError) {
              // Check for specific error about backdrop_path
              if (insertError.message?.includes('backdrop_path')) {
                console.error('Error with backdrop_path column:', insertError);
                
                // Try again without the backdrop_path property
                const simpleMoviesToInsert = moviesToInsert.map(movie => ({
                  tmdb_id: movie.tmdb_id,
                  title: movie.title,
                  poster_path: movie.poster_path || null,
                  release_date: movie.release_date || null,
                  overview: movie.overview || null
                }));
                
                const { error: retryError } = await supabase
                  .from('movies')
                  .upsert(simpleMoviesToInsert, { onConflict: 'title' });
                  
                if (retryError) {
                  console.error('Error on retry insert movies:', retryError);
                } else {
                  console.log('Movie insert succeeded after removing backdrop_path');
                }
              } else {
                console.error('Error inserting movies:', insertError);
              }
              // Continue without failing - we can still generate questions
            }
          } catch (insertError) {
            console.error('Exception inserting movies:', insertError);
            // Continue without failing
          }
        } catch (insertError) {
          console.error('Exception inserting movies:', insertError);
          // Continue without failing
        }
      }
      
      // Get the movies we've already inserted
      try {
        const { data: moviesData } = await supabase
          .from('movies')
          .select('*')
          .in(
            'title',
            Array.from(uniqueMovieTitles)
          );
        
        existingMovies = moviesData || [];
      } catch (dbError) {
        console.error('Error fetching movies from database:', dbError);
        // Continue with empty existing movies
      }
    }

    console.log(`Generating questions with ${existingMovies.length} existing movies`);
    
    // Generate trivia questions based on favorite movies using OpenAI
    let triviaQuestions: Partial<Question>[] = [];
    
    try {
      // Only use OpenAI if the API key is set
      const openaiApiKey = process.env.OPENAI_API_KEY;
      
      if (openaiApiKey && Object.keys(favoritesByPlayer).length > 0) {
        console.log('Generating questions with OpenAI');
        
        triviaQuestions = await generateOpenAIQuestions(
          favoritesByPlayer,
          players,
          existingMovies,
          openaiApiKey
        );
      } else {
        console.log('OpenAI API key not set or no favorite movies, using mock questions');
        triviaQuestions = generateMockQuestions(
          favoritesByPlayer,
          players,
          existingMovies
        );
      }
    } catch (aiError) {
      console.error('Error generating questions with OpenAI:', aiError);
      // Fallback to mock questions if AI generation fails
      console.log('Falling back to mock questions due to error');
      triviaQuestions = generateMockQuestions(
        favoritesByPlayer,
        players,
        existingMovies
      );
    }
    
    // Make sure we have at least some questions even if movie lookup failed
    if (triviaQuestions.length === 0) {
      console.log('No movie questions generated, adding fallback questions');
      triviaQuestions.push(...generateFallbackQuestions());
    }
    
    // Insert trivia questions
    console.log(`Inserting ${triviaQuestions.length} questions for lobby ${lobbyId}`);
    const questionPayload: Database['public']['Tables']['questions']['Insert'][] = triviaQuestions.map(
      q => ({
        ...q,
        lobby_id: lobbyId,
        question: q.question ?? '',
        correct_answer: q.correct_answer ?? '',
        options: q.options ?? [],
      })
    );

    const { error: questionsError } = await supabase.from('questions').insert(questionPayload);
    
    if (questionsError) {
      console.error('Error inserting questions:', questionsError);
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
      
      if (!movie) {
        // If no movie details found, create a generic question about the movie
        console.log(`No details found for ${favorite.movie_title}, creating generic question`);
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        
        questions.push({
          question: `Which of these actors is known for appearing in movies similar to "${favorite.movie_title}"?`,
          options: [
            'Tom Hanks',
            'Leonardo DiCaprio',
            'Jennifer Lawrence',
            'Samuel L. Jackson'
          ],
          correct_answer: 'Leonardo DiCaprio',
          explanation: `This is a generic question about ${favorite.movie_title}.`,
          difficulty: difficulty.level,
          points: difficulty.points,
        });
        continue;
      }
      
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
  const generalQuestions = generateFallbackQuestions();
  
  // Add the general questions to our set
  questions.push(...generalQuestions);
  
  // Shuffle the questions
  return questions.sort(() => Math.random() - 0.5);
}

// OpenAI question generator
async function generateOpenAIQuestions(
  favoritesByPlayer: Record<string, FavoriteMovie[]>,
  players: any[],
  movies: any[],
  apiKey: string
): Promise<Partial<Question>[]> {
  const questions: Partial<Question>[] = [];
  const difficulties = [
    { level: 'easy' as const, points: 100 },
    { level: 'medium' as const, points: 200 },
    { level: 'hard' as const, points: 300 }
  ];
  
  // Create a list of questions to generate
  const questionsToGenerate: {
    playerName: string;
    movie: string | Movie;
    playerId: string;
    movieId?: string;
    difficulty: typeof difficulties[number];
  }[] = [];
  
  // For each player, prepare question generation requests based on their favorites
  for (const playerId in favoritesByPlayer) {
    const player = players.find(p => p.id === playerId);
    const playerFavorites = favoritesByPlayer[playerId] || [];
    
    if (playerFavorites.length === 0) continue;
    
    // Get up to 2 random favorites for this player
    const selectedFavorites = playerFavorites
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(2, playerFavorites.length));
    
    for (const favorite of selectedFavorites) {
      // Find movie details if available
      const movie = movies.find(m => m.title === favorite.movie_title);
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      
      questionsToGenerate.push({
        playerName: player.name,
        movie: movie || favorite.movie_title,
        playerId,
        movieId: movie?.id,
        difficulty
      });
    }
  }
  
  // Generate 5 general movie questions
  for (let i = 0; i < 5; i++) {
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    questionsToGenerate.push({
      playerName: 'everyone',
      movie: 'General Movie Knowledge',
      playerId: '',
      difficulty
    });
  }
  
  // Process question generation in batches to avoid rate limits
  const BATCH_SIZE = 5;
  for (let i = 0; i < questionsToGenerate.length; i += BATCH_SIZE) {
    const batch = questionsToGenerate.slice(i, i + BATCH_SIZE);
    
    // Create requests for this batch
    const batchPromises = batch.map(async (item) => {
      try {
        const question = await generateSingleQuestion(item, apiKey);
        
        // Add metadata to the generated question
        if (question) {
          question.difficulty = item.difficulty.level;
          question.points = item.difficulty.points;
          
          if (item.movieId) {
            question.movie_id = item.movieId;
          }
          
          // If the movie has image data, add it
          if (typeof item.movie !== 'string' && item.movie.poster_path) {
            question.image_url = `https://image.tmdb.org/t/p/w500${item.movie.poster_path}`;
          }
          
          return question;
        }
        return null;
      } catch (error) {
        console.error(`Error generating question for ${typeof item.movie === 'string' ? item.movie : item.movie.title}:`, error);
        return null;
      }
    });
    
    // Wait for all batch requests to complete
    const batchResults = await Promise.all(batchPromises);
    questions.push(...batchResults.filter(Boolean) as Partial<Question>[]);
    
    // Add a small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < questionsToGenerate.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return questions.length > 0 ? questions : generateFallbackQuestions();
}

// Generate a single trivia question using OpenAI
async function generateSingleQuestion(
  item: {
    playerName: string;
    movie: string | Movie;
    playerId: string;
    difficulty: { level: 'easy' | 'medium' | 'hard'; points: number };
  },
  apiKey: string
): Promise<Partial<Question> | null> {
  const movieTitle = typeof item.movie === 'string' ? item.movie : item.movie.title;
  const movieOverview = typeof item.movie !== 'string' ? item.movie.overview : null;
  
  // Skip general knowledge for specific movies
  const isGeneral = movieTitle === 'General Movie Knowledge';
  
  // Create system message with instructions
  const systemMessage = isGeneral
    ? `Generate a ${item.difficulty.level} difficulty movie trivia question about general film knowledge.`
    : `Generate a ${item.difficulty.level} difficulty movie trivia question about the movie "${movieTitle}".`;
  
  // Add movie information if available
  let prompt = `Generate a multiple-choice movie trivia question with exactly four options labeled A, B, C, and D.
The question should match the difficulty level: ${item.difficulty.level} (${item.difficulty.points} points).
${isGeneral ? 'The question should be about general movie knowledge.' : `The question should be specifically about the movie "${movieTitle}".`}
${movieOverview ? `Here's some information about the movie: ${movieOverview}` : ''}

Please provide your response in the following JSON format:
{
  "question": "Your question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": "The correct option text (exactly matching one of the options)",
  "explanation": "A brief explanation of why this answer is correct"
}

Make sure the options are diverse and plausible, with only one clearly correct answer.`;

  try {
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
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return null;
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.error('No content returned from OpenAI');
      return null;
    }
    
    // Define a Zod schema for validation
    const QuestionSchema = z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correct_answer: z.string(),
      explanation: z.string()
    });
    
    try {
      // First try to parse the entire response as JSON
      let questionData;
      try {
        // First try parsing directly
        questionData = JSON.parse(content);
      } catch (jsonError) {
        // If direct parsing fails, try to extract JSON using regex
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('No JSON object found in response');
          return null;
        }
        
        try {
          questionData = JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          console.error('Error extracting JSON from response:', extractError);
          return null;
        }
      }
      
      // Validate with Zod
      const validatedData = QuestionSchema.safeParse(questionData);
      
      if (!validatedData.success) {
        console.error('Invalid question format:', validatedData.error);
        return null;
      }
      
      return {
        question: validatedData.data.question,
        options: validatedData.data.options,
        correct_answer: validatedData.data.correct_answer,
        explanation: validatedData.data.explanation
      };
    } catch (error) {
      console.error('Error processing OpenAI response:', error);
      return null;
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return null;
  }
}

// Fallback questions when we can't generate movie-specific ones
function generateFallbackQuestions(): Partial<Question>[] {
  return [
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
    },
    {
      question: 'Which of these films was NOT directed by Christopher Nolan?',
      options: ['Inception', 'Interstellar', 'The Revenant', 'Dunkirk'],
      correct_answer: 'The Revenant',
      explanation: 'The Revenant was directed by Alejandro González Iñárritu, not Christopher Nolan.',
      difficulty: 'medium' as const,
      points: 200
    },
    {
      question: 'What was the highest-grossing film of all time before "Avengers: Endgame"?',
      options: ['Titanic', 'Star Wars: The Force Awakens', 'Avatar', 'Jurassic World'],
      correct_answer: 'Avatar',
      explanation: 'Avatar, directed by James Cameron, held the record until Avengers: Endgame surpassed it in 2019.',
      difficulty: 'easy' as const,
      points: 100
    },
    {
      question: 'Which actor played Tony Stark/Iron Man in the Marvel Cinematic Universe?',
      options: ['Chris Evans', 'Chris Hemsworth', 'Mark Ruffalo', 'Robert Downey Jr.'],
      correct_answer: 'Robert Downey Jr.',
      explanation: 'Robert Downey Jr. played Tony Stark/Iron Man from 2008\'s Iron Man through 2019\'s Avengers: Endgame.',
      difficulty: 'easy' as const,
      points: 100
    },
    {
      question: 'Which film features the character Hannibal Lecter?',
      options: ['The Shining', 'Silence of the Lambs', 'Seven', 'Psycho'],
      correct_answer: 'Silence of the Lambs',
      explanation: 'Anthony Hopkins played Hannibal Lecter in The Silence of the Lambs (1991).',
      difficulty: 'medium' as const,
      points: 200
    }
  ];
}