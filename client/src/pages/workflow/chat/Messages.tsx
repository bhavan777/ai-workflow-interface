import { useChat } from '@/hooks/useChat';
import type { Message as MessageType } from '@/types';
import Message from './Message';
import Thought from './Thought';

interface MessagesProps {
  messages: MessageType[];
  isWorkflowComplete?: boolean;
}

export default function Messages({
  messages,
  isWorkflowComplete = false,
}: MessagesProps) {
  const { currentThought } = useChat();

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
      {displayMessages.map(message => (
        <Message key={message.id} message={message} />
      ))}

      {currentThought && <Thought thought={currentThought} />}

      {/* Visual indicator when workflow is complete */}
      {isWorkflowComplete && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
            <span>✨</span>
            <span>Workflow configuration complete!</span>
          </div>
        </div>
      )}
    </div>
  );
}
