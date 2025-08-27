import { useChat } from '@/hooks/useChat';
import { useWorkflowWebSocket } from '@/hooks/useWorkflowWebSocket';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Canvas from './Canvas';
import Chat from './chat';

export default function Workflow() {
  const hasInitialized = useRef(false);
  const hasStartedConversation = useRef(false);
  const location = useLocation();
  const { templateId } = useParams();

  const {
    currentWorkflow,
    addUserMessage,
    setLoadingState,
    sendNodeDataRequest,
    clearConversation,
  } = useChat();

  // Initialize WebSocket (now handles all message processing internally)
  const { connect, sendUserMessage, sendMessage, isConnecting } =
    useWorkflowWebSocket();

  // Connect to WebSocket and clear previous session when component mounts
  useEffect(() => {
    if (hasInitialized.current) return;

    // Clear any previous conversation data to ensure fresh start
    clearConversation();

    const initializeWebSocket = async () => {
      try {
        await connect();
        hasInitialized.current = true;
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    initializeWebSocket();
  }, [connect, clearConversation]);

  // Convert template ID to natural language message
  const convertTemplateIdToMessage = (templateId: string) => {
    // 'shopify-snowflake' → 'Connect Shopify to Snowflake'
    const [origin, destination] = templateId.split('-');
    return `Connect ${origin} to ${destination}`;
  };

  // Handle initial message from navigation (URL template or route state)
  useEffect(() => {
    if (!hasInitialized.current || hasStartedConversation.current) return;

    let initialMessage: string | undefined;

    // Check for URL template first
    if (templateId) {
      initialMessage = convertTemplateIdToMessage(templateId);
    }
    // Fall back to route state for custom messages
    else if (location.state?.initialMessage) {
      initialMessage = location.state.initialMessage;
    }

    if (initialMessage) {
      hasStartedConversation.current = true;
      handleStartConversation(initialMessage);
    }
  }, [templateId, location.state, hasInitialized.current]);

  const handleStartConversation = async (description: string) => {
    setLoadingState(true);

    try {
      // Reset store to ensure fresh conversation
      clearConversation();

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

  const handleNodeDataRequest = (nodeId: string, nodeType: string) => {
    sendNodeDataRequest(nodeId, nodeType, sendMessage);
  };

  const handleCreateNewWorkflow = () => {
    // Reset the conversation state
    clearConversation();

    // Reset the initialization flags
    hasInitialized.current = false;
    hasStartedConversation.current = false;

    // Force a re-render to show the workflow setup
    window.location.reload();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Reset initialization flags when component unmounts
      hasInitialized.current = false;
      hasStartedConversation.current = false;
    };
  }, []);

  return (
    <>
      {/* Main Content - Split Layout */}
      <div className="flex h-[calc(100vh-70px)]">
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
            onCreateNewWorkflow={handleCreateNewWorkflow}
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
