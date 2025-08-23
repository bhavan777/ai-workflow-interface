import type { Message } from '@/store/types';
import { Bot, User } from 'lucide-react';

interface MessagesProps {
  messages: Message[];
}

export default function Messages({ messages }: MessagesProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p className="text-sm">
          No messages yet. Start a conversation to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {messages.map(message => (
        <div
          key={message.id}
          className={`flex items-start space-x-3 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
          )}

          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {message.status === 'sending' && (
              <div className="mt-2 flex items-center space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                <div
                  className="w-2 h-2 bg-current rounded-full animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                />
                <div
                  className="w-2 h-2 bg-current rounded-full animate-pulse"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            )}
          </div>

          {message.role === 'user' && (
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
