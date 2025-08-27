import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: string;
  backdropClassName?: string;
  drawerClassName?: string;
}

export default function Drawer({
  isOpen,
  onClose,
  children,
  position = 'right',
  width = 'w-96',
  backdropClassName = 'bg-primary/10 backdrop-blur-sm',
  drawerClassName = '',
}: DrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const slideDirection = position === 'right' ? 'x' : '-x';
  const slideValue = position === 'right' ? '100%' : '-100%';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${backdropClassName} z-[60]`}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ [slideDirection]: slideValue }}
            animate={{ [slideDirection]: 0 }}
            exit={{ [slideDirection]: slideValue }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed ${position}-0 top-0 h-full ${width} bg-background border-l border-border shadow-2xl shadow-primary/30 z-[70] ${drawerClassName}`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
