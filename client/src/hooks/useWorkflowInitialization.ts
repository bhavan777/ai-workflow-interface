import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useChat } from './useChat';
import { useWorkflowWebSocket } from './useWorkflowWebSocket';

export const useWorkflowInitialization = () => {
  const hasInitialized = useRef(false);
  const hasStartedConversation = useRef(false);
  const location = useLocation();
  const { templateId } = useParams();

  const { clearConversation, addUserMessage, setLoadingState } = useChat();
  const { connect, sendUserMessage, isConnecting } = useWorkflowWebSocket();

  // Convert template ID to natural language message
  const convertTemplateIdToMessage = useCallback((templateId: string) => {
    const [origin, destination] = templateId.split('-');
    return `Connect ${origin} to ${destination}`;
  }, []);

  // Initialize WebSocket and clear previous session
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
  }, [
    templateId,
    location.state,
    hasInitialized.current,
    convertTemplateIdToMessage,
  ]);

  const handleStartConversation = useCallback(
    async (description: string) => {
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
    },
    [setLoadingState, clearConversation, addUserMessage, sendUserMessage]
  );

  const handleSendMessage = useCallback(
    (content: string) => {
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
    },
    [setLoadingState, addUserMessage, sendUserMessage]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Reset initialization flags when component unmounts
      hasInitialized.current = false;
      hasStartedConversation.current = false;
    };
  }, []);

  return {
    isConnecting,
    handleStartConversation,
    handleSendMessage,
  };
};
