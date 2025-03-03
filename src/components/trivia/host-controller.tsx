'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Player,
  Question,
  Answer,
  FavoriteMovie,
  Lobby,
} from '@/types';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Users,
  Flame,
  Film,
  PlusCircle,
  Play,
  Timer,
  HelpCircle,
  Award,
} from 'lucide-react';
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';

interface HostControllerProps {
  lobbyId: string;
  lobbyCode: string;
  player: Player;
}

export default function HostController({
  lobbyId,
  lobbyCode,
  player,
}: HostControllerProps) {
  // State
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<FavoriteMovie[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isEndingGame, setIsEndingGame] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // Initialize host view
  useEffect(() => {
    const setupHost = async () => {
      try {
        // Get lobby info
        const { data: lobbyData, error: lobbyError } = await supabase
          .from('lobbies')
          .select('*')
          .eq('id', lobbyId)
          .single();

        if (lobbyError) {
          throw new Error('Failed to fetch lobby data');
        }

        setLobby(lobbyData);
        setGameStarted(!!lobbyData.started_at);
        setGameEnded(!!lobbyData.ended_at);

        // Fetch players
        const { data: playersData } = await supabase
          .from('players')
          .select('*')
          .eq('lobby_id', lobbyId)
          .order('score', { ascending: false });

        if (playersData) {
          setPlayers(playersData);
        }

        // Fetch any existing questions
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .eq('lobby_id', lobbyId);

        if (questionsData) {
          setQuestions(questionsData);
        }

        // Fetch favorite movies
        const { data: allFavoriteMovies } = await supabase
          .from('favorite_movies')
          .select('*');

        // Filter the movies to only include those from players in this lobby
        const playerIds = playersData?.map((p) => p.id) || [];
        const favoritesData = allFavoriteMovies?.filter(
          (movie) => movie.player_id && playerIds.includes(movie.player_id)
        );

        if (favoritesData) {
          setFavoriteMovies(favoritesData);
        }

        // Realtime subscriptions are set up in their own useEffect
      } catch (error) {
        console.error('Error setting up host view:', error);
        toast.error('Failed to load host data');
      }
    };

    setupHost();

    // Cleanup subscriptions on unmount
    return () => {
      // Channels are removed in the subscription effect
    };
  }, [lobbyId, supabase]);

  // Set up realtime subscriptions using a single channel with multiple listeners
  useEffect(() => {
    if (!lobbyId) return;

    // Using a unique channel name per host component instance
    const channelName = `host-updates-${lobbyId}`;

    // Define a single channel with multiple listeners
    const channel = supabase.channel(channelName) as RealtimeChannel;

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `lobby_id=eq.${lobbyId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPlayers((current) => [...current, payload.new as Player]);
          } else if (payload.eventType === 'UPDATE') {
            setPlayers((current) =>
              current.map((p) =>
                p.id === payload.new.id ? (payload.new as Player) : p
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setPlayers((current) =>
              current.filter((p) => p.id !== payload.old.id)
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'favorite_movies',
        },
        (payload) => {
          const newFavorite = payload.new as FavoriteMovie;

          // Using a callback function to get the latest players state
          setFavoriteMovies((current) => {
            // Only add if it belongs to a player in this lobby
            if (
              newFavorite.player_id &&
              players.some((p) => p.id === newFavorite.player_id)
            ) {
              return [...current, newFavorite];
            }
            return current;
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
          event: 'UPDATE',
          schema: 'public',
          table: 'lobbies',
          filter: `id=eq.${lobbyId}`,
        },
        (payload) => {
          const newLobby = payload.new as Lobby;
          setLobby(newLobby);
          setGameStarted(!!newLobby.started_at);
          setGameEnded(!!newLobby.ended_at);

          // If game started, redirect to game view
          if (!!newLobby.started_at && !gameStarted) {
            router.refresh();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to channel: ${channelName}`);
        }
      });

    // Ensure proper cleanup when component unmounts
    return () => {
      console.log(`Cleaning up channel: ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [lobbyId, supabase, router, players, gameStarted]);

  // Generate trivia questions
  const handleGenerateQuestions = async () => {
    try {
      setIsGeneratingQuestions(true);

      // Check if we have enough favorite movies
      if (favoriteMovies.length < 1) {
        toast.error('Wait for players to submit their favorite movies');
        return;
      }

      // Call the API to generate questions
      const response = await fetch('/api/trivia/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lobbyId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const result = await response.json();

      toast.success(
        `Generated ${result.questions.length} questions for your game!`
      );
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate trivia questions');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Start the game
  const handleStartGame = async () => {
    try {
      // Check if we have questions
      if (questions.length === 0) {
        toast.error('You need to generate questions first');
        return;
      }

      // Update the lobby status
      const { error } = await supabase
        .from('lobbies')
        .update({
          started_at: new Date().toISOString(),
        })
        .eq('id', lobbyId);

      if (error) {
        throw error;
      }

      setGameStarted(true);
      toast.success('Game started! Players can now begin answering questions');
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Failed to start the game');
    }
  };

  // End the game and generate final burn
  const handleEndGame = async () => {
    try {
      setIsEndingGame(true);

      // Call the API to generate the final burn
      const response = await fetch('/api/finalburn/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lobbyId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate final burn');
      }

      setGameEnded(true);
      toast.success('Game ended with a brutal final burn!');
    } catch (error) {
      console.error('Error ending game:', error);
      toast.error('Failed to end the game');
    } finally {
      setIsEndingGame(false);
    }
  };

  // Return to home
  const handleReturnHome = () => {
    router.push('/');
  };

  // Group favorite movies by player
  const favoritesByPlayer = favoriteMovies.reduce((acc, movie) => {
    // Skip movies with null player_id
    if (movie.player_id) {
      if (!acc[movie.player_id]) {
        acc[movie.player_id] = [];
      }
      acc[movie.player_id].push(movie);
    }
    return acc;
  }, {} as Record<string, FavoriteMovie[]>);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-amber-400">
          Game Host Dashboard
        </h1>
        <p className="text-amber-200">
          Lobby Code: <span className="font-mono font-bold">{lobbyCode}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Players List */}
        <Card className="bg-black/60 border-amber-600 shadow-amber-400/20 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-amber-400 flex items-center">
                <Users className="h-5 w-5 mr-2" /> Players
              </CardTitle>
              <Badge className="bg-amber-500">
                {players.length} {players.length === 1 ? 'Player' : 'Players'}
              </Badge>
            </div>
            <CardDescription className="text-amber-200">
              {gameStarted
                ? 'Live scores and stats'
                : 'Waiting for more players to join'}
            </CardDescription>
          </CardHeader>

          <CardContent className="max-h-[400px] overflow-y-auto">
            {players.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <HelpCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No players have joined yet</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {players.map((p) => {
                  const favoritesCount = (favoritesByPlayer[p.id] || []).length;

                  return (
                    <li
                      key={p.id}
                      className={`
                        flex justify-between items-center p-3 rounded-lg
                        ${
                          p.is_host
                            ? 'bg-amber-900/20 border border-amber-700/50'
                            : 'bg-black/40'
                        }
                      `}>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center mr-3 text-sm font-bold">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-amber-100 font-medium flex items-center">
                            {p.name}
                            {p.is_host && (
                              <Badge
                                variant="outline"
                                className="ml-2 border-amber-500 text-amber-400 text-xs">
                                Host
                              </Badge>
                            )}
                          </div>
                          {gameStarted ? (
                            <div className="text-xs text-amber-300/70">
                              {p.correct_answers || 0} correct •{' '}
                              {p.incorrect_answers || 0} wrong
                            </div>
                          ) : (
                            <div className="text-xs text-amber-300/70">
                              {favoritesCount > 0
                                ? `${favoritesCount} favorite movies submitted`
                                : 'No favorites submitted yet'}
                            </div>
                          )}
                        </div>
                      </div>

                      {gameStarted && (
                        <div className="text-xl font-bold text-amber-400">
                          {p.score}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Game Controls */}
        <Card className="bg-black/60 border-amber-600 shadow-amber-400/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center">
              <Flame className="h-5 w-5 mr-2" /> Game Controls
            </CardTitle>
            <CardDescription className="text-amber-200">
              Manage the trivia game
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-900/50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-amber-300 font-medium flex items-center">
                  <Film className="h-4 w-4 mr-2" /> Trivia Questions
                </h3>
                <Badge
                  variant={questions.length > 0 ? 'default' : 'outline'}
                  className={
                    questions.length > 0
                      ? 'bg-green-700'
                      : 'border-amber-700 text-amber-400'
                  }>
                  {questions.length} Questions
                </Badge>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleGenerateQuestions}
                  disabled={
                    isGeneratingQuestions ||
                    gameStarted ||
                    gameEnded ||
                    favoriteMovies.length === 0
                  }
                  className="w-full bg-amber-700 hover:bg-amber-600 text-white">
                  {isGeneratingQuestions
                    ? 'Generating...'
                    : questions.length > 0
                    ? 'Regenerate Questions'
                    : 'Generate Questions'}
                  <PlusCircle className="h-4 w-4 ml-2" />
                </Button>

                <Button
                  onClick={handleStartGame}
                  disabled={gameStarted || gameEnded || questions.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                  Start Game
                  <Play className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {gameStarted && !gameEnded && (
              <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-900/50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-amber-300 font-medium flex items-center">
                    <Timer className="h-4 w-4 mr-2" /> Game Progress
                  </h3>
                  <Badge className="bg-amber-600">In Progress</Badge>
                </div>

                <Button
                  onClick={handleEndGame}
                  disabled={isEndingGame || !gameStarted || gameEnded}
                  className="w-full bg-red-600 hover:bg-red-500 text-white">
                  {isEndingGame
                    ? 'Generating Final Roast...'
                    : 'End Game & Generate Final Burn'}
                  <Flame className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {gameEnded && (
              <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-900/50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-amber-300 font-medium flex items-center">
                    <Award className="h-4 w-4 mr-2" /> Game Complete
                  </h3>
                  <Badge className="bg-amber-500">Finished</Badge>
                </div>

                <p className="text-sm text-amber-200/70 mb-2">
                  The game has ended. All players can now view the final burn
                  and results.
                </p>

                <Button
                  onClick={handleReturnHome}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white">
                  Return to Home
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex items-center justify-between pt-2 text-xs text-amber-300/50">
            <div>Game ID: {lobbyId.slice(0, 8)}...</div>
            <div>
              {gameStarted
                ? `Started: ${new Date(
                    lobby?.started_at || ''
                  ).toLocaleTimeString()}`
                : 'Not started yet'}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
