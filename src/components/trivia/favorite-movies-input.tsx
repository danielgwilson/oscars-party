"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardFooter } from '../ui/mobile-view';
import { X, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

interface FavoriteMoviesInputProps {
  playerName: string;
  onSubmit: (movies: string[]) => void;
  maxMovies?: number;
  playerId: string;
  isHost?: boolean;
  playerCount?: number;
  lobbyId?: string;
}

export default function FavoriteMoviesInput({
  playerName,
  onSubmit,
  maxMovies = 5,
  playerId,
  isHost = false,
  playerCount = 0,
  lobbyId
}: FavoriteMoviesInputProps) {
  const supabase = createClient();
  const [favoriteMovies, setFavoriteMovies] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddMovie = () => {
    if (!currentInput.trim()) {
      setError('Please enter a movie title');
      return;
    }

    if (favoriteMovies.length >= maxMovies) {
      setError(`You can only add up to ${maxMovies} movies`);
      return;
    }

    if (favoriteMovies.includes(currentInput)) {
      setError('This movie is already in your list');
      return;
    }

    setFavoriteMovies([...favoriteMovies, currentInput.trim()]);
    setCurrentInput('');
    setError(null);
  };

  const handleRemoveMovie = (index: number) => {
    setFavoriteMovies(favoriteMovies.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (favoriteMovies.length === 0) {
      setError('Please add at least one favorite movie');
      return;
    }
    
    try {
      // Save favorite movies to the database
      const movieEntries = favoriteMovies.map(movie => ({
        player_id: playerId,
        movie_title: movie
      }));
      
      const { error } = await supabase
        .from('favorite_movies')
        .insert(movieEntries);
        
      if (error) {
        console.error("Error saving favorite movies:", error);
        toast.error("Failed to save your movies");
        return;
      }
      
      // Mark this player as ready
      try {
        const { error: playerUpdateError } = await supabase
          .from('players')
          .update({ is_ready: true })
          .eq('id', playerId);
          
        if (playerUpdateError) {
          // If the error is about the column not existing (during migration), just log and continue
          if (playerUpdateError.message?.includes('column "is_ready" does not exist')) {
            console.log("is_ready column not yet available - skipping player ready status");
          } else {
            console.error("Error marking player as ready:", playerUpdateError);
          }
        } else {
          console.log("Player successfully marked as ready");
        }
      } catch (readyError) {
        // Just log the error but don't block the flow
        console.error("Exception marking player as ready:", readyError);
      }
      
      // If host and all players are ready, generate questions
      if (isHost && playerCount > 0 && lobbyId) {
        try {
          // First check if all players have submitted favorites by checking how many have favorite movies
          // This works even if the is_ready column isn't available yet
          // First get the players in this lobby
          const { data: lobbyPlayers, error: lobbyPlayersError } = await supabase
            .from('players')
            .select('id')
            .eq('lobby_id', lobbyId);
            
          if (lobbyPlayersError) {
            console.error("Error fetching lobby players:", lobbyPlayersError);
            return;
          }
          
          // Now get all players who have submitted favorites
          const { data: playersWithFavorites, error: favoritesError } = await supabase
            .from('favorite_movies')
            .select('player_id');
            
          // We need to filter because favorite_movies doesn't have lobby_id directly
          // Get the set of player IDs in this lobby
          const lobbyPlayerIds = new Set(
            (lobbyPlayers || []).map(p => p.id)
          );
            
          // Get unique player IDs who have submitted favorites and are in this lobby
          const playerIds = new Set(
            (playersWithFavorites || [])
              .filter(f => f.player_id && lobbyPlayerIds.has(f.player_id))
              .map(f => f.player_id)
          );
          
          // Also try to get players marked as ready if that column exists
          let readyPlayers = [];
          try {
            const { data, error: readyError } = await supabase
              .from('players')
              .select('id')
              .eq('lobby_id', lobbyId)
              .eq('is_ready', true);
              
            if (!readyError) {
              readyPlayers = data || [];
            }
          } catch (readyQueryError) {
            console.log("is_ready query failed, falling back to favorite movies check");
          }
          
          // Determine if all players are ready - either by having submitted favorites (size of unique IDs)
          // or by being marked as ready in the newer schema
          const allPlayersReady = 
            (playerIds.size === playerCount) || 
            (readyPlayers.length > 0 && readyPlayers.length === playerCount);
            
          if (favoritesError) {
            console.error("Error checking player favorites:", favoritesError);
          } else if (allPlayersReady) {
            // All players are ready - call the trivia generation API
            toast.info("All players are ready! Generating questions...");
          
            try {
              const response = await fetch('/api/trivia/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lobbyId })
              });
              
              if (!response.ok) {
                throw new Error("Failed to generate trivia questions");
              }
              
              // Mark the game as started
              const { error: startError } = await supabase
                .from('lobbies')
                .update({
                  started_at: new Date().toISOString(),
                  game_stage: 'trivia_started'
                })
                .eq('id', lobbyId);
                
              if (startError) {
                console.error("Error starting game:", startError);
                toast.error("Failed to start the game");
              } else {
                toast.success("Game started!");
                
                // Add a small delay and then call the onSubmit callback to advance our own UI
                setTimeout(() => {
                  onSubmit(favoriteMovies);
                }, 1000);
              }
            } catch (genError) {
              console.error("Error generating questions:", genError);
              toast.error("Failed to generate questions. Please try again.");
            }
          } else {
            toast.success("Your favorite movies are saved! Waiting for other players...");
          }
        } catch (checkError) {
          console.error("Error checking player readiness:", checkError);
          toast.success("Your favorite movies are saved! Waiting for other players...");
        }
      } else {
        toast.success("Your favorite movies are saved! Waiting for other players...");
      }
      
      // Call parent callback
      onSubmit(favoriteMovies);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <MobileCard>
      <MobileCardHeader
        title="Your Favorite Movies"
        subtitle={`Hi ${playerName}! Tell us what movies you love so we can tailor questions to your taste`}
      />

      <MobileCardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium text-amber-300 mb-2">
            Add up to {maxMovies} of your favorite films:
          </h3>
          <p className="text-amber-200/70 text-sm mb-4">
            This helps us generate trivia questions about movies you actually know!
          </p>

          <div className="flex mb-3">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Enter a movie title..."
              className="bg-black/30 border-amber-700/50 text-white mr-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMovie();
                }
              }}
            />
            <Button
              onClick={handleAddMovie}
              variant="outline"
              className="border-amber-500 text-amber-400 hover:bg-amber-500/10"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-3">{error}</p>
          )}

          <div className="text-sm text-amber-200 mb-2">
            {favoriteMovies.length > 0 ? "Your movies:" : "No movies added yet"}
          </div>

          <div className="space-y-2">
            {favoriteMovies.map((movie, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-amber-950/30 py-2 px-3 rounded-md border border-amber-800/30"
              >
                <div className="flex items-center">
                  <Search className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="text-white">{movie}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-amber-400 hover:text-red-400 hover:bg-transparent"
                  onClick={() => handleRemoveMovie(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </MobileCardContent>

      <MobileCardFooter>
        <Button
          onClick={handleSubmit}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold"
          disabled={favoriteMovies.length === 0}
        >
          I{"'"}m Ready to Play!
        </Button>
      </MobileCardFooter>
    </MobileCard>
  );
}