import { useChat } from '@/hooks/useChat';
import type { Message } from '@/store/types';
import { useState } from 'react';
import ChatInput from './ChatInput';
import Messages from './Messages';
import ThoughtsPanel from './ThoughtsPanel';
import WorkflowSetup from './WorkflowSetup';

interface ChatProps {
  conversationId: string | undefined;
  isLoading: boolean;
  thoughts: Message[];
  onStartConversation: (description: string) => Promise<void>;
  onContinueConversation: (answer: string) => void;
}

export default function Chat({
  conversationId,
  isLoading,
  thoughts,
  onStartConversation,
  onContinueConversation,
}: ChatProps) {
  const { messages } = useChat();
  const [description, setDescription] = useState('');
  const [inputValue, setInputValue] = useState('');

  const handleStartConversation = async () => {
    if (!description.trim()) return;
    await onStartConversation(description);
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    onContinueConversation(inputValue);
    setInputValue('');
  };

  // If no conversation has started, show the workflow setup
  if (!conversationId) {
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

      {/* Thoughts Panel - shows when there are thoughts */}
      {thoughts.length > 0 && (
        <div className="border-t border-border">
          <ThoughtsPanel thoughts={thoughts} />
        </div>
      )}

      {/* Chat Input - fixed at bottom */}
      <ChatInput
        inputValue={inputValue}
        isLoading={isLoading}
        conversationId={conversationId}
        onInputChange={setInputValue}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
