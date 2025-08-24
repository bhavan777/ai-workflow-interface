import { Button } from '@/components/ui/button';
import { Edit, Play } from 'lucide-react';

interface StartWorkflowButtonProps {
  onStartWorkflow: () => void;
  onEditWorkflow?: () => void;
}

export default function StartWorkflowButton({
  onStartWorkflow,
  onEditWorkflow,
}: StartWorkflowButtonProps) {
  return (
    <div className="flex justify-center items-center space-x-3 p-4">
      {/* Secondary action - Edit Workflow */}
      {onEditWorkflow && (
        <Button
          onClick={onEditWorkflow}
          variant="outline"
          className="text-muted-foreground hover:text-foreground border-muted-foreground/20 hover:border-muted-foreground/40"
          size="lg"
        >
          <Edit className="w-4 h-4 mr-2" />
          <span>Edit Workflow</span>
        </Button>
      )}

      {/* Primary CTA - Start Workflow */}
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
