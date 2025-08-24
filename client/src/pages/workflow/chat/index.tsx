import { useChat } from '@/hooks/useChat';
import { useState } from 'react';
import ChatInput from './ChatInput';
import Messages from './Messages';
import WorkflowSetup from './WorkflowSetup';

interface ChatProps {
  onStartConversation: (description: string) => Promise<void>;
  onSendMessage: (content: string) => void;
}

export default function Chat({
  onStartConversation,
  onSendMessage,
}: ChatProps) {
  const { messages, isLoading } = useChat();
  const [description, setDescription] = useState('');
  const [inputValue, setInputValue] = useState('');

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

  // If no conversation has started, show the workflow setup
  if (!hasStarted) {
    return (
      <div className="w-1/2 border-r border-border bg-background/50">
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
    <div className="w-1/2 border-r border-border bg-background/50 flex flex-col h-full">
      {/* Messages - takes up most of the space */}
      <Messages messages={messages} />

      {/* Chat Input - fixed at bottom */}
      <ChatInput
        inputValue={inputValue}
        isLoading={isLoading}
        onInputChange={setInputValue}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
