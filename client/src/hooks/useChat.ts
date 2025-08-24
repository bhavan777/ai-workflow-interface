import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addMessage,
  clearMessages,
  setLoading,
} from '@/store/slices/chatSlice';
import type { Message } from '@/types';
import { useCallback } from 'react';

export const useChat = () => {
  const dispatch = useAppDispatch();

  const { messages, isLoading, error, currentWorkflow, currentThought } = useAppSelector(
    state => state.chat
  );

  const addUserMessage = useCallback(
    (content: string) => {
      const userMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        type: 'MESSAGE',
        content,
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage(userMessage));
    },
    [dispatch]
  );

  const clearConversation = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const setLoadingState = useCallback(
    (loading: boolean) => {
      dispatch(setLoading(loading));
    },
    [dispatch]
  );

  return {
    messages,
    isLoading,
    error,
    currentWorkflow,
    currentThought,
    addUserMessage,
    clearConversation,
    setLoadingState,
  };
};
