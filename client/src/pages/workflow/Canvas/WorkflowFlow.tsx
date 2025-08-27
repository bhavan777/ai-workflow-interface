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
  onNodeClick?: (nodeId: string, nodeType: string) => void;
}

// Node types configuration
const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode,
};

function WorkflowFlow({ currentWorkflow, onNodeClick }: WorkflowFlowProps) {
  const reactFlowRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stabilize the onNodeClick function to prevent unnecessary re-renders
  const stableOnNodeClick = useCallback(
    (nodeId: string, nodeType: string) => {
      onNodeClick?.(nodeId, nodeType);
    },
    [onNodeClick]
  );

  // Effect to fit view when nodes change
  useEffect(() => {
    if (reactFlowRef.current && currentWorkflow.nodes.length > 0) {
      // Use a longer timeout to ensure DOM updates are complete
      const timeoutId = setTimeout(() => {
        reactFlowRef.current?.fitView({
          padding: 0.1,
          includeHiddenNodes: false,
          minZoom: 0.8,
          maxZoom: 1.2,
        });
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [currentWorkflow.nodes.length]);

  // Calculate node positions with fixed dimensions and layout-based responsiveness
  const calculateNodePositions = useMemo(() => {
    // Fixed node sizing - no responsive sizing
    const nodeWidth = 320;
    const nodeSpacing = 100;

    const totalNodes = currentWorkflow.nodes.length;

    if (totalNodes === 0) return [];

    // Simple layout: use vertical layout for 1-2 nodes, horizontal for 3+ nodes
    const isVerticalLayout = totalNodes <= 2;

    if (isVerticalLayout) {
      // Vertical layout: nodes stacked top to bottom
      const nodeHeight = nodeWidth * 0.6;
      const verticalSpacing = 120;

      // Calculate total height needed
      const totalHeight =
        totalNodes * nodeHeight + (totalNodes - 1) * verticalSpacing;

      // Fixed container height for calculations
      const containerHeight = 600;
      const startY = Math.max(80, (containerHeight - totalHeight) / 2);

      return currentWorkflow.nodes.map((node, index) => ({
        id: node.id,
        type: 'workflowNode' as const,
        position: {
          x: 50, // Fixed horizontal position
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

      // Fixed container width for calculations
      const containerWidth = 1200;
      const startX = Math.max(50, (containerWidth - totalWidth) / 2);

      return currentWorkflow.nodes.map((node, index) => ({
        id: node.id,
        type: 'workflowNode' as const,
        position: {
          x: startX + index * (nodeWidth + nodeSpacing),
          y: 50, // Fixed vertical position
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
  }, [currentWorkflow.nodes, stableOnNodeClick]);

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
          padding: 0.1,
          includeHiddenNodes: false,
          minZoom: 0.8,
          maxZoom: 1.2,
        }}
        attributionPosition="bottom-left"
        className="bg-background"
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
          gap={20}
          size={1}
          className="opacity-20"
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default WorkflowFlow;
