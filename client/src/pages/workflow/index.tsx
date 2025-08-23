import { useChat } from '@/hooks/useChat';
import { useWorkflowWebSocket } from '@/hooks/useWorkflowWebSocket';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/store/hooks';
import {
  addMessage,
  addThought,
  updateMessageStatus,
} from '@/store/slices/chatSlice';
import type { Message } from '@/store/types';
import type { DataFlowResponse } from '@/types';
import { Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Canvas from './Canvas';
import Chat from './chat';

export default function Workflow() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] =
    useState<DataFlowResponse | null>(null);
  const dispatch = useAppDispatch();
  const hasInitialized = useRef(false);

  const { messages, thoughts, pendingMessage, clearPendingMessage } = useChat();

  // WebSocket handlers
  const handleServerResponse = useCallback(
    (message: any) => {
      if (
        message.type === 'conversation_start' ||
        message.type === 'conversation_continue'
      ) {
        // Update user message status to sent
        const userMessage = messages.find(
          msg => msg.role === 'user' && msg.status === 'sending'
        );
        if (userMessage) {
          dispatch(updateMessageStatus({ id: userMessage.id, status: 'sent' }));
        }

        // Add assistant response with a small delay for better UX
        if (message.data) {
          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            content: message.data.message as string,
            role: 'assistant',
            timestamp: new Date(),
            status: 'sent',
            nodes: message.data.nodes as any,
            connections: message.data.connections as any,
            questions: message.data.questions as any,
            isComplete: message.data.isComplete as boolean,
          };
          dispatch(addMessage(assistantMessage));
        }

        // Clear loading state
        setIsLoading(false);
      } else if (message.type === 'error') {
        console.error('Server error:', message.error);
        // Update user message status to error
        const userMessage = messages.find(
          msg => msg.role === 'user' && msg.status === 'sending'
        );
        if (userMessage) {
          dispatch(
            updateMessageStatus({ id: userMessage.id, status: 'error' })
          );
        }
        setIsLoading(false);
      }
    },
    [dispatch, messages, setIsLoading]
  );

  const handleThought = useCallback(
    (messageId: string, thought: string) => {
      dispatch(addThought({ messageId, thought }));
    },
    [dispatch]
  );

  // Initialize WebSocket
  const { connect, sendUserMessage } = useWorkflowWebSocket({
    onMessage: handleServerResponse,
    onThought: handleThought,
  });

  // Connect to WebSocket and send pending message when component mounts
  useEffect(() => {
    if (hasInitialized.current) return;

    const initializeWebSocket = async () => {
      try {
        await connect();

        // If there's a pending message, start the conversation
        if (pendingMessage) {
          setIsLoading(true);
          // Start new conversation (don't pass conversationId for conversation_start)
          sendUserMessage(pendingMessage);
          clearPendingMessage();
        }

        hasInitialized.current = true;
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    initializeWebSocket();
  }, [pendingMessage]); // Only depend on pendingMessage changes

  // Update current response when chat state changes
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.nodes) {
      setCurrentResponse({
        message: lastMessage.content,
        message_type: 'text',
        nodes: lastMessage.nodes,
        connections: lastMessage.connections || [],
        questions: lastMessage.questions || [],
        isComplete: lastMessage.isComplete || false,
      });
    }
  }, [messages]);

  const handleStartConversation = async (description: string) => {
    setIsLoading(true);

    try {
      sendUserMessage(description);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsLoading(false);
    }
  };

  const handleContinueConversation = (answer: string) => {
    if (!conversationId) {
      console.error('No conversation ID available');
      return;
    }

    setIsLoading(true);
    sendUserMessage(answer, conversationId);
  };

  return (
    <>
      {/* Status Indicator */}
      <div className="absolute top-4 right-4 z-50">
        <div
          className={cn(
            'flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium',
            isLoading
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          )}
        >
          {isLoading ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>{isLoading ? 'Processing...' : 'Ready'}</span>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        <Chat
          conversationId={conversationId}
          isLoading={isLoading}
          thoughts={thoughts}
          onStartConversation={handleStartConversation}
          onContinueConversation={handleContinueConversation}
        />
        <Canvas currentResponse={currentResponse} />
      </div>
    </>
  );
}
