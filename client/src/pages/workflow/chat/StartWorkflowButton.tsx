import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Edit, Zap } from 'lucide-react';

interface StartWorkflowButtonProps {
  onStartWorkflow: () => void;
  onEditWorkflow?: () => void;
}

export default function StartWorkflowButton({
  onStartWorkflow,
  onEditWorkflow,
}: StartWorkflowButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 border-t border-border bg-background/50"
    >
      <div className="space-y-3">
        <Button
          onClick={onStartWorkflow}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-200 hover:shadow-md"
          aria-label="Start workflow execution"
          aria-describedby="start-workflow-description"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Start Workflow</span>
          </motion.div>
        </Button>

        {onEditWorkflow && (
          <Button
            onClick={onEditWorkflow}
            variant="outline"
            className="w-full h-10 border-border hover:bg-muted text-foreground font-medium rounded-lg transition-all duration-200"
            aria-label="Edit workflow configuration"
            aria-describedby="edit-workflow-description"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center space-x-2"
            >
              <Edit className="w-3 h-3" />
              <span>Edit Workflow</span>
            </motion.div>
          </Button>
        )}
      </div>

      {/* Hidden descriptions for screen readers */}
      <div id="start-workflow-description" className="sr-only">
        Execute the configured workflow to process your data
      </div>
      <div id="edit-workflow-description" className="sr-only">
        Modify the current workflow configuration
      </div>

      {/* Success indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="absolute -top-2 right-4"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-white text-xs">✓</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
