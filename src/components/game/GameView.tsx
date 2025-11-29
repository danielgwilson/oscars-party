'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Category,
  Nominee,
  Player,
  Prediction,
  CategoryWithNominees,
} from '@/types';
import { createClient } from '@/utils/supabase/client';
import CategoryView from './CategoryView';
import LeaderboardView from '@/components/leaderboard/LeaderboardView';
import { Spinner } from '@/components/ui/spinner';

interface GameViewProps {
  lobbyCode: string;
}

export default function GameView({ lobbyCode }: GameViewProps) {
  const [categories, setCategories] = useState<CategoryWithNominees[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories');
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

    // Fetch game data
    const fetchGameData = async () => {
      try {
        try {
          // Get current player
          const { data: playerData, error: playerError } = await supabase
            .from('players')
            .select('*')
            .eq('id', playerId)
            .single();
  
          if (playerError) throw new Error(playerError.message);
          setCurrentPlayer(playerData);
          setIsHost(Boolean(playerData.is_host));
  
          // Get all players in this lobby
          const { data: playersData, error: playersError } = await supabase
            .from('players')
            .select('*')
            .eq('lobby_id', lobbyId)
            .order('score', { ascending: false });
  
          if (playersError) throw new Error(playersError.message);
          setPlayers(playersData);
  
          // Get categories and nominees
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories' as never)
            .select('*')
            .eq('lobby_id', lobbyId)
            .order('"order"');
  
          if (categoriesError) throw new Error(categoriesError.message);
  
          const categoriesWithNominees: CategoryWithNominees[] = [];
          const typedCategories = (categoriesData || []) as Category[];

          for (const category of typedCategories) {
            try {
              const { data: nomineesData, error: nomineesError } = await supabase
                .from('nominees' as never)
                .select('*')
                .eq('category_id', category.id);
  
              if (nomineesError) throw new Error(nomineesError.message);
  
              categoriesWithNominees.push({
                ...category,
                nominees: (nomineesData || []) as Nominee[],
              });
            } catch (nomineeError) {
              console.error(`Error fetching nominees for category ${category.id}:`, nomineeError);
              // Continue with other categories even if one fails
              categoriesWithNominees.push({
                ...category,
                nominees: [],
              });
            }
          }
  
          setCategories(categoriesWithNominees);
  
          // Get player's predictions
          const { data: predictionsData, error: predictionsError } =
            await supabase
              .from('predictions' as never)
              .select('*')
              .eq('player_id', playerId);
  
          if (predictionsError) throw new Error(predictionsError.message);
  
          // Convert predictions to a simple map of category_id -> nominee_id
          const predictionsMap: Record<string, string> = {};
          const typedPredictions = (predictionsData || []) as Prediction[];
          for (const prediction of typedPredictions) {
            if (prediction.category_id && prediction.nominee_id) {
              predictionsMap[prediction.category_id] = prediction.nominee_id;
            }
          }
  
          setPredictions(predictionsMap);
  
          setIsLoading(false);
        } catch (supabaseError) {
          console.error('Supabase error:', supabaseError);
          
          // Check if we have essential data to show something
          if (currentPlayer && categories.length > 0) {
            setIsLoading(false);
          } else {
            throw supabaseError;
          }
        }
      } catch (error) {
        console.error('Error fetching game data:', error);
        // Only show toast error if we're not already loading
        if (isLoading) {
          toast.error('Failed to load game data', {
            description:
              'There was an error loading the game data. Please try again.',
            id: 'game-data-error', // Add an ID to prevent duplicate toasts
          });
        }
      }
    };

    fetchGameData();

    // Subscribe to player changes for leaderboard updates
    const playersChannel = supabase
      .channel('game-players')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `lobby_id=eq.${lobbyId}`,
        } as any,
        (payload: any) => {
          // Update players list
          if (payload.eventType === 'INSERT') {
            setPlayers((current) =>
              [...current, payload.new as Player].sort(
                (a, b) => (b.score ?? 0) - (a.score ?? 0)
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setPlayers((current) =>
              current.filter((p) => p.id !== payload.old.id)
            );
          } else if (payload.eventType === 'UPDATE') {
            setPlayers((current) =>
              current
                .map((p) =>
                  p.id === payload.new.id ? (payload.new as Player) : p
                )
                .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
            );

            // Update current player if it's the one that changed
            if (payload.new.id === currentPlayer?.id) {
              setCurrentPlayer(payload.new as Player);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to category locks and winner updates
    const categoriesChannel = supabase
      .channel('game-categories')
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'categories',
        } as any,
        (payload: any) => {
          setCategories((current) =>
            current.map((c) =>
              c.id === payload.new.id
                ? { ...c, ...(payload.new as Category) }
                : c
            )
          );
        }
      )
      .subscribe();

    // Subscribe to nominee winner updates
    const nomineesChannel = supabase
      .channel('game-nominees')
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'nominees',
        } as any,
        (payload: any) => {
          setCategories((current) =>
            current.map((c) => {
              // Find the category that contains this nominee
              const nomineeIndex = c.nominees.findIndex(
                (n) => n.id === payload.new.id
              );
              if (nomineeIndex >= 0) {
                // Update just this nominee
                const updatedNominees = [...c.nominees];
                updatedNominees[nomineeIndex] = {
                  ...updatedNominees[nomineeIndex],
                  ...(payload.new as Nominee),
                };
                return { ...c, nominees: updatedNominees };
              }
              return c;
            })
          );

          // If a winner is declared, show a toast
          if (payload.new.is_winner) {
            // Find the nominee and category name
            let nomineeName = '';
            let categoryName = '';

            for (const category of categories) {
              const nominee = category.nominees.find(
                (n) => n.id === payload.new.id
              );
              if (nominee) {
                nomineeName = nominee.name;
                categoryName = category.name;
                break;
              }
            }

            if (nomineeName && categoryName) {
              toast.success(`Winner Announced: ${categoryName}`, {
                description: `🏆 ${nomineeName} has won!`,
                duration: 5000,
                id: `winner-${payload.new.id}`,
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to prediction changes
    const predictionsChannel = supabase
      .channel('game-predictions')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'predictions',
          filter: `player_id=eq.${playerId}`,
        } as any,
        (payload: any) => {
          if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'UPDATE'
          ) {
            setPredictions((current) => ({
              ...current,
              [payload.new.category_id]: payload.new.nominee_id,
            }));
          } else if (payload.eventType === 'DELETE') {
            setPredictions((current) => {
              const updated = { ...current };
              delete updated[payload.old.category_id];
              return updated;
            });
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      if (playersChannel) supabase.removeChannel(playersChannel as any);
      if (categoriesChannel) supabase.removeChannel(categoriesChannel as any);
      if (nomineesChannel) supabase.removeChannel(nomineesChannel as any);
      if (predictionsChannel) supabase.removeChannel(predictionsChannel as any);
    };
  }, [lobbyCode, router, supabase, isLoading, categories, currentPlayer, predictions]);

  const handlePredictionChange = async (
    categoryId: string,
    nomineeId: string
  ) => {
    if (!currentPlayer) return;

    try {
      // Update the prediction in the database
      const { error } = await supabase.from('predictions' as never).upsert(
        {
          player_id: currentPlayer.id,
          category_id: categoryId,
          nominee_id: nomineeId,
          updated_at: new Date().toISOString(),
        } as any,
        {
          onConflict: 'player_id,category_id',
        }
      );

      if (error) throw new Error(error.message);

      // Optimistically update the UI
      setPredictions({
        ...predictions,
        [categoryId]: nomineeId,
      });
    } catch (error) {
      console.error('Error making prediction:', error);
      toast.error('Failed to make prediction', {
        description:
          'There was an error saving your prediction. Please try again.',
        id: 'prediction-error',
      });
    }
  };

  const handleLockCategory = async (categoryId: string) => {
    if (!isHost) return;

    try {
      // Lock the category in the database
      const categoriesTable = supabase.from('categories' as never) as any;
      const { error } = await categoriesTable
        .update({
          locked: true,
        })
        .eq('id', categoryId);

      if (error) throw new Error(error.message);

      toast.success('Category Locked', {
        description: 'This category is now locked for voting',
        id: `category-locked-${categoryId}`,
      });
    } catch (error) {
      console.error('Error locking category:', error);
      toast.error('Failed to lock category', {
        description:
          'There was an error locking the category. Please try again.',
        id: 'lock-category-error',
      });
    }
  };

  const handleSetWinner = async (categoryId: string, nomineeId: string) => {
    if (!isHost) return;

    try {
      const categoriesTable = supabase.from('categories' as never) as any;
      const nomineesTable = supabase.from('nominees' as never) as any;

      // First reset all nominees in this category
      const { error: resetError } = await nomineesTable
        .update({
          is_winner: false,
        })
        .eq('category_id', categoryId);

      if (resetError) throw new Error(resetError.message);

      // Then set the winner
      const { error } = await nomineesTable
        .update({
          is_winner: true,
        })
        .eq('id', nomineeId);

      if (error) throw new Error(error.message);

      // Make sure the category is locked
      await categoriesTable
        .update({
          locked: true,
        })
        .eq('id', categoryId);

      // Update player scores for correct predictions
      await fetch('/api/update-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId, nomineeId }),
      });

      toast.success('Winner Set', {
        description: 'The winner has been announced and scores updated',
        id: `winner-set-${categoryId}-${nomineeId}`,
      });
    } catch (error) {
      console.error('Error setting winner:', error);
      toast.error('Failed to set winner', {
        description: 'There was an error setting the winner. Please try again.',
        id: 'set-winner-error',
      });
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
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <Spinner size="xl" color="accent" className="mb-4" />
          <div className="text-amber-400 text-xl">Loading game...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          {currentPlayer && (
            <>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-amber-500 text-black">
                  {getInitials(currentPlayer.name)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-white font-medium">{currentPlayer.name}</p>
                <p className="text-amber-400 text-sm">
                  Score: {currentPlayer.score}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="text-right">
          <p className="text-amber-200 text-sm">Players: {players.length}</p>
          {isHost && (
            <p className="text-amber-400 text-xs">Host Controls Enabled</p>
          )}
        </div>
      </div>

      <Tabs
        defaultValue="categories"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full">
        <TabsList className="grid grid-cols-2 w-full bg-black/20 border border-amber-700/30">
          <TabsTrigger
            value="categories"
            className="data-[state=active]:bg-amber-600 data-[state=active]:text-black">
            Categories
          </TabsTrigger>
          <TabsTrigger
            value="leaderboard"
            className="data-[state=active]:bg-amber-600 data-[state=active]:text-black">
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-4">
          <div className="space-y-6">
            {categories.map((category) => (
              <Card
                key={category.id}
                className={`bg-black/60 border-amber-600/50 shadow-amber-400/10 shadow-lg overflow-hidden ${
                  category.locked ? 'border-red-600/50' : ''
                }`}>
                <CategoryView
                  category={category}
                  selectedNomineeId={predictions[category.id]}
                  onSelect={(nomineeId) =>
                    handlePredictionChange(category.id, nomineeId)
                  }
                  onLockCategory={() => handleLockCategory(category.id)}
                  onSetWinner={(nomineeId) =>
                    handleSetWinner(category.id, nomineeId)
                  }
                  isHost={isHost}
                />
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <LeaderboardView players={players} categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
