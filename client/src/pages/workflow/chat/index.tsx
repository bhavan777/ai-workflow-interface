import { useChat } from '@/hooks/useChat';
import { useEffect, useRef, useState } from 'react';
import ChatInput from './ChatInput';
import Messages from './Messages';
import StartWorkflowButton from './StartWorkflowButton';
import WorkflowSetup from './WorkflowSetup';

interface ChatProps {
  onStartConversation: (description: string) => Promise<void>;
  onSendMessage: (content: string) => void;
  onStartWorkflow?: () => void;
  onEditWorkflow?: () => void;
}

export default function Chat({
  onStartConversation,
  onSendMessage,
  onStartWorkflow,
  onEditWorkflow,
}: ChatProps) {
  const { messages, isLoading, workflowComplete } = useChat();
  const [description, setDescription] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input after AI responds
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && !isLoading) {
      // Focus the input after AI response
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isLoading]);

  // Check if conversation has started (has any messages)
  const hasStarted = messages.length > 0;

  const handleStartConversation = async () => {
    if (!description.trim()) return;
    await onStartConversation(description);
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleStartWorkflow = () => {
    if (onStartWorkflow) {
      onStartWorkflow();
    }
  };

  const handleEditWorkflow = () => {
    setIsEditMode(true);

    // Automatically send the edit request message to the server
    const editMessage = "I'd like to edit the config";
    onSendMessage(editMessage);

    if (onEditWorkflow) {
      onEditWorkflow();
    }
  };

  const handleRetry = () => {
    // Send a retry message to the server
    const retryMessage = 'Please retry the previous operation';
    onSendMessage(retryMessage);
  };

  // If no conversation has started, show the workflow setup
  if (!hasStarted) {
    return (
      <div className="w-1/3 border-r border-border bg-background/50">
        <WorkflowSetup
          description={description}
          isLoading={isLoading}
          onDescriptionChange={setDescription}
          onStartConversation={handleStartConversation}
        />
      </div>
    );
  }

  return (
    <div className="w-1/3 border-r border-border bg-background/50 flex flex-col h-full">
      {/* Messages - takes up most of the space */}
      <Messages
        messages={messages}
        isWorkflowComplete={workflowComplete && !isEditMode}
        onRetry={handleRetry}
      />

      {/* Start Workflow Button - shows when configuration is complete */}
      {workflowComplete && !isEditMode && (
        <StartWorkflowButton
          onStartWorkflow={handleStartWorkflow}
          onEditWorkflow={handleEditWorkflow}
        />
      )}

      {/* Chat Input - fixed at bottom */}
      <ChatInput
        ref={inputRef}
        inputValue={inputValue}
        isLoading={isLoading}
        onInputChange={setInputValue}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
