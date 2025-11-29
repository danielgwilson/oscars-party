import React, { useState } from 'react';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  MobileCard, 
  MobileCardHeader, 
  MobileCardContent, 
  MobileCardFooter,
  OptionCard,
  CountdownTimer,
  StreakIndicator,
  Confetti
} from '../ui/mobile-view';
import { CategoryWithNominees } from '@/types';
import { useRouter } from 'next/navigation';

interface MobileCategoryViewProps {
  category: CategoryWithNominees;
  selectedNomineeId?: string;
  onSelect: (nomineeId: string) => void;
  onLockCategory?: () => void;
  onSetWinner?: (nomineeId: string) => void;
  isHost: boolean;
  totalCategories: number;
  currentIndex: number;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function MobileCategoryView({
  category,
  selectedNomineeId,
  onSelect,
  onLockCategory,
  onSetWinner,
  isHost,
  totalCategories,
  currentIndex,
  onNext,
  onPrev
}: MobileCategoryViewProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedNomineeId);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const router = useRouter();
  
  const handleSelectNominee = (nomineeId: string) => {
    if (category.locked) return;
    
    setSelectedId(nomineeId);
    onSelect(nomineeId);
    
    // Simulate streaks for demo purposes
    if (Math.random() > 0.4) {
      setStreakCount(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      setStreakCount(0);
    }
  };
  
  const getWinnerNominee = () => {
    return category.nominees.find(nominee => nominee.is_winner);
  };
  
  const winnerNominee = getWinnerNominee();
  const progress = ((currentIndex + 1) / totalCategories) * 100;
  
  return (
    <MobileCard>
      <Confetti active={showConfetti} />
      
      <MobileCardHeader
        title={category.name}
        subtitle={category.description ?? undefined}
        progress={progress}
        onBack={() => router.push('/')}
      />
      
      <MobileCardContent className="pb-20">
        <div className="mb-4 flex justify-between items-center">
          {category.locked ? (
            <Badge className="bg-red-600 text-white">Locked</Badge>
          ) : (
            <Badge className="bg-green-600 text-white">Open for predictions</Badge>
          )}
          
          <StreakIndicator streak={streakCount} />
        </div>

        {category.locked && !winnerNominee && (
          <div className="mb-4 text-amber-200 text-sm">
            Predictions are locked. Waiting for winner to be announced...
          </div>
        )}
        
        {winnerNominee && (
          <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500 rounded-lg">
            <p className="text-amber-200 font-medium mb-1">Winner announced:</p>
            <p className="text-amber-400 font-bold text-lg">{winnerNominee.name}</p>
            {winnerNominee.movie && (
              <p className="text-amber-300/80 text-sm">{winnerNominee.movie}</p>
            )}
          </div>
        )}
        
        <div className="mt-4 space-y-2">
          {category.nominees.map((nominee) => (
            <OptionCard
              key={nominee.id}
              selected={selectedId === nominee.id}
              disabled={Boolean(category.locked)}
              onClick={() => handleSelectNominee(nominee.id)}
            >
              <div className="flex gap-3">
                {nominee.image_url ? (
                  <div className="w-16 h-16 relative overflow-hidden rounded-md flex-shrink-0">
                    <Image
                      src={nominee.image_url}
                      alt={nominee.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-amber-900/20 flex-shrink-0 rounded-md flex items-center justify-center text-amber-400 text-2xl">
                    🎬
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="font-medium text-amber-400">
                    {nominee.name}
                    {nominee.is_winner && (
                      <span className="ml-2 text-yellow-300">🏆</span>
                    )}
                  </h3>
                  
                  {nominee.movie && (
                    <p className="text-amber-300/70 text-sm">{nominee.movie}</p>
                  )}
                  
                  {selectedId === nominee.id && winnerNominee && (
                    <div className="mt-1">
                      {nominee.id === winnerNominee.id ? (
                        <Badge className="bg-green-600 text-white">Correct prediction +10</Badge>
                      ) : (
                        <Badge className="bg-red-600/80 text-white">Incorrect prediction</Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </OptionCard>
          ))}
        </div>
      </MobileCardContent>
      
      <MobileCardFooter className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            disabled={currentIndex === 0}
            onClick={onPrev}
            className="border-amber-600 text-amber-400"
          >
            Previous
          </Button>
          
          {isHost && !category.locked && (
            <Button 
              variant="destructive" 
              onClick={onLockCategory}
              size="sm"
            >
              Lock Category
            </Button>
          )}
          
          {isHost && category.locked && !winnerNominee && selectedId && (
            <Button 
              variant="default" 
              onClick={() => onSetWinner?.(selectedId)}
              className="bg-amber-500 hover:bg-amber-400 text-black"
              size="sm"
            >
              Set as Winner
            </Button>
          )}
          
          <Button 
            variant="default" 
            disabled={currentIndex === totalCategories - 1}
            onClick={onNext}
            className="bg-amber-500 hover:bg-amber-400 text-black"
          >
            Next
          </Button>
        </div>
      </MobileCardFooter>
    </MobileCard>
  );
}