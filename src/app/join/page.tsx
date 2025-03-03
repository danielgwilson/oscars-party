'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function JoinGame() {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gameCode.trim() || !playerName.trim()) {
      toast('Missing information', {
        description: 'Please enter both the game code and your name',
      });
      return;
    }

    setIsJoining(true);

    try {
      // Format the game code (uppercase, remove spaces)
      const formattedCode = gameCode.toUpperCase().replace(/\s/g, '');

      // Call the API to join a game
      const response = await fetch('/api/join-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameCode: formattedCode, playerName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          toast.error('Invalid game code', {
            description: "The game code you entered doesn't exist",
          });
          setIsJoining(false);
          return;
        }
        throw new Error(errorData.error || 'Failed to join game');
      }

      const { lobbyId, playerId, lobbyCode } = await response.json();

      // Store player info in localStorage
      localStorage.setItem('oscarsPartyPlayerId', playerId);
      localStorage.setItem('oscarsPartyLobbyId', lobbyId);
      localStorage.setItem('oscarsPartyLobbyCode', lobbyCode);

      // Redirect to the lobby
      router.push(`/lobby/${lobbyCode}`);
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game', {
        description: 'There was an error joining the game. Please try again.',
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-amber-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/60 border-amber-600 shadow-amber-400/20 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-amber-400">
            Join an Oscars Party
          </CardTitle>
          <CardDescription className="text-amber-200">
            Enter the 4-letter code to join an existing game
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleJoinGame}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="gameCode"
                className="text-sm font-medium text-amber-200">
                Game Code
              </label>
              <Input
                id="gameCode"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                placeholder="Enter 4-letter code"
                className="bg-black/50 border-amber-600 text-white text-center text-2xl tracking-widest uppercase"
                maxLength={4}
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="playerName"
                className="text-sm font-medium text-amber-200">
                Your Name
              </label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="bg-black/50 border-amber-600 text-white"
                autoComplete="off"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold"
              disabled={isJoining}>
              {isJoining ? 'Joining...' : 'Join Game'}
            </Button>
            <Button
              variant="outline"
              className="w-full border-amber-500 text-amber-400 hover:bg-amber-500/10"
              asChild>
              <Link href="/">Cancel</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
