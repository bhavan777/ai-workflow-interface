import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import React, { forwardRef } from 'react';

interface ChatInputProps {
  inputValue: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
}

const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  ({ inputValue, isLoading, onInputChange, onSubmit }, ref) => {
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
              ref={ref}
              type="text"
              placeholder="Type your answer..."
              value={inputValue}
              onChange={e => onInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="w-full h-12 pr-12 rounded-lg border border-border focus:border-primary focus:shadow-[0_0_0_4px_hsla(24,95%,53%,0.4)] focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200"
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
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
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;
