import { useChatStore } from '@/store/useChatStore';
import type { DataFlowConnection, DataFlowNode } from '@/types';
import { useCallback } from 'react';
import EmptyState from './EmptyState';
import NodeDataDrawer from './NodeDataDrawer';
import WorkflowFlow from './WorkflowFlow';

interface CanvasProps {
  currentWorkflow: {
    nodes: DataFlowNode[];
    connections: DataFlowConnection[];
  };
  isConnecting?: boolean;
  onNodeDataRequest: (nodeId: string) => void;
  isMobile?: boolean;
}

export default function Canvas({
  currentWorkflow,
  isConnecting = false,
  onNodeDataRequest,
  isMobile = false,
}: CanvasProps) {
  const { nodeData, clearNodeData, isLoading } = useChatStore();

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      onNodeDataRequest(nodeId);
    },
    [onNodeDataRequest]
  );

  const handleCloseDrawer = useCallback(() => {
    clearNodeData();
  }, [clearNodeData]);

  return (
    <div className="w-full h-full bg-background/30 relative">
      <div className="h-full">
        {currentWorkflow.nodes.length > 0 ? (
          <div className="h-full">
            {/* React Flow Canvas - Full Height */}
            <WorkflowFlow
              currentWorkflow={currentWorkflow}
              onNodeClick={handleNodeClick}
              isMobile={isMobile}
            />
          </div>
        ) : (
          <EmptyState isConnecting={isConnecting} isLoading={isLoading} />
        )}
      </div>

      {/* Always render the drawer, but only show when node data is present */}
      <NodeDataDrawer onClose={handleCloseDrawer} />
    </div>
  );
}
