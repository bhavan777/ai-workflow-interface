import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, Sparkles } from 'lucide-react';

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
  const isButtonDisabled = isLoading || !description.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 h-full flex flex-col"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <MessageSquare className="w-6 h-6 mr-3 text-primary" />
          </motion.div>
          Start Your Workflow
        </h2>
        <p className="text-sm text-muted-foreground">
          Describe your data pipeline and let AI guide you through configuration
        </p>
      </motion.div>

      <div className="space-y-6 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex-1"
        >
          <label className="block text-sm font-medium text-foreground mb-3">
            Describe your data workflow
          </label>
          <div className="relative group">
            <textarea
              value={description}
              onChange={e => onDescriptionChange(e.target.value)}
              placeholder="Describe what you want to accomplish... For example: 'Connect my Shopify store to Snowflake for analytics'"
              disabled={isLoading}
              aria-label="Workflow description"
              aria-describedby="workflow-description-hint"
              className="w-full h-32 p-4 border border-border rounded-lg resize-none bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <div
              id="workflow-description-hint"
              className="text-sm text-muted-foreground mt-2"
            >
              Be specific about your data sources, transformations, and
              destination
            </div>

            {/* Subtle glow effect when typing */}
            {description.trim() && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 pointer-events-none"
              />
            )}

            {/* Character count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-2 right-2 text-xs text-muted-foreground"
            >
              {description.length}/500
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onStartConversation}
              disabled={!description.trim() || isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Start conversation with AI assistant"
              aria-describedby="start-conversation-description"
            >
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? 'Starting...' : 'Start Workflow'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Button>

            {/* Hidden description for screen readers */}
            <div id="start-conversation-description" className="sr-only">
              Begin a conversation with the AI to configure your workflow
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Feature highlights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-6 pt-6 border-t border-border/50"
      >
        <div className="space-y-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <div className="w-1 h-1 bg-green-500 rounded-full mr-2" />
            Natural language configuration
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <div className="w-1 h-1 bg-blue-500 rounded-full mr-2" />
            Real-time workflow visualization
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <div className="w-1 h-1 bg-purple-500 rounded-full mr-2" />
            Step-by-step guidance
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
