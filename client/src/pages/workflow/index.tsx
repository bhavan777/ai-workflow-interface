import { useChat } from '@/hooks/useChat';
import { useWorkflowWebSocket } from '@/hooks/useWorkflowWebSocket';
import type { Message } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Canvas from './Canvas';
import Chat from './chat';

export default function Workflow() {
  const [isLoading, setIsLoading] = useState(false);
  const hasInitialized = useRef(false);
  const hasStartedConversation = useRef(false);
  const location = useLocation();

  const {
    messages,
    currentWorkflow,
    addUserMessage,
    setLoadingState,
    addMessage,
    setCurrentThought,
  } = useChat();

  // WebSocket handlers
  const handleServerMessage = useCallback(
    (message: Message) => {
      console.log('📨 Received message:', message);

      // Handle thoughts separately (server-sent only)
      if (message.type === 'THOUGHT') {
        setCurrentThought(message);
        return;
      }

      // Add non-thought messages to the store
      addMessage(message);

      // Update loading state based on message type
      if (message.type === 'STATUS') {
        setIsLoading(message.status === 'processing');
        setLoadingState(message.status === 'processing');
      } else if (message.type === 'MESSAGE' && message.role === 'assistant') {
        // Assistant message received, stop loading and clear thought
        setIsLoading(false);
        setLoadingState(false);
        setCurrentThought(null); // Clear thought when AI responds
      } else if (message.type === 'ERROR') {
        // Error received, stop loading and clear thought
        setIsLoading(false);
        setLoadingState(false);
        setCurrentThought(null); // Clear thought on error
      }
    },
    [setLoadingState, addMessage, setCurrentThought]
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

  const handleStartWorkflow = () => {
    console.log('🚀 Starting workflow with configuration:', currentWorkflow);
    // TODO: Implement workflow execution logic
    alert(
      'Workflow started! This would trigger the actual data pipeline execution.'
    );
  };

  const handleEditWorkflow = () => {
    console.log('✏️ Edit workflow requested');
    // The edit message will be automatically sent to the server
    // which will continue the conversation with relevant questions
  };

  return (
    <>
      {/* Main Content - Split Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        <Chat
          onStartConversation={handleStartConversation}
          onSendMessage={handleSendMessage}
          onStartWorkflow={handleStartWorkflow}
        />
        <Canvas currentWorkflow={currentWorkflow} />
      </div>
    </>
  );
}
