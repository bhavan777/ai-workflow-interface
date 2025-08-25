import { useChatStore } from '@/store/useChatStore';
import type { Message } from '@/types';
import { useCallback } from 'react';

export const useChat = () => {
  const {
    messages,
    isLoading,
    error,
    currentWorkflow,
    workflowComplete,
    nodeData,
    nodeDataLoading,
    nodeDataError,
    addMessage,
    setWorkflowComplete,
    setLoading,
    setError,
    clearMessages,
    addUserMessage,
    setNodeData,
    setNodeDataLoading,
    setNodeDataError,
    clearNodeData,
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

  const handleNodeDataMessage = useCallback(
    (message: Message) => {
      if (message.type === 'NODE_DATA') {
        setNodeData({
          node_id: message.node_id || '',
          node_title: message.node_title || '',
          filled_values: message.filled_values || {},
        });
        setNodeDataLoading(false);
      } else if (message.type === 'ERROR' && message.content.includes('node')) {
        setNodeDataError(message.content);
        setNodeDataLoading(false);
      }
    },
    [setNodeData, setNodeDataLoading, setNodeDataError]
  );

  const sendNodeDataRequest = useCallback(
    (nodeId: string, sendMessage: (message: Message) => void) => {
      setNodeDataLoading(true);
      setNodeDataError(null);

      const message: Message = {
        id: `node_${Date.now()}`,
        role: 'user',
        type: 'GET_NODE_DATA',
        content: `Get node data for node ${nodeId}`,
        timestamp: new Date().toISOString(),
        node_id: nodeId,
      };

      sendMessage(message);
    },
    [setNodeDataLoading, setNodeDataError]
  );

  return {
    messages,
    isLoading,
    error,
    currentWorkflow,
    workflowComplete,
    nodeData,
    nodeDataLoading,
    nodeDataError,
    addUserMessage,
    clearConversation,
    setLoadingState,
    // Expose store actions for direct use
    addMessage,
    setWorkflowComplete,
    setError,
    setNodeData,
    setNodeDataLoading,
    setNodeDataError,
    clearNodeData,
    handleNodeDataMessage,
    sendNodeDataRequest,
  };
};
