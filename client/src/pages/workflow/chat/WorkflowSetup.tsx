import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface WorkflowSetupProps {
  description: string;
  isLoading: boolean;
  onDescriptionChange: (description: string) => void;
  onStartConversation: () => void;
}

export default function WorkflowSetup({
  description,
  isLoading,
  onDescriptionChange,
  onStartConversation,
}: WorkflowSetupProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2" />
        Start Your Workflow
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Describe your data workflow
          </label>
          <textarea
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
            placeholder="e.g., Connect Shopify to Snowflake with data transformation"
            className="input h-32 resize-none"
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={onStartConversation}
          disabled={isLoading || !description.trim()}
          className="w-full"
        >
          {isLoading ? 'Starting...' : 'Start Workflow'}
        </Button>
      </div>
    </div>
  );
}
