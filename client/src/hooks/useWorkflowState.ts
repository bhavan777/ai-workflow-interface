import { useCallback } from 'react';
import { useChat } from './useChat';
import { filterDisplayMessages, getLastMessage, hasConversationStarted } from '@/store/utils';

export const useWorkflowState = () => {
  const {
    messages,
    currentWorkflow,
    workflowComplete,
    isLoading,
    error,
    addMessage,
    setWorkflowComplete,
    setLoading,
    setError,
  } = useChat();

  const displayMessages = filterDisplayMessages(messages);
  const lastMessage = getLastMessage(messages);
  const conversationStarted = hasConversationStarted(messages);

  const updateWorkflowStatus = useCallback(
    (complete: boolean) => {
      setWorkflowComplete(complete);
    },
    [setWorkflowComplete]
  );

  const setWorkflowLoading = useCallback(
    (loading: boolean) => {
      setLoading(loading);
    },
    [setLoading]
  );

  const setWorkflowError = useCallback(
    (error: string | null) => {
      setError(error);
    },
    [setError]
  );

  const addWorkflowMessage = useCallback(
    (message: any) => {
      addMessage(message);
    },
    [addMessage]
  );

  return {
    // State
    messages: displayMessages,
    currentWorkflow,
    workflowComplete,
    isLoading,
    error,
    lastMessage,
    conversationStarted,
    
    // Actions
    updateWorkflowStatus,
    setWorkflowLoading,
    setWorkflowError,
    addWorkflowMessage,
  };
};
