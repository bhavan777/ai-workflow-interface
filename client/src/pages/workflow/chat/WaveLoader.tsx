import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export default function WaveLoader() {
  return (
    <div className="flex space-x-3 items-start justify-start">
      {/* AI Avatar */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <Bot className="w-4 h-4 text-primary-foreground" />
      </motion.div>

      <div className="flex flex-col max-w-xs items-start">
        {/* AI Name */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-xs mb-1 font-medium text-primary text-left"
        >
          Nexla
        </motion.div>

        {/* Wave Loader Message Bubble */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-full px-3 py-4 bg-primary text-primary-foreground rounded-r-lg rounded-bl-lg relative transition-all duration-200"
        >
          <div className="flex items-center space-x-1">
            <motion.div
              className="w-2 h-2 bg-primary-foreground rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                y: [0, -5, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="w-2 h-2 bg-primary-foreground rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                y: [0, -5, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2,
              }}
            />
            <motion.div
              className="w-2 h-2 bg-primary-foreground rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                y: [0, -5, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4,
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
