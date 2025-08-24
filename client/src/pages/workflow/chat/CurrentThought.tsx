import type { Message } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface CurrentThoughtProps {
  thought: Message | null;
}

export default function CurrentThought({ thought }: CurrentThoughtProps) {
  if (!thought) {
    return null;
  }

  return (
    <div className="flex items-start space-x-3 justify-start">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <Brain className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex flex-col max-w-xs">
        <div className="text-xs opacity-70 mb-1 text-left">AI Thinking</div>
        <motion.div
          layout
          transition={{
            duration: 0.3,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="px-4 py-2 bg-blue-50 text-blue-800 border border-blue-200 rounded-r-lg rounded-bl-lg"
        >
          <AnimatePresence mode="wait">
            <motion.p
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
                duration: 0.2,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="text-sm whitespace-pre-wrap"
            >
              {thought.content}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
