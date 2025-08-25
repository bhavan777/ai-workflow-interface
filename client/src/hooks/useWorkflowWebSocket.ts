import { useChatStore } from '@/store/useChatStore';
import type { Message } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useWorkflowWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Get store actions
  const {
    addMessage,
    setCurrentThought,
    setLoading,
    setNodeData,
    setNodeDataLoading,
    setNodeDataError,
  } = useChatStore();

  // Handle node data messages
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

  // Centralized message handler
  const handleServerMessage = useCallback(
    (message: Message) => {
      console.log('📨 Received message:', message);

      // Handle thoughts separately (server-sent only)
      if (message.type === 'THOUGHT') {
        setCurrentThought(message);
        return;
      }

      // Handle node data messages
      if (
        message.type === 'NODE_DATA' ||
        (message.type === 'ERROR' && message.content.includes('node'))
      ) {
        handleNodeDataMessage(message);
        return;
      }

      // Add non-thought messages to the store
      addMessage(message);

      // Update loading state based on message type
      if (message.type === 'STATUS') {
        setLoading(message.status === 'processing');
      } else if (message.type === 'MESSAGE' && message.role === 'assistant') {
        // Assistant message received, stop loading and clear thought
        setLoading(false);
        setCurrentThought(null); // Clear thought when AI responds
      } else if (message.type === 'ERROR') {
        // Error received, stop loading and clear thought
        setLoading(false);
        setCurrentThought(null); // Clear thought on error
      }
    },
    [setLoading, addMessage, setCurrentThought, handleNodeDataMessage]
  );

  const connect = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      setIsConnecting(true);
      setError(null);

      const wsUrl = 'wss://ai-workflow-interface-production.up.railway.app';

      console.log('🔌 Connecting to WebSocket:', wsUrl);

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          const connectionTime = new Date().toISOString();
          console.log('🔌 WebSocket connected at:', connectionTime);
          console.log('🔌 WebSocket URL:', wsUrl);
          setIsConnected(true);
          setIsConnecting(false);
          resolve();
        };

        ws.onmessage = event => {
          try {
            const message: Message = JSON.parse(event.data);
            console.log('📨 WebSocket message received:', message);

            // Handle all messages directly here
            handleServerMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = event => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          setIsConnected(false);
          setIsConnecting(false);
          setError(event.reason || 'Connection closed');
          wsRef.current = null;
        };

        ws.onerror = error => {
          console.error('WebSocket error:', error);
          setIsConnecting(false);
          setError('WebSocket connection failed');
          reject(new Error('WebSocket connection failed'));
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        setIsConnecting(false);
        setError('Failed to create WebSocket connection');
        reject(error);
      }
    });
  }, [handleServerMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const sendMessage = useCallback(
    (message: Message): void => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.log('🔌 WebSocket not connected, connecting...');
        connect()
          .then(() => {
            sendMessage(message);
          })
          .catch(error => {
            console.error('Failed to connect WebSocket:', error);
          });
        return;
      }

      try {
        wsRef.current.send(JSON.stringify(message));
        console.log('📤 WebSocket message sent:', message);
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    },
    [connect]
  );

  const sendUserMessage = useCallback(
    (content: string, responseTo?: string): string => {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const message: Message = {
        id: messageId,
        role: 'user',
        type: 'MESSAGE',
        content,
        timestamp: new Date().toISOString(),
        ...(responseTo && { response_to: responseTo }),
      };

      sendMessage(message);
      return messageId;
    },
    [sendMessage]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendMessage,
    sendUserMessage,
  };
};
