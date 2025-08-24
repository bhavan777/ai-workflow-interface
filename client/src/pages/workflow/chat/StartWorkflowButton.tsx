import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StartWorkflowButtonProps {
  onStartWorkflow: () => void;
}

export default function StartWorkflowButton({ onStartWorkflow }: StartWorkflowButtonProps) {
  return (
    <div className="flex justify-center p-4">
      <Button
        onClick={onStartWorkflow}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
        size="lg"
      >
        <Play className="w-5 h-5" />
        <span>Start Workflow</span>
      </Button>
    </div>
  );
}
