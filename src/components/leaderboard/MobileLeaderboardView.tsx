import { Player, CategoryWithNominees } from '@/types';
import { 
  MobileCard, 
  MobileCardHeader, 
  MobileCardContent, 
  MobileCardFooter 
} from '../ui/mobile-view';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface MobileLeaderboardViewProps {
  players: Player[];
  categories: CategoryWithNominees[];
  onBackToGame: () => void;
}

export default function MobileLeaderboardView({ 
  players, 
  categories,
  onBackToGame
}: MobileLeaderboardViewProps) {
  // Calculate how many categories have winners declared
  const completedCategories = categories.filter(category => 
    category.nominees.some(nominee => nominee.is_winner)
  ).length;
  
  // Sort players by score (should already be sorted, but just to be safe)
  const sortedPlayers = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getPlayerPosition = (index: number) => {
    // Handle ties by looking at previous player's score
    if (index > 0 && sortedPlayers[index].score === sortedPlayers[index - 1].score) {
      // Same score as previous player, so same position
      return getPlayerPosition(index - 1);
    }
    return index + 1;
  };
  
  const getPositionBadge = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `${position}`;
  };

  return (
    <MobileCard>
      <MobileCardHeader
        title="Leaderboard"
        subtitle={`${completedCategories} of ${categories.length} categories completed`}
      />
      
      <MobileCardContent className="pb-20">
        {sortedPlayers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No players yet
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => {
              const position = getPlayerPosition(index);
              
              return (
                <div 
                  key={player.id}
                  className={`
                    flex items-center p-4 rounded-lg
                    ${position === 1 ? 'bg-amber-500/20 border border-amber-500' : 
                      position === 2 ? 'bg-amber-600/10 border border-amber-600/70' :
                      position === 3 ? 'bg-amber-700/10 border border-amber-700/60' :
                      'bg-black/40 border border-amber-700/30'
                    }
                  `}
                >
                  <div className="font-bold text-xl w-8 text-center">
                    {getPositionBadge(position)}
                  </div>
                  
                  <div className="ml-3 h-10 w-10 flex-shrink-0 rounded-full bg-amber-700/40 flex items-center justify-center">
                    <span className={`text-sm font-bold
                      ${position === 1 ? 'text-amber-300' : 
                        position === 2 ? 'text-amber-300/80' :
                        position === 3 ? 'text-amber-300/70' :
                        'text-amber-400/60'
                      }
                    `}>
                      {getInitials(player.name)}
                    </span>
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-white">
                      {player.name}
                      {player.is_host && (
                        <span className="ml-2 text-xs text-amber-400">(Host)</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-amber-400">
                      {player.score}
                    </div>
                    <div className="text-xs text-gray-400">
                      points
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-black/40 border border-amber-700/30 rounded-lg">
          <h3 className="text-lg font-medium text-amber-400 mb-3">
            How Scoring Works
          </h3>
          <ul className="space-y-2 text-sm text-white">
            <li className="flex">
              <span className="mr-2 text-amber-400">✓</span>
              <span>10 points for each correct prediction</span>
            </li>
            <li className="flex">
              <span className="mr-2 text-amber-400">✓</span>
              <span>Bonus points for correct trivia answers</span>
            </li>
            <li className="flex">
              <span className="mr-2 text-amber-400">✓</span>
              <span>Streak bonuses for consecutive correct answers</span>
            </li>
          </ul>
        </div>
      </MobileCardContent>
      
      <MobileCardFooter className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm">
        <Button 
          onClick={onBackToGame}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-medium"
        >
          Back to Game
        </Button>
      </MobileCardFooter>
    </MobileCard>
  );
}