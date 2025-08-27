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
  onNodeDataRequest: (nodeId: string, nodeType: string) => void;
}

export default function Canvas({
  currentWorkflow,
  isConnecting = false,
  onNodeDataRequest,
}: CanvasProps) {
  const { nodeData, clearNodeData, isLoading } = useChatStore();

  const handleNodeClick = useCallback(
    (nodeId: string, nodeType: string) => {
      onNodeDataRequest(nodeId, nodeType);
    },
    [onNodeDataRequest]
  );

  const handleCloseDrawer = useCallback(() => {
    clearNodeData();
  }, [clearNodeData]);

  return (
    <div className="w-2/3 bg-background/30 relative">
      <div className="h-full">
        {currentWorkflow.nodes.length > 0 ? (
          <div className="h-full">
            {/* React Flow Canvas - Full Height */}
            <WorkflowFlow
              currentWorkflow={currentWorkflow}
              onNodeClick={handleNodeClick}
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
