'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Player, Lobby } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { Spinner, ButtonSpinner } from '@/components/ui/spinner';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface LobbyViewProps {
  lobbyCode: string;
}

export default function LobbyView({ lobbyCode }: LobbyViewProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const playerId = localStorage.getItem('oscarsPartyPlayerId');
    const lobbyId = localStorage.getItem('oscarsPartyLobbyId');

    if (!playerId || !lobbyId) {
      // If no player or lobby info in localStorage, redirect to join page
      router.push('/join');
      return;
    }

    // Fetch lobby details and players
    const fetchLobbyAndPlayers = async () => {
      try {
        // Get lobby details
        const { data: lobbyData, error: lobbyError } = await supabase
          .from('lobbies')
          .select('*')
          .eq('code', lobbyCode)
          .single();

        if (lobbyError) throw new Error(lobbyError.message);
        setLobby(lobbyData);

        // Get current player
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();

        if (playerError) throw new Error(playerError.message);
        setCurrentPlayer(playerData);
        setIsHost(playerData.is_host);

        // Get all players in this lobby
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('lobby_id', lobbyId)
          .order('created_at');

        if (playersError) throw new Error(playersError.message);
        setPlayers(playersData);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching lobby details:', error);
        toast.error('Failed to load lobby', {
          description:
            'There was an error loading the lobby details. Please try again.',
          id: 'lobby-load-error', // Add ID to prevent duplicate toasts
        });
      }
    };

    fetchLobbyAndPlayers();

    // Subscribe to player changes
    const playersChannel = supabase
      .channel('lobby-players')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `lobby_id=eq.${lobbyId}`,
        },
        (payload) => {
          // Update players list
          if (payload.eventType === 'INSERT') {
            setPlayers((current) => [...current, payload.new as Player]);
          } else if (payload.eventType === 'DELETE') {
            setPlayers((current) =>
              current.filter((p) => p.id !== payload.old.id)
            );
          } else if (payload.eventType === 'UPDATE') {
            setPlayers((current) =>
              current.map((p) =>
                p.id === payload.new.id ? (payload.new as Player) : p
              )
            );
          }
        }
      )
      .subscribe();

    // Subscribe to lobby status changes
    const lobbyChannel = supabase
      .channel('lobby-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lobbies',
          filter: `id=eq.${lobbyId}`,
        },
        (payload) => {
          setLobby(payload.new as Lobby);

          // If the game has started, redirect to game page
          if (payload.new.started_at && !lobby?.started_at) {
            router.push(`/game/${lobbyCode}`);
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(lobbyChannel);
    };
  }, [lobbyCode, router, supabase, lobby?.started_at]);

  const handleStartGame = async () => {
    if (!isHost) return;

    setIsStarting(true);

    try {
      const lobbyId = localStorage.getItem('oscarsPartyLobbyId');

      if (!lobbyId) {
        throw new Error('Missing lobby ID');
      }

      // Update the lobby to mark it as started
      const { error } = await supabase
        .from('lobbies')
        .update({
          started_at: new Date().toISOString(),
        })
        .eq('id', lobbyId);

      if (error) throw new Error(error.message);

      router.push(`/game/${lobbyCode}`);
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Failed to start game', {
        description: 'There was an error starting the game. Please try again.',
        id: 'start-game-error',
      });
      setIsStarting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return <LoadingScreen message="Loading lobby..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="bg-black/60 border-amber-600 shadow-amber-400/20 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-amber-400">
            Waiting for Players
          </CardTitle>
          <CardDescription className="text-amber-200 text-lg">
            Game Code:{' '}
            <span className="font-bold tracking-widest">{lobbyCode}</span>
          </CardDescription>
          <p className="text-white mt-2">
            Share this code with friends to join your Oscars Party! (
            {players.length} player{players.length !== 1 ? 's' : ''} joined)
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex flex-col items-center p-3 rounded-lg ${
                  player.is_host
                    ? 'bg-amber-500/20 border border-amber-500'
                    : 'bg-black/30'
                }`}>
                <Avatar className="h-16 w-16 mb-2">
                  {player.avatar_url && (
                    <AvatarImage src={player.avatar_url} alt={player.name} />
                  )}
                  <AvatarFallback
                    className={`text-lg ${
                      player.is_host
                        ? 'bg-amber-500 text-black'
                        : 'bg-gray-800 text-amber-400'
                    }`}>
                    {getInitials(player.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white font-medium text-center">
                  {player.name}
                </span>
                {player.is_host && (
                  <span className="text-amber-400 text-xs mt-1">Host</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col">
          <div className="w-full flex items-center justify-center mb-4">
            <p className="text-gray-300 text-center">
              {isHost
                ? 'When everyone has joined, you can start the game.'
                : 'Waiting for the host to start the game...'}
            </p>
          </div>

          {isHost && (
            <Button
              onClick={handleStartGame}
              disabled={isStarting || players.length < 1}
              className="w-full md:w-1/2 mx-auto bg-amber-500 hover:bg-amber-400 text-black font-bold">
              {isStarting ? (
                <>
                  <ButtonSpinner className="text-black" />
                  Starting Game...
                </>
              ) : (
                'Start Game'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
