"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Question, Roast, Movie } from '@/types';

interface MobileTriviaViewProps {
  question: Question;
  roast?: Roast;
  movie?: Movie;
  onAnswer: (answer: string) => void;
  streak: number;
  onNext: () => void;
  currentQuestionNumber: number;
  totalQuestions: number;
  playerName: string;
}

export default function MobileTriviaView({
  question,
  roast,
  movie,
  onAnswer,
  streak,
  onNext,
  currentQuestionNumber,
  totalQuestions,
  playerName
}: MobileTriviaViewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRoast, setShowRoast] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds to answer
  const [pointsEarned, setPointsEarned] = useState(0);
  
  const isCorrect = selectedAnswer === question.correct_answer;
  const progress = (currentQuestionNumber / totalQuestions) * 100;
  
  useEffect(() => {
    // Reset state when question changes
    setSelectedAnswer(null);
    setShowAnswer(false);
    setShowConfetti(false);
    setShowRoast(false);
    setTimeLeft(15);
    setPointsEarned(0);
  }, [question]);
  
  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer) return; // Prevent changing answer
    
    setSelectedAnswer(answer);
    onAnswer(answer);
    setShowAnswer(true);
    
    // Calculate points based on time left and if correct
    if (answer === question.correct_answer) {
      const timeBonus = Math.floor(timeLeft * 2);
      const streakBonus = streak > 1 ? Math.min(streak * 5, 25) : 0;
      const totalPoints = question.points + timeBonus + streakBonus;
      
      setPointsEarned(totalPoints);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      // Show roast if incorrect and roast exists
      if (roast) {
        setTimeout(() => setShowRoast(true), 500);
      }
    }
  };
  
  const handleTimeUp = () => {
    if (!selectedAnswer) {
      setSelectedAnswer('');
      setShowAnswer(true);
      onAnswer('');
    }
  };
  
  return (
    <MobileCard>
      <Confetti active={showConfetti} />
      
      <MobileCardHeader
        title="Movie Trivia"
        subtitle={`Question ${currentQuestionNumber} of ${totalQuestions}`}
        progress={progress}
      />
      
      <MobileCardContent className="pb-20">
        {/* Movie info if available */}
        {movie && question.movie_id && !showAnswer && (
          <div className="mb-5 p-3 rounded-lg bg-amber-950/40 flex items-center">
            {movie.poster_path && (
              <div className="w-14 h-20 flex-shrink-0 mr-3">
                <Image 
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                  alt={movie.title}
                  className="w-full h-full object-cover rounded"
                  width={92}
                  height={138}
                />
              </div>
            )}
            <div className="flex-1">
              <h4 className="text-amber-400 font-medium text-sm">{movie.title}</h4>
              <p className="text-amber-200/70 text-xs">
                {movie.release_date && new Date(movie.release_date).getFullYear()} 
                {movie.director && ` • Directed by ${movie.director}`}
              </p>
            </div>
          </div>
        )}
        
        <div className="mb-4 flex justify-between items-center">
          <Badge className="bg-amber-600 text-white">
            {showAnswer ? 'Answer revealed' : `${timeLeft.toFixed(0)}s remaining`}
          </Badge>
          
          <StreakIndicator streak={streak} />
        </div>
        
        {!showAnswer && (
          <div className="mb-3">
            <CountdownTimer seconds={15} onComplete={handleTimeUp} />
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-xl font-medium text-amber-300 mb-4">{question.question}</h3>
          
          {question.image_url && (
            <div 
              className="w-full h-48 mb-4 bg-cover bg-center rounded-lg" 
              style={{ backgroundImage: `url(${question.image_url})` }}
            />
          )}
        </div>
        
        <div className="space-y-3 mb-4">
          {question.options.map((option) => (
            <OptionCard
              key={option}
              selected={selectedAnswer === option}
              disabled={showAnswer && selectedAnswer !== option}
              onClick={() => handleSelectAnswer(option)}
              className={
                showAnswer && option === question.correct_answer
                  ? "bg-green-600/20 border-green-500"
                  : showAnswer && selectedAnswer === option && option !== question.correct_answer
                  ? "bg-red-600/20 border-red-500"
                  : undefined
              }
            >
              <div className="flex items-center">
                <div className="flex-1 text-white">
                  {option}
                </div>
                
                {showAnswer && option === question.correct_answer && (
                  <Badge className="bg-green-600 ml-2">✓ Correct</Badge>
                )}
                
                {showAnswer && selectedAnswer === option && option !== question.correct_answer && (
                  <Badge className="bg-red-600 ml-2">✗ Incorrect</Badge>
                )}
              </div>
            </OptionCard>
          ))}
        </div>
        
        {/* AI Roast when answer is wrong */}
        {showAnswer && !isCorrect && showRoast && roast && (
          <div className="p-4 rounded-lg bg-red-950/30 border border-red-800/50 text-white mb-4 animate-fadeIn">
            <p className="font-medium text-red-400 text-sm mb-1">AI Roast:</p>
            <p className="italic">&quot;{roast.content}&quot;</p>
          </div>
        )}
        
        {/* Explanation */}
        {showAnswer && question.explanation && (
          <div className="p-3 rounded-lg bg-amber-900/20 text-amber-200 text-sm">
            <p className="font-medium text-amber-300 mb-1">Explanation:</p>
            <p>{question.explanation}</p>
          </div>
        )}
        
        {/* Points earned */}
        {showAnswer && isCorrect && pointsEarned > 0 && (
          <div className="mt-4 text-center">
            <div className="text-amber-400 font-bold text-2xl animate-bounce">
              +{pointsEarned} points!
            </div>
            <div className="text-amber-300/70 text-sm">
              (Base: {question.points} + Time: {pointsEarned - question.points - (streak > 1 ? Math.min(streak * 5, 25) : 0)} + Streak: {streak > 1 ? Math.min(streak * 5, 25) : 0})
            </div>
          </div>
        )}
      </MobileCardContent>
      
      <MobileCardFooter className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm">
        {showAnswer ? (
          <Button 
            onClick={onNext}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-medium"
          >
            Next Question
          </Button>
        ) : (
          <div className="text-center text-amber-300 text-sm">
            Select an answer
          </div>
        )}
      </MobileCardFooter>
    </MobileCard>
  );
}