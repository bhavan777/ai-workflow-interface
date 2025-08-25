import { Button } from '@/components/ui/button';
import { useChatStore } from '@/store/useChatStore';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Circle, X } from 'lucide-react';

interface NodeDataDrawerProps {
  onClose: () => void;
}

export default function NodeDataDrawer({ onClose }: NodeDataDrawerProps) {
  const { nodeData, nodeDataLoading, nodeDataError } = useChatStore();

  // Only show drawer when node data is present
  const isVisible = !!nodeData || nodeDataLoading || nodeDataError;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Node Details
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {nodeDataLoading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">Loading node data...</p>
                </div>
              ) : nodeDataError ? (
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-700">{nodeDataError}</p>
                </div>
              ) : nodeData ? (
                <>
                  {/* Node Title */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Node Name
                    </h3>
                    <p className="text-lg font-semibold text-foreground">
                      {nodeData.node_title}
                    </p>
                  </div>

                  {/* Filled Values */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Field Values
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(nodeData.filled_values).map(
                        ([field, value]) => (
                          <div
                            key={field}
                            className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                          >
                            <div className="flex items-center space-x-2">
                              {value === 'Not filled' ? (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              <span className="text-sm font-medium text-foreground">
                                {field.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <span
                              className={`text-sm ${
                                value === 'Not filled'
                                  ? 'text-muted-foreground'
                                  : 'text-foreground font-medium'
                              }`}
                            >
                              {value}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">
                    No node data available
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
