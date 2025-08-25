import { useChat } from '@/hooks/useChat';
import { useWorkflowWebSocket } from '@/hooks/useWorkflowWebSocket';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Canvas from './Canvas';
import Chat from './chat';

export default function Workflow() {
  const hasInitialized = useRef(false);
  const hasStartedConversation = useRef(false);
  const location = useLocation();

  const {
    messages,
    currentWorkflow,
    addUserMessage,
    setLoadingState,
    sendNodeDataRequest,
  } = useChat();

  // Initialize WebSocket (now handles all message processing internally)
  const { connect, sendUserMessage, sendMessage, isConnecting } =
    useWorkflowWebSocket();

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
  }, [connect]);

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
    setLoadingState(true);

    try {
      // Add user message to store
      addUserMessage(description);

      // Send message to server
      sendUserMessage(description);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setLoadingState(false);
    }
  };

  const handleSendMessage = (content: string) => {
    setLoadingState(true);

    try {
      // Add user message to store
      addUserMessage(content);

      // Send message to server
      sendUserMessage(content);
    } catch (error) {
      console.error('Error sending message:', error);
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

  const handleNodeDataRequest = (nodeId: string) => {
    sendNodeDataRequest(nodeId, sendMessage);
  };

  return (
    <>
      {/* Main Content - Split Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {isConnecting ? (
          // Show connection loader only in the chat section
          <div className="w-1/3 border-r border-border bg-background/50 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-3"
              />
              <h3 className="text-sm font-medium text-foreground mb-1">
                Connecting to AI...
              </h3>
              <p className="text-xs text-muted-foreground">
                Establishing secure connection
              </p>
            </div>
          </div>
        ) : (
          <Chat
            onStartConversation={handleStartConversation}
            onSendMessage={handleSendMessage}
            onStartWorkflow={handleStartWorkflow}
          />
        )}
        <Canvas
          key={JSON.stringify(currentWorkflow)}
          currentWorkflow={currentWorkflow}
          isConnecting={isConnecting}
          onNodeDataRequest={handleNodeDataRequest}
        />
      </div>
    </>
  );
}
