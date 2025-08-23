import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addMessage,
  clearMessages,
  setPendingMessage,
} from '@/store/slices/chatSlice';
import type { Message } from '@/store/types';
import { useCallback } from 'react';

export const useChat = () => {
  const dispatch = useAppDispatch();

  const {
    messages,
    isLoading,
    error,
    currentNodes,
    currentConnections,
    currentQuestions,
    isWorkflowComplete,
    thoughts,
    pendingMessage,
  } = useAppSelector(state => state.chat);

  const startNewConversation = useCallback((): string => {
    // Generate conversation ID for navigation
    const conversationId = `conv_start_${Date.now()}`;
    return conversationId;
  }, []);

  const continueExistingConversation = useCallback(
    (conversationId: string, answer: string): void => {
      if (!conversationId) {
        throw new Error('No conversation ID provided');
      }

      // Add user message to store
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: answer,
        role: 'user',
        timestamp: new Date(),
        status: 'sending',
      };
      dispatch(addMessage(userMessage));
    },
    [dispatch]
  );

  const addUserMessage = useCallback(
    (content: string) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content,
        role: 'user',
        timestamp: new Date(),
        status: 'sending',
      };
      dispatch(addMessage(userMessage));
    },
    [dispatch]
  );

  const clearConversation = useCallback(() => {
    dispatch(clearMessages());
    dispatch(setPendingMessage(null));
  }, [dispatch]);

  const clearPendingMessage = useCallback(() => {
    dispatch(setPendingMessage(null));
  }, [dispatch]);

  const setMessageForWorkflow = useCallback(
    (message: string) => {
      dispatch(setPendingMessage(message));
    },
    [dispatch]
  );

  return {
    messages,
    isLoading,
    error,
    currentNodes,
    currentConnections,
    currentQuestions,
    isWorkflowComplete,
    thoughts,
    pendingMessage,
    startNewConversation,
    continueExistingConversation,
    addUserMessage,
    clearConversation,
    clearPendingMessage,
    setMessageForWorkflow,
  };
};
