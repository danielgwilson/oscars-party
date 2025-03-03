"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from '@/lib/utils';
import { Button } from './button';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCard({ children, className }: MobileCardProps) {
  return (
    <div 
      className={cn(
        "w-full max-w-md mx-auto h-screen max-h-[800px] overflow-hidden flex flex-col bg-black/80 border border-amber-600/30 rounded-lg shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

interface MobileCardHeaderProps {
  title: string;
  subtitle?: string;
  progress?: number; // 0-100
  onBack?: () => void;
  className?: string;
}

export function MobileCardHeader({ 
  title, 
  subtitle, 
  progress,
  onBack,
  className 
}: MobileCardHeaderProps) {
  return (
    <div className={cn("px-4 py-3 border-b border-amber-700/30", className)}>
      <div className="flex items-center">
        {onBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 text-amber-400 hover:bg-amber-950/50" 
            onClick={onBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-amber-400">{title}</h2>
          {subtitle && <p className="text-sm text-amber-200/80">{subtitle}</p>}
        </div>
      </div>
      
      {typeof progress === 'number' && (
        <div className="w-full h-1 bg-amber-900/30 mt-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface MobileCardContentProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

export function MobileCardContent({ 
  children, 
  className, 
  fullHeight = false 
}: MobileCardContentProps) {
  return (
    <div 
      className={cn(
        "px-4 py-5 flex-1 overflow-y-auto",
        fullHeight && "flex flex-col justify-center",
        className
      )}
    >
      {children}
    </div>
  );
}

interface MobileCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCardFooter({ children, className }: MobileCardFooterProps) {
  return (
    <div className={cn("px-4 py-3 border-t border-amber-700/30", className)}>
      {children}
    </div>
  );
}

interface SwipeableCardsProps {
  children: React.ReactNode[];
  onSwipe?: (direction: 'left' | 'right', currentIndex: number) => void;
  onCardChange?: (index: number) => void;
  initialIndex?: number;
  className?: string;
}

export function SwipeableCards({ 
  children,
  onSwipe,
  onCardChange,
  initialIndex = 0,
  className 
}: SwipeableCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const currentOffsetX = useRef<number>(0);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      onCardChange?.(currentIndex - 1);
      onSwipe?.('left', currentIndex);
    }
  };

  const handleNext = () => {
    if (currentIndex < children.length - 1) {
      setCurrentIndex(currentIndex + 1);
      onCardChange?.(currentIndex + 1);
      onSwipe?.('right', currentIndex);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchCurrentX = e.touches[0].clientX;
    const diffX = touchCurrentX - touchStartX.current;
    
    // Limit the drag to prevent going too far
    const maxSwipe = 100; // max pixels to drag
    const boundedDiffX = Math.max(Math.min(diffX, maxSwipe), -maxSwipe);
    
    currentOffsetX.current = boundedDiffX;
    
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${-currentIndex * 100}%) translateX(${boundedDiffX}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    
    const threshold = 50; // minimum distance to trigger swipe
    
    if (currentOffsetX.current > threshold) {
      handlePrev();
    } else if (currentOffsetX.current < -threshold) {
      handleNext();
    }
    
    touchStartX.current = null;
    currentOffsetX.current = 0;
    
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${-currentIndex * 100}%)`;
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${-currentIndex * 100}%)`;
    }
  }, [currentIndex]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      <div 
        ref={containerRef}
        className="flex w-full h-full transition-transform duration-300 ease-out"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children.map((child, index) => (
          <div key={index} className="w-full h-full flex-shrink-0">
            {child}
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {children.map((_, index) => (
          <div 
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentIndex 
                ? "bg-amber-400 w-4" 
                : "bg-amber-700/40"
            )}
          />
        ))}
      </div>
      
      {currentIndex > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/40 text-amber-400 hover:bg-black/60"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}
      
      {currentIndex < children.length - 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/40 text-amber-400 hover:bg-black/60"
          onClick={handleNext}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}

interface OptionCardProps {
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function OptionCard({ 
  selected, 
  disabled, 
  onClick, 
  children, 
  className 
}: OptionCardProps) {
  return (
    <div 
      className={cn(
        "p-4 rounded-lg border transition-all cursor-pointer mb-3",
        selected 
          ? "bg-amber-500/20 border-amber-500 shadow-md shadow-amber-500/10" 
          : "bg-black/40 border-amber-700/30 hover:border-amber-600/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </div>
  );
}

interface CountdownTimerProps {
  seconds: number;
  onComplete?: () => void;
  className?: string;
}

export function CountdownTimer({ seconds, onComplete, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const percentage = (timeLeft / seconds) * 100;
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 0.1);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [timeLeft, onComplete, seconds]);
  
  return (
    <div className={cn("w-full h-2 bg-amber-900/30 rounded-full overflow-hidden", className)}>
      <div 
        className={cn(
          "h-full rounded-full transition-all duration-100 ease-linear",
          percentage > 50 ? "bg-green-500" :
          percentage > 25 ? "bg-amber-500" :
          "bg-red-500"
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

interface StreakIndicatorProps {
  streak: number;
  className?: string;
}

export function StreakIndicator({ streak, className }: StreakIndicatorProps) {
  if (streak < 2) return null;
  
  return (
    <div className={cn(
      "inline-flex items-center px-2 py-1 rounded-full bg-amber-500 text-black font-bold text-sm",
      className
    )}>
      <span className="mr-1">🔥</span> {streak}
    </div>
  );
}

interface ConfettiProps {
  active: boolean;
}

export function Confetti({ active }: ConfettiProps) {
  const [particles, setParticles] = useState<{id: number, x: number, y: number, color: string, size: number, speed: number}[]>([]);
  
  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }
    
    const colors = ['#FFD700', '#FFA500', '#FF4500', '#8A2BE2', '#00BFFF', '#32CD32'];
    const newParticles = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 5 + Math.random() * 10,
      speed: 2 + Math.random() * 4
    }));
    
    setParticles(newParticles);
    
    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            y: p.y + p.speed,
            x: p.x + (Math.random() - 0.5)
          }))
          .filter(p => p.y < 120)
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, [active]);
  
  if (!active) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}