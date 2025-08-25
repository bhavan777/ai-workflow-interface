import type { DataFlowConnection, DataFlowNode } from '@/types';
import { useEffect, useRef, useState } from 'react';
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
}

// Node types configuration
const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode,
};

export default function WorkflowFlow({
  currentWorkflow,
  onNodeClick,
}: WorkflowFlowProps) {
  const reactFlowRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [containerHeight, setContainerHeight] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  // Effect to update container dimensions on resize
  useEffect(() => {
    const updateContainerDimensions = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        const newHeight = containerRef.current.offsetHeight;
        setContainerWidth(newWidth);
        setContainerHeight(newHeight);
      }
    };

    // Initial measurement
    updateContainerDimensions();

    // Add resize listener with debouncing
    let resizeTimeout: number;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateContainerDimensions, 100);
    };

    // Use ResizeObserver for more accurate container size changes
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  // Effect to fit view when nodes change or container resizes
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
  }, [currentWorkflow.nodes.length, containerWidth, containerHeight]);

  // Calculate dynamic node positions based on container dimensions
  const calculateNodePositions = () => {
    // Responsive node sizing based on container width
    let nodeWidth: number;
    let nodeSpacing: number;

    if (containerWidth < 768) {
      // Mobile: smaller nodes, less spacing
      nodeWidth = 280;
      nodeSpacing = 60;
    } else if (containerWidth < 1024) {
      // Tablet: medium nodes, medium spacing
      nodeWidth = 300;
      nodeSpacing = 80;
    } else if (containerWidth < 1440) {
      // Desktop: standard nodes, standard spacing
      nodeWidth = 320;
      nodeSpacing = 100;
    } else {
      // Large screens: larger nodes, more spacing
      nodeWidth = 360;
      nodeSpacing = 120;
    }

    const totalNodes = currentWorkflow.nodes.length;

    if (totalNodes === 0) return [];

    // Determine layout direction based on aspect ratio
    const aspectRatio = containerWidth / containerHeight;
    const isVerticalLayout = aspectRatio < 1.2; // If width is less than 1.2x height, use vertical layout

    if (isVerticalLayout) {
      // Vertical layout: nodes stacked top to bottom
      const nodeHeight = nodeWidth * 0.6; // Approximate node height based on width
      const verticalSpacing = Math.max(nodeSpacing * 1.2, 120); // Increased spacing for vertical layout

      // Calculate total height needed
      const totalHeight =
        totalNodes * nodeHeight + (totalNodes - 1) * verticalSpacing;

      // Calculate starting position to center the nodes vertically
      const startY = Math.max(80, (containerHeight - totalHeight) / 2);

      return currentWorkflow.nodes.map((node, index) => ({
        id: node.id,
        type: 'workflowNode' as const,
        position: {
          x: Math.max(80, (containerWidth - nodeWidth) / 2), // Center horizontally with more margin
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

      // Calculate starting position to center the nodes
      const startX = Math.max(50, (containerWidth - totalWidth) / 2);

      return currentWorkflow.nodes.map((node, index) => ({
        id: node.id,
        type: 'workflowNode' as const,
        position: {
          x: startX + index * (nodeWidth + nodeSpacing),
          y: 0,
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
  };

  // Convert workflow nodes to React Flow nodes with dynamic positioning
  const nodes: Node[] = calculateNodePositions();

  // Determine layout direction for connections and workflow key
  const aspectRatio = containerWidth / containerHeight;
  const isVerticalLayout = aspectRatio < 1.2;
  const layoutKey = isVerticalLayout ? 'vertical' : 'horizontal';

  // Convert workflow connections to React Flow edges
  const edges: Edge[] = currentWorkflow.connections.map(connection => {
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

  // Create a stable key for React Flow to prevent unnecessary re-renders
  const workflowKey =
    currentWorkflow.nodes.length > 0
      ? `nodes-${currentWorkflow.nodes.length}-width-${containerWidth}-height-${containerHeight}-layout-${layoutKey}`
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
