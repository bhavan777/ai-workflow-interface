import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import React from 'react';

interface ChatInputProps {
  inputValue: string;
  isLoading: boolean;
  conversationId: string | undefined;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
}

export default function ChatInput({
  inputValue,
  isLoading,
  conversationId,
  onInputChange,
  onSubmit,
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSubmit();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim() && !isLoading) {
      onSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-border">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={e => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || !conversationId}
            className="w-full h-12 pr-12 rounded-lg border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading || !conversationId}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
