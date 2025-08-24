import { useChat } from '@/hooks/useChat';
import type { Message } from '@/types';
import { AlertCircle, Bot, Brain, User } from 'lucide-react';

interface MessagesProps {
  messages: Message[];
}

export default function Messages({ messages }: MessagesProps) {
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

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';

    // Different styles based on message type
    let messageStyle = '';
    let icon = null;

    switch (message.type) {
      case 'MESSAGE':
        messageStyle = isUser
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-foreground';
        icon = isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        );
        break;
      case 'ERROR':
        messageStyle = 'bg-red-50 text-red-800 border border-red-200';
        icon = <AlertCircle className="w-4 h-4" />;
        break;
      default:
        return null; // Don't render other message types
    }

    return (
      <div
        key={message.id}
        className={`flex items-start space-x-3 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}
      >
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            {icon}
          </div>
        )}

        <div className={`max-w-[80%] rounded-lg px-4 py-2 ${messageStyle}`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>
    );
  };

  const renderThought = () => {
    if (!currentThought) return null;

    return (
      <div className="flex items-start space-x-3 justify-start animate-pulse duration-1000">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Brain className="w-4 h-4 text-blue-600" />
        </div>
        <div className="max-w-[80%] rounded-lg px-4 py-2 bg-blue-50 text-blue-800 border border-blue-200">
          <p className="text-sm whitespace-pre-wrap">{currentThought}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {displayMessages.map(renderMessage)}
      {renderThought()}
    </div>
  );
}
