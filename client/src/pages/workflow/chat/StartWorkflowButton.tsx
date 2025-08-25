import { Button } from '@/components/ui/button';
import { Edit, Play, Rocket, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

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
      transition={{ duration: 0.5 }}
      className="flex justify-center items-center space-x-3 p-4 bg-gradient-to-r from-green-50/50 to-blue-50/50 border-t border-border/50"
    >
      {/* Secondary action - Edit Workflow */}
      {onEditWorkflow && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onEditWorkflow}
              variant="outline"
              className="text-muted-foreground hover:text-foreground border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-background/80 transition-all duration-200"
              size="lg"
            >
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ duration: 0.2 }}
              >
                <Settings className="w-4 h-4 mr-2" />
              </motion.div>
              <span>Edit Workflow</span>
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Primary CTA - Start Workflow */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onStartWorkflow}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <motion.div
              animate={{ 
                y: [0, -2, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Rocket className="w-5 h-5" />
            </motion.div>
            <span>Start Workflow</span>
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Play className="w-4 h-4" />
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>

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
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-white text-xs">✓</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
