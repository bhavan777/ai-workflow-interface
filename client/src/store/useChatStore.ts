import type { DataFlowConnection, DataFlowNode, Message } from '@/types';
import { create } from 'zustand';

interface ChatState {
  // State
  messages: Message[];
  currentWorkflow: {
    nodes: DataFlowNode[];
    connections: DataFlowConnection[];
  };
  workflowComplete: boolean;
  isLoading: boolean;
  error: string | null;

  // Node data state
  nodeData: {
    node_id: string;
    node_type: string;
    node_title: string;
    filled_values: Record<string, string>;
  } | null;
  nodeDataLoading: boolean;
  nodeDataError: string | null;

  // Actions
  addMessage: (message: Message) => void;
  setWorkflowComplete: (complete: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  addUserMessage: (content: string) => void;
  addDummyAssistantMessage: () => void;
  updateLastAssistantMessage: (
    content: string,
    messageType?: 'text' | 'markdown'
  ) => void;
  sendMessage: (message: any) => void;
  updateNodeStatus: (nodeId: string, status: DataFlowNode['status']) => void;
  getCurrentWorkflowState: () => {
    nodes: DataFlowNode[];
    connections: DataFlowConnection[];
  };

  // Node data actions
  setNodeData: (
    data: {
      node_id: string;
      node_type: string;
      node_title: string;
      filled_values: Record<string, string>;
    } | null
  ) => void;
  setNodeDataLoading: (loading: boolean) => void;
  setNodeDataError: (error: string | null) => void;
  clearNodeData: () => void;
  resetStore: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  messages: [],
  currentWorkflow: {
    nodes: [],
    connections: [],
  },
  workflowComplete: false,
  isLoading: false,
  error: null,

  // Node data state
  nodeData: null,
  nodeDataLoading: false,
  nodeDataError: null,

  // Actions
  addMessage: message =>
    set(state => {
      let newMessages = state.messages;

      // If this is an assistant message, update the last dummy assistant message content
      if (message.role === 'assistant' && message.type === 'MESSAGE') {
        const lastDummyIndex = state.messages.findIndex(
          msg => msg.role === 'assistant' && msg.type === 'DUMMY_ASSISTANT'
        );

        if (lastDummyIndex !== -1) {
          // Update only the content and type of the dummy message, keep the same ID
          newMessages = [...state.messages];
          newMessages[lastDummyIndex] = {
            ...newMessages[lastDummyIndex],
            content: message.content,
            type: 'MESSAGE',
            message_type: message.message_type || 'text',
            nodes: message.nodes,
            connections: message.connections,
            workflow_complete: message.workflow_complete,
            node_status_updates: message.node_status_updates,
          };
        } else {
          // No dummy message found, add normally
          newMessages = [...state.messages, message];
        }
      } else if (message.type !== 'THOUGHT') {
        // For non-thought messages that aren't assistant responses, add normally
        newMessages = [...state.messages, message];
      }

      // Handle individual node status updates
      let newWorkflow = state.currentWorkflow;

      if (
        message.node_status_updates &&
        message.node_status_updates.length > 0
      ) {
        // Update individual node statuses
        newWorkflow = {
          ...state.currentWorkflow,
          nodes: state.currentWorkflow.nodes.map(node => {
            const update = message.node_status_updates?.find(
              u => u.node_id === node.id
            );
            return update ? { ...node, status: update.status } : node;
          }),
        };
      } else if (message.nodes && message.connections) {
        // Full workflow state update (fallback)
        newWorkflow = {
          nodes: message.nodes,
          connections: message.connections,
        };
      }

      // Update workflow completion status
      const newWorkflowComplete =
        message.workflow_complete !== undefined
          ? message.workflow_complete
          : state.workflowComplete;

      return {
        messages: newMessages,
        currentWorkflow: newWorkflow,
        workflowComplete: newWorkflowComplete,
      };
    }),

  setWorkflowComplete: complete => set({ workflowComplete: complete }),

  setLoading: loading => set({ isLoading: loading }),

  setError: error => set({ error }),

  clearMessages: () =>
    set({
      messages: [],
      currentWorkflow: { nodes: [], connections: [] },
      workflowComplete: false,
      error: null,
      nodeData: null,
      nodeDataLoading: false,
      nodeDataError: null,
    }),

  addUserMessage: content =>
    set(state => {
      const userMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        type: 'MESSAGE',
        content,
        timestamp: new Date().toISOString(),
      };

      // Add dummy assistant message immediately after user message
      const dummyAssistantMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        type: 'DUMMY_ASSISTANT',
        content: '',
        timestamp: new Date().toISOString(),
      };

      return {
        messages: [...state.messages, userMessage, dummyAssistantMessage],
      };
    }),

  addDummyAssistantMessage: () => {
    set(state => ({
      messages: [
        ...state.messages,
        {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          role: 'assistant',
          type: 'DUMMY_ASSISTANT',
          content: 'Thinking...',
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  },

  updateLastAssistantMessage: (
    content: string,
    messageType: 'text' | 'markdown' = 'text'
  ) => {
    set(state => {
      const lastAssistantMessageIndex = state.messages.findIndex(
        msg => msg.role === 'assistant' && msg.type === 'DUMMY_ASSISTANT'
      );

      if (lastAssistantMessageIndex !== -1) {
        const updatedMessages = [...state.messages];
        updatedMessages[lastAssistantMessageIndex] = {
          ...updatedMessages[lastAssistantMessageIndex],
          content,
          type: 'MESSAGE',
          message_type: messageType,
        };
        return { messages: updatedMessages };
      }
      return state;
    });
  },

  sendMessage: (message: any) => {
    // This will be implemented to send messages via WebSocket
    // For now, it's a placeholder
    console.log('Sending message:', message);
  },

  updateNodeStatus: (nodeId: string, status: DataFlowNode['status']) =>
    set(state => ({
      currentWorkflow: {
        ...state.currentWorkflow,
        nodes: state.currentWorkflow.nodes.map(node =>
          node.id === nodeId ? { ...node, status } : node
        ),
      },
    })),

  getCurrentWorkflowState: () => get().currentWorkflow,

  // Node data actions
  setNodeData: data => set({ nodeData: data, nodeDataError: null }),
  setNodeDataLoading: loading => set({ nodeDataLoading: loading }),
  setNodeDataError: error => set({ nodeDataError: error, nodeData: null }),
  clearNodeData: () =>
    set({ nodeData: null, nodeDataError: null, nodeDataLoading: false }),

  // Reset entire store to initial state
  resetStore: () =>
    set({
      messages: [],
      currentWorkflow: { nodes: [], connections: [] },
      workflowComplete: false,
      isLoading: false,
      error: null,
      nodeData: null,
      nodeDataLoading: false,
      nodeDataError: null,
    }),
}));
