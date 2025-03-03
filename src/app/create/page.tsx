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
import { ButtonSpinner } from '@/components/ui/spinner';

export default function CreateGame() {
  const [hostName, setHostName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreateLobby = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hostName.trim()) {
      toast('Please enter your name to host a game', {
        id: 'missing-host-name',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Call the API to create a game
      const response = await fetch('/api/create-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hostName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        toast.error(errorData.error || 'An error occurred creating the game', {
          id: 'create-game-server-error',
        });
        setIsCreating(false);
        return;
      }

      const { lobbyId, playerId, lobbyCode } = await response.json();

      // Store player info in localStorage
      localStorage.setItem('oscarsPartyPlayerId', playerId);
      localStorage.setItem('oscarsPartyLobbyId', lobbyId);
      localStorage.setItem('oscarsPartyLobbyCode', lobbyCode);

      toast.success('Game created!', {
        description: `Your game code is ${lobbyCode}. Share it with your friends!`,
        id: 'game-created',
      });

      // Redirect to the lobby
      router.push(`/lobby/${lobbyCode}`);
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game', {
        description: 'There was an error creating your game. Please try again.',
        id: 'create-game-error',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Generate a random 4-letter code
  const generateLobbyCode = () => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return result;
  };

  // Seed the categories and nominees from the nominees.json data
  const seedCategoriesAndNominees = async (lobbyId: string) => {
    try {
      const response = await fetch('/api/seed-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lobbyId }),
      });

      if (!response.ok) {
        throw new Error('Failed to seed data');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      // We'll continue anyway since the main lobby was created
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-amber-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/60 border-amber-600 shadow-amber-400/20 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-amber-400">
            Host a Movie Night Party
          </CardTitle>
          <CardDescription className="text-amber-200">
            Create a new prediction and trivia game for your movie night
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleCreateLobby}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="hostName"
                className="text-sm font-medium text-amber-200">
                Your Name
              </label>
              <Input
                id="hostName"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
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
              disabled={isCreating}>
              {isCreating ? (
                <>
                  <ButtonSpinner className="text-black" />
                  Creating Game...
                </>
              ) : (
                'Create Game'
              )}
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
