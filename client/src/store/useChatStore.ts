import type { DataFlowConnection, DataFlowNode, Message } from '@/types';
import { create } from 'zustand';

interface ChatState {
  // State
  messages: Message[];
  currentWorkflow: {
    nodes: DataFlowNode[];
    connections: DataFlowConnection[];
  };
  currentThought: string | null;
  workflowComplete: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  addMessage: (message: Message) => void;
  setCurrentThought: (thought: string | null) => void;
  setWorkflowComplete: (complete: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  addUserMessage: (content: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  messages: [],
  currentWorkflow: {
    nodes: [],
    connections: [],
  },
  currentThought: null,
  workflowComplete: false,
  isLoading: false,
  error: null,

  // Actions
  addMessage: message =>
    set(state => {
      // Only add non-thought messages to the messages array
      const newMessages =
        message.type !== 'THOUGHT'
          ? [...state.messages, message]
          : state.messages;

      // Update workflow state if message contains nodes/connections
      const newWorkflow =
        message.nodes && message.connections
          ? { nodes: message.nodes, connections: message.connections }
          : state.currentWorkflow;

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

  setCurrentThought: thought => set({ currentThought: thought }),

  setWorkflowComplete: complete => set({ workflowComplete: complete }),

  setLoading: loading => set({ isLoading: loading }),

  setError: error => set({ error }),

  clearMessages: () =>
    set({
      messages: [],
      currentWorkflow: { nodes: [], connections: [] },
      currentThought: null,
      workflowComplete: false,
      error: null,
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
      return {
        messages: [...state.messages, userMessage],
      };
    }),
}));
