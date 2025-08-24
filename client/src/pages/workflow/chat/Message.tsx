import { Button } from '@/components/ui/button';
import type { Message as MessageType } from '@/types';
import { AlertCircle, Brain, RotateCcw, User } from 'lucide-react';

interface MessageProps {
  message: MessageType;
  onRetry?: () => void;
  isLastMessage?: boolean;
}

export default function Message({
  message,
  onRetry,
  isLastMessage,
}: MessageProps) {
  const isUser = message.role === 'user';

  // Different styles based on message type
  let messageStyle = '';
  let icon = null;

  switch (message.type) {
    case 'MESSAGE':
      messageStyle = isUser
        ? 'bg-background text-foreground shadow-sm border border-border'
        : 'bg-primary text-primary-foreground';
      icon = isUser ? (
        <User className="w-4 h-4" />
      ) : (
        <Brain className="w-4 h-4" />
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
      className={`flex space-x-3 items-start ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      <div
        className={`flex flex-col max-w-xs ${isUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`text-xs mb-1 ${
            isUser ? 'text-slate-400 text-right' : 'text-primary text-left'
          }`}
        >
          {isUser ? 'You' : 'Nexla'}
        </div>
        <div
          className={`w-full px-4 py-2 ${messageStyle} relative ${
            isUser
              ? 'rounded-l-lg rounded-br-lg' // Sharp edge on right bottom for user
              : 'rounded-r-lg rounded-bl-lg' // Sharp edge on left bottom for AI
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* Retry button for error messages - only show on last error message */}
          {message.type === 'ERROR' && onRetry && isLastMessage && (
            <div className="absolute -bottom-2 -right-2">
              <Button
                onClick={onRetry}
                variant="outline"
                size="icon"
                className="w-6 h-6 bg-white hover:bg-red-50 border-red-300 text-red-700 hover:text-red-800 rounded-full shadow-sm"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}
