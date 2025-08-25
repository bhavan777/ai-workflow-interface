import type { Message } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';

interface CurrentThoughtProps {
  thought: Message | null;
}

// Skeleton loading component for thoughts
const ThoughtSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center space-x-3 justify-start"
  >
    <motion.div
      animate={{
        backgroundColor: [
          'rgba(59, 130, 246, 0.1)',
          'rgba(59, 130, 246, 0.2)',
          'rgba(59, 130, 246, 0.1)',
        ],
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="flex-shrink-0 w-8 h-8 bg-blue-100/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-blue-200/50"
    >
      <Brain className="w-4 h-4 text-blue-600" />
    </motion.div>
    <div className="flex flex-col max-w-xs space-y-2">
      <motion.div
        animate={{
          backgroundColor: [
            'rgba(156, 163, 175, 0.2)',
            'rgba(156, 163, 175, 0.4)',
            'rgba(156, 163, 175, 0.2)',
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        className="h-4 bg-gray-300/30 rounded-full w-32"
      />
      <motion.div
        animate={{
          backgroundColor: [
            'rgba(156, 163, 175, 0.2)',
            'rgba(156, 163, 175, 0.4)',
            'rgba(156, 163, 175, 0.2)',
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        className="h-4 bg-gray-300/30 rounded-full w-24"
      />
    </div>
  </motion.div>
);

export default function CurrentThought({ thought }: CurrentThoughtProps) {
  if (!thought) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex items-center space-x-3 justify-start"
    >
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 backdrop-blur-sm rounded-full flex items-center justify-center border border-blue-300/50 shadow-sm"
      >
        <Sparkles className="w-4 h-4 text-blue-600" />
      </motion.div>
      <div className="flex flex-col max-w-xs">
        <AnimatePresence mode="wait">
          <motion.div
            key={thought.id}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0.0, 0.2, 1],
            }}
            className="relative overflow-hidden"
          >
            {/* Shimmer effect background */}
            <motion.div
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />

            <motion.p className="text-sm whitespace-pre-wrap text-gray-500 font-medium px-3 py-2 rounded-lg bg-gray-100/50 backdrop-blur-sm border border-gray-200/50 relative z-10">
              {thought.content}
            </motion.p>

            {/* Animated dots */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -bottom-1 left-2 flex space-x-1 z-20"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-1 h-1 bg-blue-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="w-1 h-1 bg-blue-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="w-1 h-1 bg-blue-400 rounded-full"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
