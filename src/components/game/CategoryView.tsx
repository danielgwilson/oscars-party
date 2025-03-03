'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryWithNominees } from '@/types';

interface CategoryViewProps {
  category: CategoryWithNominees;
  selectedNomineeId?: string;
  onSelect: (nomineeId: string) => void;
  onLockCategory: () => void;
  onSetWinner: (nomineeId: string) => void;
  isHost: boolean;
}

export default function CategoryView({
  category,
  selectedNomineeId,
  onSelect,
  onLockCategory,
  onSetWinner,
  isHost,
}: CategoryViewProps) {
  const [expandedNomineeId, setExpandedNomineeId] = useState<string | null>(null);
  
  const toggleNomineeDetails = (nomineeId: string) => {
    if (expandedNomineeId === nomineeId) {
      setExpandedNomineeId(null);
    } else {
      setExpandedNomineeId(nomineeId);
    }
  };
  
  const getWinnerNominee = () => {
    return category.nominees.find(nominee => nominee.is_winner);
  };
  
  const winnerNominee = getWinnerNominee();

  return (
    <>
      <CardHeader className={`pb-2 ${category.locked ? 'bg-red-950/30' : ''}`}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-amber-400">
              {category.name}
              {category.locked && !winnerNominee && (
                <Badge className="ml-2 bg-red-600 text-white">Locked</Badge>
              )}
              {winnerNominee && (
                <Badge className="ml-2 bg-amber-500 text-black">Winner Announced</Badge>
              )}
            </CardTitle>
            {category.description && (
              <CardDescription className="text-amber-200 mt-1">
                {category.description}
              </CardDescription>
            )}
          </div>
          
          {isHost && !category.locked && (
            <Button 
              variant="outline" 
              size="sm"
              className="border-red-500 text-red-400 hover:bg-red-500/10"
              onClick={onLockCategory}
            >
              Lock Voting
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {category.nominees.map((nominee) => (
            <div 
              key={nominee.id}
              className={`
                relative p-3 rounded-lg cursor-pointer transition-all
                ${nominee.is_winner 
                  ? 'bg-amber-500/30 border border-amber-500' 
                  : selectedNomineeId === nominee.id
                    ? 'bg-amber-600/20 border border-amber-600/70'
                    : 'bg-black/30 border border-transparent hover:bg-black/40'
                }
                ${category.locked && !nominee.is_winner ? 'opacity-60' : ''}
              `}
              onClick={() => {
                if (!category.locked) {
                  onSelect(nominee.id);
                }
              }}
            >
              <div className="flex items-center">
                {nominee.image_url && (
                  <div className="w-12 h-16 mr-3 relative bg-gray-900 rounded overflow-hidden">
                    <Image
                      src={nominee.image_url}
                      alt={nominee.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className={`font-medium ${nominee.is_winner ? 'text-amber-400' : 'text-white'}`}>
                    {nominee.name}
                  </h3>
                  
                  {nominee.movie && (
                    <p className="text-sm text-gray-300">
                      {nominee.movie}
                    </p>
                  )}
                  
                  {(nominee.director || nominee.country) && (
                    <div className="mt-1 text-xs text-gray-400">
                      {nominee.director && <span>{nominee.director}</span>}
                      {nominee.director && nominee.country && <span> · </span>}
                      {nominee.country && <span>{nominee.country}</span>}
                    </div>
                  )}
                </div>
                
                {nominee.is_winner && (
                  <div className="absolute right-2 top-2 text-xl">🏆</div>
                )}
              </div>
              
              {expandedNomineeId === nominee.id && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  {nominee.producers && nominee.producers.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-400">Producers:</p>
                      <p className="text-sm text-gray-300">
                        {Array.isArray(nominee.producers) 
                          ? nominee.producers.join(', ')
                          : nominee.producers}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Info button */}
              {(nominee.producers && nominee.producers.length > 0) && (
                <button 
                  className="absolute right-2 bottom-2 text-xs text-amber-500 hover:text-amber-400"
                  onClick={(e) => {
                    e.stopPropagation(); // Don't trigger the parent click
                    toggleNomineeDetails(nominee.id);
                  }}
                >
                  {expandedNomineeId === nominee.id ? 'Less info' : 'More info'}
                </button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      
      {isHost && category.locked && !winnerNominee && (
        <CardFooter className="pt-2 bg-red-950/10">
          <div className="w-full">
            <p className="text-sm text-red-300 mb-2">Host Controls: Select the winner</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {category.nominees.map(nominee => (
                <Button
                  key={nominee.id}
                  variant="outline"
                  size="sm"
                  className="border-amber-500 text-amber-400 hover:bg-amber-500/10 text-xs"
                  onClick={() => onSetWinner(nominee.id)}
                >
                  {nominee.name}
                </Button>
              ))}
            </div>
          </div>
        </CardFooter>
      )}
    </>
  );
}