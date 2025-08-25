import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface EmptyStateProps {
  isConnecting: boolean;
  isLoading: boolean;
}

export default function EmptyState({
  isConnecting,
  isLoading,
}: EmptyStateProps) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        {isConnecting || isLoading ? (
          <>
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Brain className="w-8 h-8 text-primary" />
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {isConnecting
                ? 'Preparing Your Workflow ✨'
                : 'Processing Your Request ✨'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {isConnecting
                ? 'Setting up the AI assistant to help you build amazing data pipelines'
                : 'The AI is analyzing your request and building your workflow'}
            </p>
          </>
        ) : (
          <>
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Workflow Yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Start a conversation to see your workflow here.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
