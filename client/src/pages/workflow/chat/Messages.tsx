import { useChat } from '@/hooks/useChat';
import type { Message as MessageType } from '@/types';
import { useEffect, useRef } from 'react';
import CurrentThought from './CurrentThought';
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
  const { currentThought } = useChat();
  const scrollMarkerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollMarkerRef.current) {
      scrollMarkerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [messages, currentThought]);

  // Filter out THOUGHT and STATUS messages since they're handled separately
  const displayMessages = messages.filter(
    message => message.type !== 'THOUGHT' && message.type !== 'STATUS'
  );

  if (displayMessages.length === 0 && !currentThought) {
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
      className={`flex-1 overflow-y-auto space-y-4 p-4 transition-all duration-500 ${
        isWorkflowComplete ? 'opacity-40 blur-[0.3px]' : ''
      }`}
    >
      {displayMessages.map((message, index) => (
        <Message
          key={message.id}
          message={message}
          onRetry={onRetry}
          isLastMessage={index === displayMessages.length - 1}
        />
      ))}

      {currentThought && <CurrentThought thought={currentThought} />}

      {/* Visual indicator when workflow is complete */}
      {isWorkflowComplete && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
            <span>✨</span>
            <span>Workflow configuration complete!</span>
          </div>
        </div>
      )}

      {/* Scroll marker for auto-scrolling */}
      <div ref={scrollMarkerRef} className="h-0" />
    </div>
  );
}
