import { useChat } from '@/hooks/useChat';
import { useWorkflowWebSocket } from '@/hooks/useWorkflowWebSocket';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Canvas from './Canvas';
import Chat from './chat';

export default function Workflow() {
  const hasInitialized = useRef(false);
  const hasStartedConversation = useRef(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(true);

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

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      // Add user message to store (dummy assistant message is added automatically)
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
      // Add user message to store (dummy assistant message is added automatically)
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

  // Mobile toggle handlers
  const toggleChat = () => setShowChat(!showChat);
  const toggleCanvas = () => setShowChat(false);

  return (
    <>
      {/* Mobile Navigation Tabs - Only show when mobile and has workflow */}
      {isMobile && currentWorkflow.nodes.length > 0 && (
        <div className="sticky top-0 z-40 flex border-b border-border bg-background/95 backdrop-blur-sm">
          <button
            onClick={toggleChat}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              showChat
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={toggleCanvas}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              !showChat
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📊 Workflow
          </button>
        </div>
      )}

      {/* Main Content - Responsive Layout */}
      <div
        className={`flex ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? 'h-screen' : 'h-[calc(100vh-70px)]'}`}
      >
        {isConnecting ? (
          // Show connection loader
          <div
            className={`${isMobile ? 'w-full flex-1' : 'w-1/3'} border-r border-border bg-background/50 flex items-center justify-center`}
          >
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
          <>
            {/* Chat Section */}
            <div
              className={`${
                isMobile ? (showChat ? 'w-full h-full' : 'hidden') : 'w-1/3'
              } border-r border-border bg-background/50 flex flex-col min-h-0`}
            >
              <Chat
                onStartConversation={handleStartConversation}
                onSendMessage={handleSendMessage}
                onStartWorkflow={handleStartWorkflow}
              />
            </div>

            {/* Canvas Section */}
            <div
              className={`${
                isMobile ? (!showChat ? 'w-full flex-1' : 'hidden') : 'w-2/3'
              } bg-background/30 relative`}
            >
              <Canvas
                key={JSON.stringify(currentWorkflow)}
                currentWorkflow={currentWorkflow}
                isConnecting={isConnecting}
                onNodeDataRequest={handleNodeDataRequest}
                isMobile={isMobile}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
