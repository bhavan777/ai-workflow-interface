import type { Message } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseWorkflowWebSocketProps {
  onMessage: (message: Message) => void;
}

export const useWorkflowWebSocket = ({
  onMessage,
}: UseWorkflowWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      setIsConnecting(true);
      setError(null);

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = import.meta.env.VITE_API_URL || 'localhost';
      const port = import.meta.env.VITE_API_PORT || '3001';
      
      // For Railway deployments, don't include port in URL
      const wsUrl = host.includes('railway.app') 
        ? `${protocol}//${host}`
        : `${protocol}//${host}:${port}`;
      
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

            // All messages go through the same handler
            onMessage(message);
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
  }, [onMessage]);

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
