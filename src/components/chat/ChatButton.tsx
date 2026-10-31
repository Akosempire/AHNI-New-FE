'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { ChatWindowEnhanced } from './ChatWindowEnhanced';
import { cn } from '@/lib/utils';

interface ChatButtonProps {
  className?: string;
}

export const ChatButton = ({ className }: ChatButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "ux-chat-fab fixed bottom-6 right-6 z-40 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105",
          className
        )}
      >
        <MessageCircle size={24} />
      </button>

      {isOpen && (
        <ChatWindowEnhanced
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};