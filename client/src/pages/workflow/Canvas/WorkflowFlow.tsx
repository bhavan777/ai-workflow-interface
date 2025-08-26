import type { DataFlowConnection, DataFlowNode } from '@/types';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Edge, EdgeMarkerType, Node, NodeTypes } from 'reactflow';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import WorkflowNode from './WorkflowNode';

interface WorkflowFlowProps {
  currentWorkflow: {
    nodes: DataFlowNode[];
    connections: DataFlowConnection[];
  };
  onNodeClick?: (nodeId: string) => void;
  isMobile?: boolean;
}

// Node types configuration
const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode,
};

function WorkflowFlow({
  currentWorkflow,
  onNodeClick,
  isMobile = false,
}: WorkflowFlowProps) {
  const reactFlowRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stabilize the onNodeClick function to prevent unnecessary re-renders
  const stableOnNodeClick = useCallback(
    (nodeId: string) => {
      onNodeClick?.(nodeId);
    },
    [onNodeClick]
  );

  // Effect to fit view when nodes change
  useEffect(() => {
    if (reactFlowRef.current && currentWorkflow.nodes.length > 0) {
      // Use a longer timeout to ensure DOM updates are complete
      const timeoutId = setTimeout(() => {
        reactFlowRef.current?.fitView({
          padding: isMobile ? 0.05 : 0.1, // Less padding on mobile
          includeHiddenNodes: false,
          minZoom: isMobile ? 0.6 : 0.8, // Allow more zoom out on mobile
          maxZoom: isMobile ? 1.5 : 1.2, // Allow more zoom in on mobile
        });
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [currentWorkflow.nodes.length, isMobile]);

  // Calculate node positions with responsive dimensions
  const calculateNodePositions = useMemo(() => {
    // Responsive node sizing
    const nodeWidth = isMobile ? 260 : 320; // Smaller on mobile
    const nodeSpacing = isMobile ? 60 : 100; // Tighter spacing on mobile

    const totalNodes = currentWorkflow.nodes.length;

    if (totalNodes === 0) return [];

    // Mobile: always use vertical layout, Desktop: use vertical for 1-2 nodes, horizontal for 3+
    const isVerticalLayout = isMobile || totalNodes <= 2;

    if (isVerticalLayout) {
      // Vertical layout: nodes stacked top to bottom
      const nodeHeight = nodeWidth * 0.6;
      const verticalSpacing = isMobile ? 80 : 120; // Tighter spacing on mobile

      // Calculate total height needed
      const totalHeight =
        totalNodes * nodeHeight + (totalNodes - 1) * verticalSpacing;

      // Responsive container height - smaller on mobile
      const containerHeight = isMobile ? 300 : 600;
      const startY = Math.max(40, (containerHeight - totalHeight) / 2); // Smaller margin on mobile

      return currentWorkflow.nodes.map((node, index) => ({
        id: node.id,
        type: 'workflowNode' as const,
        position: {
          x: isMobile ? 10 : 50, // Smaller margin on mobile
          y: startY + index * (nodeHeight + verticalSpacing),
        },
        data: {
          id: node.id,
          type: node.type,
          name: node.name,
          status: node.status,
          config: node.config,
          data_requirements: node.data_requirements,
          onNodeClick,
          nodeWidth,
          isVerticalLayout,
        },
      }));
    } else {
      // Horizontal layout: nodes arranged left to right
      // Calculate total width needed
      const totalWidth =
        totalNodes * nodeWidth + (totalNodes - 1) * nodeSpacing;

      // Responsive container width
      const containerWidth = isMobile ? 600 : 1200; // Smaller on mobile
      const startX = Math.max(30, (containerWidth - totalWidth) / 2); // Smaller margin on mobile

      return currentWorkflow.nodes.map((node, index) => ({
        id: node.id,
        type: 'workflowNode' as const,
        position: {
          x: startX + index * (nodeWidth + nodeSpacing),
          y: 30, // Smaller margin on mobile
        },
        data: {
          id: node.id,
          type: node.type,
          name: node.name,
          status: node.status,
          config: node.config,
          data_requirements: node.data_requirements,
          onNodeClick,
          nodeWidth,
          isVerticalLayout,
        },
      }));
    }
  }, [currentWorkflow.nodes, stableOnNodeClick, isMobile]);

  // Convert workflow nodes to React Flow nodes with dynamic positioning
  const nodes: Node[] = useMemo(() => {
    return calculateNodePositions.map(node => ({
      ...node,
      data: {
        ...node.data,
        // Ensure stable references for functions
        onNodeClick: onNodeClick || (() => {}),
      },
    }));
  }, [calculateNodePositions, stableOnNodeClick]);

  // Determine layout direction for connections and workflow key
  const isVerticalLayout = currentWorkflow.nodes.length <= 2;
  const layoutKey = isVerticalLayout ? 'vertical' : 'horizontal';

  // Convert workflow connections to React Flow edges
  const edges: Edge[] = useMemo(() => {
    return currentWorkflow.connections.map(connection => {
      return {
        id: connection.id,
        source: connection.source,
        target: connection.target,
        type: 'smoothstep',
        sourceHandle: isVerticalLayout ? 'bottom' : 'right',
        targetHandle: isVerticalLayout ? 'top' : 'left',
        style: {
          stroke:
            connection.status === 'complete'
              ? '#10b981'
              : connection.status === 'error'
                ? '#ef4444'
                : '#6b7280',
          strokeWidth: 2,
        },
        markerEnd: {
          type: 'arrowclosed',
          width: 20,
          height: 20,
          color:
            connection.status === 'complete'
              ? '#10b981'
              : connection.status === 'error'
                ? '#ef4444'
                : '#6b7280',
        } as EdgeMarkerType,
      };
    });
  }, [currentWorkflow.connections, isVerticalLayout]);

  // Create a stable key for React Flow to prevent unnecessary re-renders
  // Only change key when node count or node IDs change, not on status updates
  const nodeIds = currentWorkflow.nodes
    .map(n => n.id)
    .sort()
    .join('-');
  const workflowKey =
    currentWorkflow.nodes.length > 0
      ? `nodes-${currentWorkflow.nodes.length}-ids-${nodeIds}-layout-${layoutKey}`
      : 'empty';

  return (
    <div
      ref={containerRef}
      className="h-full bg-background rounded-lg border border-border"
    >
      <ReactFlow
        key={workflowKey}
        ref={reactFlowRef}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: isMobile ? 0.05 : 0.1,
          includeHiddenNodes: false,
          minZoom: isMobile ? 0.6 : 0.8,
          maxZoom: isMobile ? 1.5 : 1.2,
        }}
        attributionPosition="bottom-left"
        className="bg-background"
        panOnDrag={true}
        panOnScroll={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        preventScrolling={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        selectNodesOnDrag={false}
        multiSelectionKeyCode={null}
        deleteKeyCode={null}
        snapToGrid={false}
        snapGrid={[15, 15]}
        onlyRenderVisibleElements={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={isMobile ? 0.3 : 0.5}
        maxZoom={isMobile ? 2 : 1.5}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="16"
            markerHeight="12"
            refX="12"
            refY="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 0, 16 6, 0 12"
              fill="#6b7280"
              stroke="#6b7280"
              strokeWidth="1"
            />
          </marker>
        </defs>
        <Background
          color="hsl(var(--muted-foreground))"
          gap={isMobile ? 15 : 20}
          size={1}
          className="opacity-20"
        />
        <Controls
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          position={isMobile ? 'bottom-right' : 'bottom-left'}
        />
      </ReactFlow>
    </div>
  );
}

export default WorkflowFlow;
