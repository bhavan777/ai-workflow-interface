import { Button } from '@/components/ui/button';
import type { Message as MessageType } from '@/types';
import { motion } from 'framer-motion';
import { AlertCircle, Brain, RotateCcw, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import WaveLoader from './WaveLoader';

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
    case 'DUMMY_ASSISTANT':
      messageStyle =
        'bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/95';
      icon = <Brain className="w-4 h-4" />;
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1], // Gentle ease-out
      }}
      className={`flex space-x-3 ${
        isUser ? 'justify-end items-end' : 'justify-start items-start'
      }`}
    >
      {!isUser && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1], // Gentle ease-out
            delay: 0.1,
          }}
          className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <Brain className="w-4 h-4 text-primary-foreground" />
        </motion.div>
      )}

      <div
        className={`flex flex-col max-w-xs ${isUser ? 'items-end' : 'items-start'}`}
      >
        {/* Show label above for AI messages, below for user messages */}
        {!isUser && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0.0, 0.2, 1], // Gentle ease-out
              delay: 0.05,
            }}
            className="text-xs mb-1 font-medium text-primary text-left"
          >
            Nexla
          </motion.div>
        )}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full px-4 py-2 ${messageStyle} relative transition-all duration-200 rounded-lg ${
            isUser
              ? 'rounded-l-lg rounded-br-lg rounded-tr-lg rounded-br-none' // Sharp edge on right bottom for user
              : 'rounded-r-lg rounded-bl-lg rounded-tl-lg rounded-tl-none' // Sharp edge on left bottom for AI
          }`}
        >
          <motion.div
            key={message.content} // This triggers animation when content changes
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0.0, 0.2, 1], // Gentle ease-out
            }}
          >
            {message.type === 'DUMMY_ASSISTANT' ? (
              // Loading state for dummy assistant message - use WaveLoader
              <WaveLoader size="sm" />
            ) : (
              // Normal message content
              <>
                {message.message_type === 'markdown' ? (
                  <div className="text-sm prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}
              </>
            )}
          </motion.div>

          {/* Retry button for error messages - only show on last error message */}
          {message.type === 'ERROR' && onRetry && isLastMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.4, 0.0, 0.2, 1], // Gentle ease-out
                delay: 0.3,
              }}
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

        {/* Show "You" label below for user messages */}
        {isUser && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0.0, 0.2, 1], // Gentle ease-out
              delay: 0.05,
            }}
            className="text-xs mt-1 font-medium text-slate-400 text-right"
          >
            You
          </motion.div>
        )}
      </div>

      {isUser && (
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1], // Gentle ease-out
            delay: 0.1,
          }}
          className="flex-shrink-0 w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <User className="w-4 h-4 text-primary" />
        </motion.div>
      )}
    </motion.div>
  );
}
