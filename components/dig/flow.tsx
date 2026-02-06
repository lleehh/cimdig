'use client';
import React, { useCallback, useEffect, useRef, useMemo } from "react";
import {
  ReactFlow,
  Viewport,
  Controls,
  MiniMap,
  Background,
  Panel,
  NodeTypes,
  useReactFlow
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import FlowComponent from "@/components/dig/flow-component";
import SearchBar from "@/components/ui/search-bar";
import useFlowStore, { selector } from "@/lib/store/store-flow";
import { useShallow } from "zustand/react/shallow";
import { CIM } from "@/lib/cim";
import { createNodesAndEdges, getLayoutedElements } from "@/lib/flow-utils";
import { createPinchZoomHandler } from "@/lib/pinch-zoom";

const nodeTypes = { flowComponent: FlowComponent } as NodeTypes;

interface DigProps {
  equipment?: CIM | null;
}

export default function Dig({ equipment }: DigProps) {
  // useReactFlow inside component
  // setViewport may or may not be provided by your reactflow version; createPinchZoomHandler handles fallback
  const { fitView, getNode, setCenter, getViewport, setViewport } = useReactFlow();

  const {
    focusNodeId,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,
  } = useFlowStore(useShallow(selector));

  // container ref for attaching native listener and measuring size if needed
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (equipment) {
      const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(equipment);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [equipment, setNodes, setEdges]);

  useEffect(() => {
    if (focusNodeId) {
      focusNodeHandle(focusNodeId);
    }
  }, [focusNodeId]); // eslint-disable-line

  const onLayout = useCallback(
    (direction: string) => {
      const layouted = getLayoutedElements(nodes, edges, { direction });
      setNodes([...layouted.nodes]);
      setEdges([...layouted.edges]);

      window.requestAnimationFrame(() => {
        fitView({ duration: 500, padding: 0.2 });
      });
    },
    [nodes, edges, setNodes, setEdges, fitView],
  );

  const focusNodeHandle = (nodeId: string) => {
    const layouted = getLayoutedElements(nodes, edges, { direction: 'LR' });
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);

    const node = layouted.nodes.find(n => n.id === nodeId);
    if (node) {
      setCenter(node.position.x, node.position.y, {
        zoom: 1.0,
        duration: 500,
      });
    }
  };

  // initial viewport (keeps old behavior)
  const defaultViewport: Viewport = { x: 100, y: 300, zoom: 0.8 };

  // create pinch handler and pass getContainer so it can compute zoom-to-cursor
  const pinchZoomHandler = useMemo(() => {
    return createPinchZoomHandler({
      getViewport,
      setViewport,
      setCenter, // fallback if setViewport unavailable
      getContainer: () => containerRef.current,
      minZoom: 0.2,
      maxZoom: 2,
      boost: 2.5,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getViewport, setViewport, setCenter]);

  // Attach a native wheel listener to the container so we can prevent browser page zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const nativeWheel = (e: globalThis.WheelEvent) => {
      // Only handle pinch gestures (ctrlKey true) to avoid breaking normal scroll
      if (!('ctrlKey' in e) || !e.ctrlKey) return;

      // prevent browser page zoom
      e.preventDefault();
      e.stopPropagation();

      // forward the DOM event to the handler (no React event types)
      try {
        pinchZoomHandler(e);
      } catch (err) {
        // swallow errors
      }
    };

    el.addEventListener('wheel', nativeWheel as EventListener, { passive: false, capture: true });

    return () => {
      el.removeEventListener('wheel', nativeWheel as EventListener, { capture: true });
    };
  }, [pinchZoomHandler]);

  return (
    <div ref={containerRef} className="relative flex flex-col h-full flex-grow" style={{ touchAction: 'none' }}>
      <ReactFlow
        style={{ width: '100%', height: '100%' }}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        defaultViewport={defaultViewport}
        onConnect={onConnect}
        connectionLineStyle={{ stroke: '#ddd', strokeWidth: 2 }}
        nodesConnectable={false}
        minZoom={0.2}
        maxZoom={2}
      >
        <Panel position="top-center" className="w-[31.25rem]">
          <SearchBar />
        </Panel>
        <Panel position="top-right">
          <div className={'flex space-x-2'}>
            <Button onClick={() => onLayout('LR')}>Reset Layout</Button>
          </div>
        </Panel>

        <Background bgColor="#eeee" />
        <MiniMap pannable={true} zoomable={false} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
