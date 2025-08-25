import { useChat } from '@/hooks/useChat';
import type { Message as MessageType } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import Message from './Message';
import WaveLoader from './WaveLoader.tsx';

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated before scrolling
      requestAnimationFrame(() => {
        containerRef.current?.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth',
        });
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
      className={`flex-1 overflow-y-auto space-y-4 p-4 transition-all duration-500 ${
        isWorkflowComplete ? 'opacity-40 blur-[0.3px]' : ''
      }`}
    >
      <AnimatePresence mode="popLayout">
        {displayMessages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 999 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <Message
              message={message}
              onRetry={onRetry}
              isLastMessage={index === displayMessages.length - 1}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="wave-loader"
            initial={{ opacity: 0, y: 20, maxHeight: 0 }}
            animate={{ opacity: 1, y: 0, maxHeight: 999 }}
            exit={{ opacity: 0, y: -10, maxHeight: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <WaveLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual indicator when workflow is complete */}
      {isWorkflowComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2,
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
  );
}
