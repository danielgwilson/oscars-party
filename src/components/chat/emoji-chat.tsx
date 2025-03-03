"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Player, ChatMessage } from '@/types';
import { X } from 'lucide-react';

interface EmojiChatProps {
  lobbyId: string;
  player: Player;
  players: Player[];
  onSendEmoji: (emoji: string) => void;
  messages: ChatMessage[];
  className?: string;
}

const EMOJI_OPTIONS = [
  '😂', '🔥', '👏', '😮', '❤️', '👍', '🤔', '😭', 
  '🙄', '🤦‍♂️', '👎', '🤯', '🍿', '🎬', '💩', '🤡'
];

export default function EmojiChat({
  lobbyId,
  player,
  players,
  onSendEmoji,
  messages,
  className
}: EmojiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  
  // Group messages by emoji for the emoji counter
  const messageGroups = messages.reduce((acc, msg) => {
    if (!acc[msg.emoji]) {
      acc[msg.emoji] = [];
    }
    acc[msg.emoji].push(msg);
    return acc;
  }, {} as Record<string, ChatMessage[]>);
  
  // Show newest messages and auto-hide them after 5 seconds
  useEffect(() => {
    // Add new messages to visible messages
    setVisibleMessages(messages.slice(-5));
    
    // Create timers to remove messages after 5 seconds
    const timers = messages.map((msg, index) => {
      return setTimeout(() => {
        setVisibleMessages(prev => prev.filter(m => m.id !== msg.id));
      }, 5000 + (index * 300)); // Stagger removal times
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [messages]);
  
  const toggleEmojiPanel = () => {
    setIsOpen(!isOpen);
  };
  
  const handleSendEmoji = (emoji: string) => {
    onSendEmoji(emoji);
    setIsOpen(false);
  };
  
  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown';
  };
  
  return (
    <div className={`fixed left-0 right-0 z-10 ${className}`}>
      {/* Emoji reactions floating above */}
      <div className="flex flex-col-reverse items-end mb-2 max-h-48 overflow-hidden pointer-events-none">
        {visibleMessages.map((msg) => (
          <div 
            key={msg.id}
            className="inline-flex items-center bg-black/60 text-white text-sm rounded-full px-3 py-1 mb-2 mr-2 backdrop-blur-sm animate-float"
          >
            <span className="mr-2">{msg.emoji}</span>
            <span className="opacity-70 text-xs">{getPlayerName(msg.player_id)}</span>
          </div>
        ))}
      </div>
      
      {/* Emoji panel */}
      {isOpen && (
        <div className="bg-black/80 backdrop-blur-md rounded-t-lg border border-amber-700/50 p-3 animate-slideUp">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-amber-400 text-sm font-medium">Send Reaction</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-amber-400" 
              onClick={toggleEmojiPanel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-8 gap-2">
            {EMOJI_OPTIONS.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                className="h-10 w-10 text-xl hover:bg-amber-950/50"
                onClick={() => handleSendEmoji(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
          
          {/* Active emoji counts */}
          {Object.keys(messageGroups).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(messageGroups).map(([emoji, msgs]) => (
                <Badge 
                  key={emoji}
                  className="bg-amber-950/60 text-amber-300 hover:bg-amber-900/80 cursor-pointer"
                  onClick={() => handleSendEmoji(emoji)}
                >
                  {emoji} {msgs.length > 1 && <span className="ml-1">{msgs.length}</span>}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Emoji toggle button */}
      <Button
        onClick={toggleEmojiPanel}
        className={`
          w-full py-2 rounded-none flex items-center justify-center
          ${isOpen 
            ? 'bg-amber-700 hover:bg-amber-600 text-white' 
            : 'bg-black/70 hover:bg-black/90 text-amber-400 border-t border-amber-800/30'}
        `}
      >
        {isOpen ? 'Close' : '📢 React With Emoji'}
      </Button>
    </div>
  );
}