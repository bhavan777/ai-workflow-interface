import type { Message } from '@/types';
import { AnimatePresence } from 'framer-motion';
import Thought from './Thought';

interface ThoughtsPanelProps {
  thoughts: Message[];
}

export default function ThoughtsPanel({ thoughts }: ThoughtsPanelProps) {
  if (thoughts.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-hidden">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        AI Thoughts
      </h3>
      <div className="space-y-2 overflow-y-auto h-full pr-2">
        <AnimatePresence mode="popLayout">
          {thoughts.map((thought, index) => (
            <Thought key={thought.id} thought={thought} index={index} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
