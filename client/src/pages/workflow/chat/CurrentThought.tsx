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
    <div className="flex items-center space-x-3 justify-start">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-blue-200/50">
        <Brain className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex flex-col max-w-xs">
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
            className="text-sm whitespace-pre-wrap text-gray-400 font-medium"
          >
            {thought.content}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
