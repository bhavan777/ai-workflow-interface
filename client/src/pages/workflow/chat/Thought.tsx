import type { Message } from '@/types';
import { motion } from 'framer-motion';

interface ThoughtProps {
  thought: Message;
  index: number;
}

export default function Thought({ thought, index }: ThoughtProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: -20,
        scale: 0.95,
      }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1], // Custom easing for smooth motion
        delay: index * 0.1, // Stagger effect for multiple thoughts
      }}
      className="flex items-start space-x-2 text-sm"
    >
      <motion.span
        className="text-muted-foreground"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        •
      </motion.span>
      <span className="text-foreground">{thought.content}</span>
    </motion.div>
  );
}
