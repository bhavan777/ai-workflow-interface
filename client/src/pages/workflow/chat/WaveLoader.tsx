import { motion } from 'framer-motion';

interface WaveLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function WaveLoader({
  size = 'md',
  className = '',
}: WaveLoaderProps) {
  const dotSize =
    size === 'sm' ? 'size-1.5' : size === 'lg' ? 'size-2.5' : 'size-2';
  const spaceSize =
    size === 'sm' ? 'space-x-0.5' : size === 'lg' ? 'space-x-2' : 'space-x-1';

  return (
    <div className={`flex items-center h-5 ${spaceSize} ${className}`}>
      <motion.div
        className={`${dotSize} bg-current rounded-full`}
        animate={{
          scale: [1, 1.2, 1],
          y: [0, -4, 0],
          opacity: [0.2, 1, 0.2],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className={`${dotSize} bg-current rounded-full`}
        animate={{
          scale: [1, 1.2, 1],
          y: [0, -4, 0],
          opacity: [0.2, 1, 0.2],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.2,
        }}
      />
      <motion.div
        className={`${dotSize} bg-current rounded-full`}
        animate={{
          scale: [1, 1.2, 1],
          y: [0, -4, 0],
          opacity: [0.2, 1, 0.2],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.4,
        }}
      />
    </div>
  );
}
