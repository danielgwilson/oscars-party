// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Player,
  Question,
  Answer,
  Roast,
  Movie,
  FinalBurn,
  ShameMovie,
  FavoriteMovie,
  ChatMessage,
} from '@/types';
import { createClient } from '@/utils/supabase/client';
import MobileTriviaView from './mobile-trivia-view';
import FavoriteMoviesInput from './favorite-movies-input';
import FinalBurnView from './final-burn';
import EmojiChat from '../chat/emoji-chat';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { RealtimeChannel } from '@supabase/supabase-js';

interface GameControllerProps {
  lobbyId: string;
  player: Player;
  isHost?: boolean;
  lobbyCode?: string;
}

export default function GameController({
  lobbyId,
  player,
  isHost = false,
  lobbyCode = '',
}: GameControllerProps) {
  // State
  const [gameStage, setGameStage] = useState<
    'favorites' | 'trivia' | 'final' | 'completed'
  >('favorites');
  const [players, setPlayers] = useState<Player[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<FavoriteMovie[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [roast, setRoast] = useState<Roast | null>(null);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [finalBurn, setFinalBurn] = useState<FinalBurn | null>(null);
  const [shameMovies, setShameMovies] = useState<ShameMovie[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();
  const router = useRouter();

  // State for movies and roasts
  const [movies, setMovies] = useState<Movie[]>([]);
  const [roasts, setRoasts] = useState<Roast[]>([]);
  const [streak, setStreak] = useState(0);

  // Current question and related data
  const currentQuestion = questions[currentQuestionIndex];
  const questionMovie = currentQuestion?.movie_id
    ? movies.find((m) => m.id === currentQuestion.movie_id)
    : null;
  const currentRoast = roasts.find(
    (r) => r.player_id === player.id && r.question_id === currentQuestion?.id
  );

  // Initialize game
  useEffect(() => {
    let isMounted = true;

    const setupGame = async () => {
      if (!isMounted) return;
      setIsLoading(true);

      try {
        // Get the lobby status first to determine game stage
        const { data: initialLobbyData, error: initialLobbyError } = await supabase
          .from('lobbies')
          .select('*')
          .eq('id', lobbyId)
          .single();
          
        if (initialLobbyError) {
          console.error('Error fetching lobby:', initialLobbyError);
        } else if (initialLobbyData && isMounted) {
          // If the game has started but we don't have any questions, we need to wait
          if (initialLobbyData.started_at && initialLobbyData.game_stage === 'trivia_started') {
            setGameStage('trivia');
          }
        }
        
        // Fetch players in lobby for leaderboard
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('lobby_id', lobbyId);

        if (playersError) {
          console.error('Error fetching players:', playersError);
        } else if (playersData && isMounted) {
          setPlayers(playersData);
        }

        if (!isMounted) return;

        // Check if player has submitted favorite movies
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('favorite_movies')
          .select('*')
          .eq('player_id', player.id);

        if (favoritesError) {
          console.error('Error fetching favorites:', favoritesError);
        } else if (favoritesData && favoritesData.length > 0 && isMounted) {
          // Only move to trivia stage if player has submitted favorites and we're not in a different stage already
          if (gameStage === 'favorites') {
            setGameStage('trivia');
          }
          // We'll fetch questions in a separate useEffect
        }

        if (!isMounted) return;

        // Check if game is in final stage
        const { data: endGameLobbyData, error: endGameLobbyError } = await supabase
          .from('lobbies')
          .select('*')
          .eq('id', lobbyId)
          .single();

        if (endGameLobbyError) {
          console.error('Error fetching lobby end state:', endGameLobbyError);
        } else if (endGameLobbyData && endGameLobbyData.ended_at && isMounted) {
          setGameStage('final');
          // We'll fetch final results in a separate useEffect
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error setting up game:', error);
          toast.error('Failed to load game data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    setupGame();

    // Cleanup subscriptions and prevent state updates after unmount
    return () => {
      isMounted = false;
      // Channels are cleaned up in the subscription effect
    };
  }, [lobbyId, player.id, supabase, gameStage]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!lobbyId || !player.id) return;

    // Create a unique channel name for this player instance
    const channelName = `game-updates-${lobbyId}-${player.id}`;

    // Create a single channel with multiple listeners
    const channel = supabase.channel(channelName) as RealtimeChannel;

    channel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
          filter: `lobby_id=eq.${lobbyId}`,
        },
        (payload) => {
          setPlayers((current) => {
            const updatedPlayer = payload.new as Player;
            return current.map((p) =>
              p.id === updatedPlayer.id ? updatedPlayer : p
            );
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'questions',
          filter: `lobby_id=eq.${lobbyId}`,
        },
        (payload) => {
          setQuestions((current) => [...current, payload.new as Question]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'roasts',
          filter: `player_id=eq.${player.id}`,
        },
        (payload) => {
          setRoasts((current) => [...current, payload.new as Roast]);
          toast.info('You got roasted for that wrong answer!');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `lobby_id=eq.${lobbyId}`,
        },
        (payload) => {
          setChatMessages((current) => [
            ...current,
            payload.new as ChatMessage,
          ]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lobbies',
          filter: `id=eq.${lobbyId}`,
        },
        (payload) => {
          console.log('Lobby update detected:', payload.new);
          
          // Check if game stage has changed to trivia_started
          if (payload.new.game_stage === 'trivia_started' && gameStage === 'favorites') {
            console.log('Game has officially started with trivia_started status');
            setGameStage('trivia');
            
            // Fetch or refresh questions
            supabase
              .from('questions')
              .select('*')
              .eq('lobby_id', lobbyId)
              .then(({ data, error }) => {
                if (error) {
                  console.error('Error fetching questions after game start:', error);
                } else if (data && data.length > 0) {
                  console.log(`Found ${data.length} questions after game start`);
                  setQuestions(data);
                } else {
                  console.log('No questions found after game start, will retry');
                }
              });
          }
          
          // Check if the game has ended
          if (payload.new.ended_at && !payload.old.ended_at) {
            setGameStage('final');
            // Don't call fetchFinalResults directly here, it will be triggered by the useEffect that watches gameStage
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'final_burns',
          filter: `lobby_id=eq.${lobbyId}`,
        },
        (payload) => {
          setFinalBurn(payload.new as FinalBurn);
          setGameStage('final');
          toast.info('Final results are in! Check out your final roast!');
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to channel: ${channelName}`);
        }
      });

    // Clean up on unmount
    return () => {
      console.log(`Cleaning up channel: ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [lobbyId, player.id, supabase, gameStage]);

  // Fetch questions for the game using useEffect
  useEffect(() => {
    if (lobbyId && player.id && gameStage === 'trivia') {
      let isMounted = true;
      let timeoutId: ReturnType<typeof setTimeout>;
      let retryCount = 0;
      const MAX_RETRIES = 5;

      const fetchQuestions = async () => {
        try {
          console.log(`Fetching questions for lobby ${lobbyId}, attempt ${retryCount + 1}`);
          
          // Get questions for this lobby
          const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('lobby_id', lobbyId)
            .order('created_at', { ascending: true });

          if (questionsError) {
            console.error('Error fetching questions:', questionsError);
            return;
          }

          if (!isMounted) return;

          if (questionsData && questionsData.length > 0) {
            console.log(`Found ${questionsData.length} questions for lobby ${lobbyId}`);
            setQuestions(questionsData);

            // Fetch movie data for questions
            const movieIds = questionsData
              .filter((q) => q.movie_id)
              .map((q) => q.movie_id as string);

            if (movieIds.length > 0) {
              // Use a different approach since .in() is not properly typed
              let moviesData: Movie[] = [];
              let moviesError = null;

              try {
                // Fetch movies one by one instead of using .in()
                const promises = movieIds.map((id) =>
                  supabase.from('movies').select('*').eq('id', id).single()
                );

                const results = await Promise.all(promises);
                moviesData = results
                  .map((result) => result.data as Movie)
                  .filter(Boolean) as Movie[];

                // Check if any of the queries had an error
                const errors = results.filter((result) => result.error);
                if (errors.length > 0) {
                  moviesError = errors[0].error;
                }
              } catch (error) {
                moviesError = error;
              }

              if (moviesError) {
                console.error('Error fetching movies:', moviesError);
              } else if (moviesData && isMounted) {
                setMovies(moviesData);
              }
            }

            if (!isMounted) return;

            // Fetch existing answers to calculate streak
            const { data: answersData, error: answersError } = await (
              supabase
                .from('answers')
                .select('*')
                .eq('player_id', player.id)
                .order('created_at', { ascending: false }) as any
            ).limit(5);

            if (answersError) {
              console.error('Error fetching answers:', answersError);
            } else if (answersData && answersData.length > 0 && isMounted) {
              // Calculate streak from consecutive correct answers
              let currentStreak = 0;
              for (const answer of answersData) {
                if (answer.is_correct) {
                  currentStreak++;
                } else {
                  break;
                }
              }
              setStreak(currentStreak);

              // Find the highest answered question index
              const answeredQuestionIds = new Set(
                answersData.map((a: Answer) => a.question_id)
              );
              const lastAnsweredIndex = questionsData.findIndex((q) =>
                answeredQuestionIds.has(q.id)
              );

              if (lastAnsweredIndex !== -1 && isMounted) {
                setCurrentQuestionIndex(lastAnsweredIndex + 1);
              }
            }
          } else if (questionsData && questionsData.length === 0) {
            // No questions yet, set up retry if under the limit
            if (retryCount < MAX_RETRIES && isMounted) {
              console.log(`No questions yet, retrying in 5 seconds (attempt ${retryCount + 1}/${MAX_RETRIES})`);
              
              // Clear any existing timeout
              if (timeoutId) clearTimeout(timeoutId);
              
              // Incremental backoff for retries (5s, 10s, 15s, 20s, 25s)
              const delay = 5000 + (retryCount * 5000);
              
              timeoutId = setTimeout(() => {
                retryCount++;
                if (isMounted) {
                  fetchQuestions();
                }
              }, delay);
            } else if (retryCount >= MAX_RETRIES && isMounted) {
              // After max retries, show an error
              console.error(`Failed to load questions after ${MAX_RETRIES} attempts`);
              toast.error("Taking too long to generate questions", {
                description: "The host may need to try generating questions again",
                duration: 10000,
              });
            }
          }
        } catch (error) {
          if (isMounted) {
            console.error('Error fetching questions:', error);
            toast.error('Failed to load questions');
          }
        }
      };

      fetchQuestions();

      return () => {
        isMounted = false;
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [lobbyId, player.id, supabase, gameStage]);

  // Fetch final game results using useEffect
  useEffect(() => {
    if (lobbyId && player.id && gameStage === 'final') {
      let isMounted = true;

      const fetchFinalResults = async () => {
        try {
          // Get final burn
          const { data: burnData, error: burnError } = await supabase
            .from('final_burns')
            .select('*')
            .eq('lobby_id', lobbyId)
            .single();

          if (burnError) {
            // Check if the error has a code property before accessing it
            const errorCode = (burnError as any).code;
            if (errorCode !== 'PGRST116') {
              // Not found error is expected initially
              console.error('Error fetching final burn:', burnError);
            }
          } else if (burnData && isMounted) {
            setFinalBurn(burnData);
          }

          if (!isMounted) return;

          // Get shame movies
          const { data: shameData, error: shameError } = await supabase
            .from('shame_movies')
            .select('*')
            .eq('player_id', player.id);

          if (shameError) {
            console.error('Error fetching shame movies:', shameError);
          } else if (shameData && isMounted) {
            setShameMovies(shameData);
          }

          if (!isMounted) return;

          // Get final player scores
          const { data: playersData, error: playersError } = await supabase
            .from('players')
            .select('*')
            .eq('lobby_id', lobbyId)
            .order('score', { ascending: false });

          if (playersError) {
            console.error('Error fetching players:', playersError);
          } else if (playersData && isMounted) {
            setPlayers(playersData);
          }
        } catch (error) {
          if (isMounted) {
            console.error('Error fetching final results:', error);
            toast.error('Failed to load final results');
          }
        }
      };

      fetchFinalResults();

      return () => {
        isMounted = false;
      };
    }
  }, [lobbyId, player.id, supabase, gameStage]);

  // Handle favorite movies submission
  const handleFavoriteMoviesSubmit = async (movies: string[]) => {
    try {
      // The movies and player ready status are already handled by FavoriteMoviesInput component
      
      // Move to waiting for questions state - this will trigger the questions fetch in useEffect
      setGameStage('trivia');
      
      // Check if questions have already been generated
      const { data: existingQuestions, error: questionsError } = await (
        supabase.from('questions').select('id').eq('lobby_id', lobbyId) as any
      ).limit(1);

      if (questionsError) {
        console.error('Error checking for existing questions:', questionsError);
      }
      
      // Only show waiting message if there are no questions yet
      if (!existingQuestions || existingQuestions.length === 0) {
        toast.success('Your favorites are submitted! Waiting for all players to be ready...');
      } else {
        toast.success('Your favorites are submitted! Let the trivia begin!');
      }
    } catch (error) {
      console.error('Error handling favorite movies submission:', error);
      toast.error('Failed to process your favorite movies');
    }
  };

  // Handle answering a question
  const handleAnswerQuestion = async (answer: string) => {
    if (!currentQuestion) return;

    try {
      const isCorrect = answer === currentQuestion.correct_answer;

      // Update streak
      let newStreak = isCorrect ? streak + 1 : 0;
      setStreak(newStreak);

      // Record the answer
      await supabase.from('answers').insert({
        player_id: player.id,
        question_id: currentQuestion.id,
        answer,
        is_correct: isCorrect,
        answer_time: 15000, // TODO: track actual answer time
      });

      // Update player score
      let scoreUpdate = 0;

      if (isCorrect) {
        const timeBonus = 30; // Placeholder for actual time bonus
        const streakBonus = newStreak > 1 ? Math.min(newStreak * 5, 25) : 0;
        scoreUpdate = (currentQuestion?.points || 0) + timeBonus + streakBonus;

        // Update player stats
        await supabase
          .from('players')
          .update({
            score: (player.score || 0) + scoreUpdate,
            streak: newStreak,
            correct_answers: (player.correct_answers || 0) + 1,
          })
          .eq('id', player.id);
      } else {
        // Request a roast from the Next.js API
        await fetch('/api/roast/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            player_id: player.id,
            question_id: currentQuestion.id,
            player_name: player.name,
            question: currentQuestion.question,
            wrong_answer: answer,
            correct_answer: currentQuestion.correct_answer,
          }),
        });

        // Update incorrect answers count
        await supabase
          .from('players')
          .update({
            streak: 0,
            incorrect_answers: (player.incorrect_answers || 0) + 1,
          })
          .eq('id', player.id);

        // The api/roast/generate endpoint will create a roast in the database
        // which will be picked up by our subscription
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Check if this was the last question for this player
      // The host triggers the final burn when all players are done
      toast.info('You finished all questions! Waiting for other players...');
    }
  };

  // Handle emoji reactions
  const handleSendEmoji = async (emoji: string) => {
    try {
      await supabase.from('chat_messages').insert({
        lobby_id: lobbyId,
        player_id: player.id,
        emoji,
      });
    } catch (error) {
      console.error('Error sending emoji:', error);
    }
  };

  // Handle game completion
  const handleFinishGame = () => {
    router.push('/');
    toast.success('Thanks for playing!');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-amber-400">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading movie trivia game...</p>
        </div>
      </div>
    );
  }

  // Render based on game stage
  if (gameStage === 'favorites') {
    return (
      <FavoriteMoviesInput
        playerName={player.name}
        playerId={player.id}
        onSubmit={handleFavoriteMoviesSubmit}
        isHost={isHost}
        playerCount={players.length}
        lobbyId={lobbyId}
      />
    );
  }

  if (gameStage === 'final' && finalBurn) {
    return (
      <FinalBurnView
        finalBurn={finalBurn}
        players={players}
        shameMovies={shameMovies}
        onFinish={handleFinishGame}
      />
    );
  }

  return (
    <>
      {currentQuestion ? (
        <MobileTriviaView
          question={currentQuestion}
          roast={currentRoast}
          movie={questionMovie || undefined}
          onAnswer={handleAnswerQuestion}
          streak={streak}
          onNext={handleNextQuestion}
          currentQuestionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          playerName={player.name}
        />
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-black text-amber-400">
          <div className="text-center p-6">
            <h2 className="text-xl font-bold mb-3">Waiting for questions...</h2>
            <p className="mb-4">
              The AI is generating trivia based on everyone&apos;s favorite
              movies.
            </p>
            <div className="animate-spin h-10 w-10 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm text-amber-300/70">
              This may take a moment. Please wait...
            </p>
          </div>
        </div>
      )}

      {/* Emoji Chat */}
      <EmojiChat
        lobbyId={lobbyId}
        player={player}
        players={players}
        onSendEmoji={handleSendEmoji}
        messages={chatMessages}
        className="bottom-0"
      />
    </>
  );
}
