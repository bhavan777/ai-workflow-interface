import { useChatStore } from '@/store/useChatStore';
import { useCallback } from 'react';

export const useChat = () => {
  const {
    messages,
    isLoading,
    error,
    currentWorkflow,
    currentThought,
    workflowComplete,
    addMessage,
    setCurrentThought,
    setWorkflowComplete,
    setLoading,
    setError,
    clearMessages,
    addUserMessage,
  } = useChatStore();

  const clearConversation = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  const setLoadingState = useCallback(
    (loading: boolean) => {
      setLoading(loading);
    },
    [setLoading]
  );

  return {
    messages,
    isLoading,
    error,
    currentWorkflow,
    currentThought,
    workflowComplete,
    addUserMessage,
    clearConversation,
    setLoadingState,
    // Expose store actions for direct use
    addMessage,
    setCurrentThought,
    setWorkflowComplete,
    setError,
  };
};
