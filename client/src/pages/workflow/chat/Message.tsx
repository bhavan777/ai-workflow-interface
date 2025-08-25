import { Button } from '@/components/ui/button';
import type { Message as MessageType } from '@/types';
import { motion } from 'framer-motion';
import { AlertCircle, Brain, RotateCcw, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
        ? 'bg-background text-foreground shadow-sm border border-border hover:shadow-md hover:border-border/80'
        : 'bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/95';
      icon = isUser ? (
        <User className="w-4 h-4" />
      ) : (
        <Brain className="w-4 h-4" />
      );
      break;
    case 'ERROR':
      messageStyle =
        'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100';
      icon = <AlertCircle className="w-4 h-4" />;
      break;
    default:
      return null; // Don't render other message types
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: isLastMessage ? 0.1 : 0,
      }}
      className={`flex space-x-3 ${
        isUser ? 'justify-end items-end' : 'justify-start items-start'
      }`}
    >
      {!isUser && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <Brain className="w-4 h-4 text-primary-foreground" />
        </motion.div>
      )}

      <div
        className={`flex flex-col max-w-xs ${isUser ? 'items-end' : 'items-start'}`}
      >
        <motion.div
          initial={{ opacity: 0, x: isUser ? 10 : -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`text-xs mb-1 font-medium ${
            isUser ? 'text-slate-400 text-right' : 'text-primary text-left'
          }`}
        >
          {isUser ? 'You' : 'Nexla'}
        </motion.div>
        <motion.div
          className={`w-full px-4 py-2 ${messageStyle} relative transition-all duration-200 rounded-lg ${
            isUser
              ? 'rounded-l-lg rounded-br-lg rounded-tr-lg rounded-br-none' // Sharp edge on right bottom for user
              : 'rounded-r-lg rounded-bl-lg rounded-tl-lg rounded-tl-none' // Sharp edge on left bottom for AI
          }`}
        >
          {message.message_type === 'markdown' ? (
            <div className="text-sm prose prose-sm max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Retry button for error messages - only show on last error message */}
          {message.type === 'ERROR' && onRetry && isLastMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="absolute -bottom-2 -right-2"
            >
              <Button
                onClick={onRetry}
                variant="outline"
                size="icon"
                className="w-6 h-6 bg-white hover:bg-red-50 border-red-300 text-red-700 hover:text-red-800 rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {isUser && (
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex-shrink-0 w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <User className="w-4 h-4 text-primary" />
        </motion.div>
      )}
    </motion.div>
  );
}
