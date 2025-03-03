'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Player, CategoryWithNominees } from '@/types';

interface LeaderboardViewProps {
  players: Player[];
  categories: CategoryWithNominees[];
}

export default function LeaderboardView({ players, categories }: LeaderboardViewProps) {
  // Calculate how many categories have winners declared
  const completedCategories = categories.filter(category => 
    category.nominees.some(nominee => nominee.is_winner)
  ).length;
  
  // Sort players by score (should already be sorted, but just to be safe)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
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
    <div className="space-y-6">
      <Card className="bg-black/60 border-amber-600 shadow-amber-400/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-amber-400 flex justify-between items-center">
            <span>Leaderboard</span>
            <Badge className="bg-amber-600 text-black">
              {completedCategories} of {categories.length} categories decided
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => {
              const position = getPlayerPosition(index);
              
              return (
                <div 
                  key={player.id}
                  className={`
                    flex items-center p-3 rounded-lg
                    ${position === 1 ? 'bg-amber-500/20 border border-amber-500' : 
                      position === 2 ? 'bg-amber-600/10 border border-amber-600/70' :
                      position === 3 ? 'bg-amber-700/10 border border-amber-700/60' :
                      'bg-black/30'
                    }
                  `}
                >
                  <div className="font-bold text-xl w-8 text-center">
                    {getPositionBadge(position)}
                  </div>
                  
                  <Avatar className="h-10 w-10 mx-3">
                    <AvatarFallback 
                      className={`
                        ${position === 1 ? 'bg-amber-500 text-black' : 
                          position === 2 ? 'bg-amber-600/80 text-white' :
                          position === 3 ? 'bg-amber-700/80 text-white' :
                          'bg-gray-800 text-amber-400'
                        }
                      `}
                    >
                      {getInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
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
            
            {players.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No players yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-black/60 border-amber-600 shadow-amber-400/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-amber-400">
            How Scoring Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-white">
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
              <span>First place wins bragging rights (and maybe a real prize!)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}