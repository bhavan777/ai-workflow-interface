import type { Message } from '@/types';
import { useCallback } from 'react';
import { useChat } from './useChat';
import { useWorkflowWebSocket } from './useWorkflowWebSocket';

export const useNodeData = () => {
  const { sendNodeDataRequest, nodeData, nodeDataLoading, nodeDataError } =
    useChat();
  const { sendMessage } = useWorkflowWebSocket();

  const requestNodeData = useCallback(
    (nodeId: string) => {
      console.log('🔍 Requesting node data for:', nodeId);
      sendNodeDataRequest(nodeId, sendMessage);
    },
    [sendNodeDataRequest, sendMessage]
  );

  const createNodeDataMessage = useCallback(
    (nodeId: string): Message => ({
      id: `node_${Date.now()}`,
      role: 'user',
      type: 'GET_NODE_DATA',
      content: `Get node data for node ${nodeId}`,
      timestamp: new Date().toISOString(),
      node_id: nodeId,
    }),
    []
  );

  return {
    nodeData,
    nodeDataLoading,
    nodeDataError,
    requestNodeData,
    createNodeDataMessage,
  };
};
