import { useChat } from '@/hooks/useChat';
import type { Message as MessageType } from '@/types';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import Message from './Message';

interface MessagesProps {
  messages: MessageType[];
  isWorkflowComplete?: boolean;
  onRetry?: () => void;
}

export default function Messages({
  messages,
  isWorkflowComplete = false,
  onRetry,
}: MessagesProps) {
  const { isLoading } = useChat();
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  // Filter out THOUGHT and STATUS messages since they're handled separately
  const displayMessages = messages.filter(
    message => message.type !== 'THOUGHT' && message.type !== 'STATUS'
  );

  if (displayMessages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p className="text-sm">
          No messages yet. Start a conversation to begin.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto p-4 transition-all duration-500 ${
        isWorkflowComplete ? 'opacity-40 blur-[0.3px]' : ''
      }`}
    >
      <div className="space-y-4">
        {displayMessages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0.0, 0.2, 1], // Gentle ease-out
            }}
          >
            <Message
              message={message}
              onRetry={onRetry}
              isLastMessage={index === displayMessages.length - 1}
            />
          </motion.div>
        ))}

        {/* Visual indicator when workflow is complete */}
        {isWorkflowComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0.0, 0.2, 1], // Gentle ease-out
              delay: 0.1,
            }}
            className="text-center py-4"
          >
            <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
              <span>✨</span>
              <span>Workflow configuration complete!</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
