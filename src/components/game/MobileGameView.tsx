// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SwipeableCards } from '@/components/ui/mobile-view';
import { Button } from '@/components/ui/button';
import {
  Player,
  CategoryWithNominees,
  Category,
  Nominee,
  Prediction,
} from '@/types';
import { createClient } from '@/utils/supabase/client';
import MobileCategoryView from './mobile-category-view';
import MobileLeaderboardView from '@/components/leaderboard/MobileLeaderboardView';
import MobileTriviaView from '@/components/trivia/mobile-trivia-view';
import { Spinner } from '@/components/ui/spinner';

interface MobileGameViewProps {
  lobbyCode: string;
}

// Mock trivia question for demo purposes
const mockTriviaQuestions = [
  {
    id: '1',
    question: 'Which movie won Best Picture at the Academy Awards in 2023?',
    options: [
      'Everything Everywhere All at Once',
      'Top Gun: Maverick',
      'Avatar: The Way of Water',
      'All Quiet on the Western Front'
    ],
    correctAnswer: 'Everything Everywhere All at Once',
    explanation: 'Everything Everywhere All at Once won Best Picture and six other Academy Awards including Best Actress for Michelle Yeoh.',
    points: 10
  },
  {
    id: '2',
    question: 'Who directed the 1994 film "Pulp Fiction"?',
    options: [
      'Quentin Tarantino',
      'Martin Scorsese',
      'Steven Spielberg',
      'Christopher Nolan'
    ],
    correctAnswer: 'Quentin Tarantino',
    explanation: 'Pulp Fiction was directed by Quentin Tarantino and won the Palme d\'Or at the 1994 Cannes Film Festival.',
    points: 10
  },
  {
    id: '3',
    question: 'Which actor played Tony Stark/Iron Man in the Marvel Cinematic Universe?',
    options: [
      'Robert Downey Jr.',
      'Chris Evans',
      'Chris Hemsworth',
      'Mark Ruffalo'
    ],
    correctAnswer: 'Robert Downey Jr.',
    explanation: 'Robert Downey Jr. portrayed Tony Stark/Iron Man in the MCU from 2008 to 2019.',
    points: 10
  }
];

export default function MobileGameView({ lobbyCode }: MobileGameViewProps) {
  const [categories, setCategories] = useState<CategoryWithNominees[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentMode, setCurrentMode] = useState<'categories' | 'trivia' | 'leaderboard'>('categories');
  const [triviaStreak, setTriviaStreak] = useState(0);
  const [currentTriviaIndex, setCurrentTriviaIndex] = useState(0);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const playerId = localStorage.getItem('oscarsPartyPlayerId');
    const lobbyId = localStorage.getItem('oscarsPartyLobbyId');

    if (!playerId || !lobbyId) {
      router.push('/join');
      return;
    }

    // Fetch game data
    const fetchGameData = async () => {
      try {
        const supabaseAny = supabase as any;

        const { data: playerData, error: playerError } = await supabaseAny
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();

        if (playerError) throw new Error(playerError.message);
        setCurrentPlayer(playerData);
        setIsHost(Boolean(playerData.is_host));

        const { data: playersData, error: playersError } = await supabaseAny
          .from('players')
          .select('*')
          .eq('lobby_id', lobbyId)
          .order('score', { ascending: false });

        if (playersError) throw new Error(playersError.message);
        setPlayers(playersData);

        const { data: categoriesData, error: categoriesError } = await supabaseAny
          .from('categories')
          .select('*')
          .eq('lobby_id', lobbyId)
          .order('"order"');

        if (categoriesError) throw new Error(categoriesError.message);

        const categoriesWithNominees: CategoryWithNominees[] = [];
        const typedCategories = (categoriesData || []) as Category[];

        for (const category of typedCategories) {
          const { data: nomineesData, error: nomineesError } = await supabaseAny
            .from('nominees')
            .select('*')
            .eq('category_id', category.id);

          if (nomineesError) throw new Error(nomineesError.message);

          categoriesWithNominees.push({
            ...category,
            nominees: (nomineesData || []) as Nominee[],
          });
        }

        setCategories(categoriesWithNominees);

        const { data: predictionsData, error: predictionsError } =
          await supabaseAny
            .from('predictions')
            .select('*')
            .eq('player_id', playerId);

        if (predictionsError) throw new Error(predictionsError.message);

        const predictionsMap: Record<string, string> = {};
        const typedPredictions = (predictionsData || []) as Prediction[];
        for (const prediction of typedPredictions) {
          if (prediction.category_id && prediction.nominee_id) {
            predictionsMap[prediction.category_id] = prediction.nominee_id;
          }
        }

        setPredictions(predictionsMap);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching game data:', error);
        if (isLoading) {
          toast.error('Failed to load game data', {
            description: 'There was an error loading the game data. Please try again.',
            id: 'game-data-error',
          });
        }
      }
    };

    fetchGameData();
    // Note: setupRealtimeSubscriptions was moved to its own useEffect
    
  }, [lobbyCode, router, supabase, isLoading]);
  
  // Move setupRealtimeSubscriptions into useEffect to fix dependency issue
  useEffect(() => {
    if (!isLoading && lobbyCode) {
      const playerId = localStorage.getItem('oscarsPartyPlayerId');
      const lobbyId = localStorage.getItem('oscarsPartyLobbyId');
      
      if (playerId && lobbyId) {
        // Setup realtime subscriptions
        const setupRealtimeSubscriptions = () => {
    // Subscribe to player changes for leaderboard updates
    const playersChannel = supabase
      .channel('game-players')
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
            setPlayers((current) =>
              [...current, payload.new as Player].sort(
                (a, b) => b.score - a.score
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
                .sort((a, b) => b.score - a.score)
            );

            if (payload.new.id === currentPlayer?.id) {
              setCurrentPlayer(payload.new as Player);
            }
          }
        }
      )
      .subscribe();
      
    return playersChannel;
  };
  
  // Execute the setupRealtimeSubscriptions function
  const playersChannel = setupRealtimeSubscriptions();
  
  // Clean up on unmount
  return () => {
    supabase.removeChannel(playersChannel);
  };
      }
    }
  }, [isLoading, lobbyCode, supabase, currentPlayer?.id]);

  const handlePredictionChange = async (categoryId: string, nomineeId: string) => {
    if (!currentPlayer) return;

    try {
      const { error } = await supabase.from('predictions').upsert(
        {
          player_id: currentPlayer.id,
          category_id: categoryId,
          nominee_id: nomineeId,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'player_id,category_id',
        }
      );

      if (error) throw new Error(error.message);

      setPredictions({
        ...predictions,
        [categoryId]: nomineeId,
      });
    } catch (error) {
      console.error('Error making prediction:', error);
      toast.error('Failed to make prediction', {
        description: 'There was an error saving your prediction. Please try again.',
        id: 'prediction-error',
      });
    }
  };

  const handleLockCategory = async (categoryId: string) => {
    if (!isHost) return;

    try {
      const { error } = await supabase
        .from('categories')
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
        description: 'There was an error locking the category. Please try again.',
        id: 'lock-category-error',
      });
    }
  };

  const handleSetWinner = async (categoryId: string, nomineeId: string) => {
    if (!isHost) return;

    try {
      const { error: resetError } = await supabase
        .from('nominees')
        .update({
          is_winner: false,
        })
        .eq('category_id', categoryId);

      if (resetError) throw new Error(resetError.message);

      const { error } = await supabase
        .from('nominees')
        .update({
          is_winner: true,
        })
        .eq('id', nomineeId);

      if (error) throw new Error(error.message);

      await supabase
        .from('categories')
        .update({
          locked: true,
        })
        .eq('id', categoryId);

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
  
  const handleTriviaAnswer = (answer: string) => {
    if (answer === mockTriviaQuestions[currentTriviaIndex].correctAnswer) {
      setTriviaStreak(prev => prev + 1);
    } else {
      setTriviaStreak(0);
    }
  };
  
  const handleNextTrivia = () => {
    if (currentTriviaIndex < mockTriviaQuestions.length - 1) {
      setCurrentTriviaIndex(prev => prev + 1);
    } else {
      setCurrentMode('leaderboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Spinner size="xl" color="accent" className="mb-6" />
        <div className="text-amber-400 text-xl">Loading game...</div>
      </div>
    );
  }
  
  if (currentMode === 'categories' && categories.length > 0) {
    return (
      <MobileCategoryView
        category={categories[currentCategoryIndex]}
        selectedNomineeId={predictions[categories[currentCategoryIndex].id]}
        onSelect={(nomineeId) => handlePredictionChange(categories[currentCategoryIndex].id, nomineeId)}
        onLockCategory={() => handleLockCategory(categories[currentCategoryIndex].id)}
        onSetWinner={(nomineeId) => handleSetWinner(categories[currentCategoryIndex].id, nomineeId)}
        isHost={isHost}
        totalCategories={categories.length}
        currentIndex={currentCategoryIndex}
        onNext={() => {
          if (currentCategoryIndex < categories.length - 1) {
            setCurrentCategoryIndex(currentCategoryIndex + 1);
          } else {
            setCurrentMode('trivia');
          }
        }}
        onPrev={() => {
          if (currentCategoryIndex > 0) {
            setCurrentCategoryIndex(currentCategoryIndex - 1);
          }
        }}
      />
    );
  }
  
  if (currentMode === 'trivia') {
    return (
      <MobileTriviaView
        question={mockTriviaQuestions[currentTriviaIndex]}
        onAnswer={handleTriviaAnswer}
        streak={triviaStreak}
        onNext={handleNextTrivia}
        currentQuestionNumber={currentTriviaIndex + 1}
        totalQuestions={mockTriviaQuestions.length}
      />
    );
  }
  
  if (currentMode === 'leaderboard') {
    return (
      <MobileLeaderboardView 
        players={players}
        categories={categories}
        onBackToGame={() => {
          setCurrentMode('categories');
          setCurrentCategoryIndex(0);
        }}
      />
    );
  }
  
  // Fallback
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-amber-400 text-xl mb-6">No categories found</div>
      <Button 
        onClick={() => router.push('/')} 
        className="bg-amber-500 hover:bg-amber-400 text-black"
      >
        Back to Home
      </Button>
    </div>
  );
}