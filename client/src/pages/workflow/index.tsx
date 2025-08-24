import { useChat } from '@/hooks/useChat';
import { useWorkflowWebSocket } from '@/hooks/useWorkflowWebSocket';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/store/hooks';
import { addMessage, setCurrentThought } from '@/store/slices/chatSlice';
import type { Message } from '@/types';
import { Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Canvas from './Canvas';
import Chat from './chat';

export default function Workflow() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const hasInitialized = useRef(false);
  const hasStartedConversation = useRef(false);
  const location = useLocation();

  const {
    messages,
    currentWorkflow,
    currentThought,
    addUserMessage,
    setLoadingState,
  } = useChat();

  // WebSocket handlers
  const handleServerMessage = useCallback(
    (message: Message) => {
      console.log('📨 Received message:', message);

      // Handle thoughts separately (server-sent only)
      if (message.type === 'THOUGHT') {
        dispatch(setCurrentThought(message.content));
        return;
      }

      // Add non-thought messages to the store
      dispatch(addMessage(message));

      // Update loading state based on message type
      if (message.type === 'STATUS') {
        setIsLoading(message.status === 'processing');
        setLoadingState(message.status === 'processing');
      } else if (message.type === 'MESSAGE' && message.role === 'assistant') {
        // Assistant message received, stop loading and clear thought
        setIsLoading(false);
        setLoadingState(false);
        dispatch(setCurrentThought(null)); // Clear thought when assistant responds
      } else if (message.type === 'ERROR') {
        // Error received, stop loading and clear thought
        setIsLoading(false);
        setLoadingState(false);
        dispatch(setCurrentThought(null)); // Clear thought on error
      }
    },
    [dispatch, setLoadingState]
  );

  // Initialize WebSocket
  const { connect, sendUserMessage } = useWorkflowWebSocket({
    onMessage: handleServerMessage,
  });

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (hasInitialized.current) return;

    const initializeWebSocket = async () => {
      try {
        await connect();
        hasInitialized.current = true;
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    initializeWebSocket();
  }, []);

  // Handle initial message from navigation
  useEffect(() => {
    const initialMessage = location.state?.initialMessage;

    if (
      initialMessage &&
      hasInitialized.current &&
      !hasStartedConversation.current
    ) {
      hasStartedConversation.current = true;
      handleStartConversation(initialMessage);
    }
  }, [location.state, hasInitialized.current]);

  const handleStartConversation = async (description: string) => {
    setIsLoading(true);
    setLoadingState(true);

    try {
      // Add user message to store
      addUserMessage(description);

      // Send message to server
      sendUserMessage(description);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsLoading(false);
      setLoadingState(false);
    }
  };

  const handleSendMessage = (content: string) => {
    setIsLoading(true);
    setLoadingState(true);

    try {
      // Add user message to store
      addUserMessage(content);

      // Send message to server
      sendUserMessage(content);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      setLoadingState(false);
    }
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
          onStartConversation={handleStartConversation}
          onSendMessage={handleSendMessage}
        />
        <Canvas currentWorkflow={currentWorkflow} />
      </div>
    </>
  );
}
