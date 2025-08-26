import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
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
      if (e.key === 'Enter' && !e.shiftKey && inputValue.trim() && !isLoading) {
        e.preventDefault();
        onSubmit();
      }
    };

    const isSubmitDisabled = !inputValue.trim() || isLoading;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="p-4 border-t border-border bg-background/95 backdrop-blur-sm"
      >
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative group">
            <Input
              ref={ref}
              type="text"
              placeholder={
                isLoading ? 'AI is thinking...' : 'Type your answer...'
              }
              value={inputValue}
              onChange={e => onInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              aria-label="Chat message input"
              aria-describedby="chat-input-hint"
              className="w-full h-12 pr-12 rounded-lg border border-border focus:border-primary focus:shadow-[0_0_0_4px_hsla(24,95%,53%,0.4)] focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300 group-hover:border-border/80 group-hover:shadow-sm"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                disabled={isSubmitDisabled}
                aria-label="Send message"
                aria-describedby="send-button-description"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
              >
                <motion.div
                  whileHover={{ x: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Send className="w-4 h-4" />
                </motion.div>
              </Button>
            </motion.div>

            {/* Subtle glow effect when input has content */}
            {inputValue.trim() && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 pointer-events-none"
              />
            )}
          </div>

          {/* Keyboard shortcut hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
            id="chat-input-hint"
            className="text-xs text-muted-foreground mt-2 text-center"
          >
            Press Enter to send • Shift+Enter for new line
          </motion.div>

          {/* Hidden description for send button */}
          <div id="send-button-description" className="sr-only">
            Send your message to the AI assistant
          </div>
        </form>
      </motion.div>
    );
  }
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;
