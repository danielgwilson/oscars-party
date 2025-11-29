// @ts-nocheck
"use client";

import React from 'react';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardFooter } from '../ui/mobile-view';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FinalBurn as FinalBurnType, Player, ShameMovie } from '@/types';
import { Flame, Award, TrendingDown } from 'lucide-react';

interface FinalBurnViewProps {
  finalBurn: FinalBurnType;
  players: Player[];
  shameMovies?: ShameMovie[];
  onFinish: () => void;
}

export default function FinalBurnView({
  finalBurn,
  players,
  shameMovies = [],
  onFinish
}: FinalBurnViewProps) {
  // Sort players by score in descending order
  const sortedPlayers = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  
  // Get the worst player (the one being roasted)
  const worstPlayer = finalBurn.worst_player_id
    ? players.find(p => p.id === finalBurn.worst_player_id)
    : sortedPlayers[sortedPlayers.length - 1];
    
  return (
    <MobileCard>
      <MobileCardHeader
        title="Final Results & Burn"
        subtitle="The ultimate roast for the ultimate loser"
      />
      
      <MobileCardContent className="pb-20">
        <div className="mb-6">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-700 flex items-center justify-center">
              <Flame className="h-8 w-8 text-amber-300" />
            </div>
          </div>
          
          <h2 className="text-center text-2xl font-bold text-amber-400 mb-2">
            Grand Roast
          </h2>
          
          {worstPlayer && (
            <div className="text-center mb-4">
              <Badge className="bg-red-700 text-white px-3 py-1">
                <TrendingDown className="h-3 w-3 mr-1" />
                Worst Player: {worstPlayer.name}
              </Badge>
            </div>
          )}
          
          <div className="p-4 rounded-lg bg-red-950/30 border border-red-800/50 text-white mb-6">
            <p className="italic text-lg leading-relaxed">&quot;{finalBurn.content}&quot;</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-amber-300 mb-3 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Final Leaderboard
          </h3>
          
          <div className="space-y-2">
            {sortedPlayers.map((player, index) => (
              <div 
                key={player.id}
                className={`
                  flex items-center justify-between p-3 rounded-md
                  ${index === 0 ? 'bg-amber-700/30 border border-amber-500' : 'bg-amber-950/30 border border-amber-800/30'}
                `}
              >
                <div className="flex items-center">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center mr-2 font-bold text-sm
                    ${index === 0 ? 'bg-amber-400 text-black' : 'bg-amber-900 text-amber-400'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-white">{player.name}</div>
                    <div className="text-xs text-amber-300/70">
                      {player.correct_answers} correct • {player.incorrect_answers} wrong
                    </div>
                  </div>
                </div>
                <div className="text-xl font-bold text-amber-400">
                  {player.score}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {shameMovies.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-amber-300 mb-3">
              The Shame List
            </h3>
            <p className="text-sm text-amber-200/70 mb-4">
              Movies you should probably watch before playing again:
            </p>
            
            <div className="space-y-2">
              {shameMovies.map((movie) => {
                const relatedPlayer = players.find(p => p.id === movie.player_id);
                return (
                  <div 
                    key={movie.id}
                    className="p-3 rounded-md bg-amber-950/30 border border-amber-800/30"
                  >
                    <div className="flex justify-between mb-1">
                      <div className="font-medium text-white">{movie.movie_title}</div>
                      {relatedPlayer && (
                        <Badge variant="outline" className="border-amber-700 text-amber-400">
                          {relatedPlayer.name}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-amber-200/70">
                      {movie.reason}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </MobileCardContent>
      
      <MobileCardFooter className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm">
        <Button 
          onClick={onFinish}
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-medium"
        >
          Finish Game
        </Button>
      </MobileCardFooter>
    </MobileCard>
  );
}