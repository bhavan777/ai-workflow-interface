import { Button } from '@/components/ui/button';
import { MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
              placeholder="e.g., Connect Shopify to Snowflake with data transformation"
              className="w-full h-32 resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:shadow-[0_0_0_4px_hsla(24,95%,53%,0.4)] focus:visible:ring-0 focus:visible:ring-offset-0 transition-all duration-300 group-hover:border-border/80 group-hover:shadow-sm"
              disabled={isLoading}
            />
            
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
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onStartConversation}
              disabled={isButtonDisabled}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                />
              ) : (
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Workflow</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              )}
            </Button>
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
