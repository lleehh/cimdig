'use client';
import {
  ReactFlow,
  Viewport, Controls, MiniMap, Background, Panel, NodeTypes, useReactFlow
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import FlowComponent from "@/components/dig/flow-component";
import SearchBar from "@/components/ui/search-bar";
import useFlowStore, { selector } from "@/lib/store/store-flow";
import { useShallow } from "zustand/react/shallow";
import { CIM } from "@/lib/cim";
import { useCallback, useEffect, useRef, useState } from "react";
import { createNodesAndEdges, getLayoutedElements } from "@/lib/flow-utils";

import {
  getBoundingBox,
  computePaddedSize,
  computeFitZoom,
  computeDesiredMinZoom
} from "@/lib/zoom-utils";

const nodeTypes = { flowComponent: FlowComponent } as NodeTypes;
const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 40;
const PADDING = 0.2;

interface DigProps {
  equipment?: CIM | null;
}

export default function Dig({equipment}: DigProps) {
    const {fitView, getNode, setCenter} = useReactFlow();

    const {
        focusNodeId,
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setNodes,
        setEdges,
    } = useFlowStore(
        useShallow(selector),
    );

    useEffect(() => {
        async function updateNodesAndEdges() {
            if (equipment) {
                const {nodes, edges} = await createNodesAndEdges(equipment)
                setNodes(nodes)
                setEdges(edges)
            }
        }
        updateNodesAndEdges()
    }, []);

    useEffect(() => {
        console.log("######FOCUS NODE IS SET TO", focusNodeId)
        if (focusNodeId) {
            focusNodeHandle(focusNodeId)
        }
    }, [focusNodeId]);

    const onLayout = useCallback(
        (direction: string) => {
            const layouted = getLayoutedElements(nodes, edges, {direction});
            setNodes([...layouted.nodes]);
            setEdges([...layouted.edges]);

            window.requestAnimationFrame(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                // fitView({ nodes: [node], duration: 500, padding: 0.2 });
                fitView({duration: 500, padding: 0.2});
            });
        },
        [nodes, edges, setNodes, setEdges, fitView],
    )

    const focusNodeHandle = (nodeId) => {
        const layouted = getLayoutedElements(nodes, edges, {direction: 'LR'});
        setNodes([...layouted.nodes]);
        setEdges([...layouted.edges]);

        const node = layouted.nodes.find(node => node.id === nodeId)
        //const node = getNode(nodeId);
        if (node) {
            //fitView({duration: 500, padding: 0.2});
            setCenter(node.position.x, node.position.y, {
                zoom: 1.0, // Adjust zoom level if needed
                duration: 500, // Smooth transition
            });
        }
    };

    //const defaultViewport: Viewport = {x: 100, y: 300, zoom: 1};
    const defaultViewport: Viewport = {x: 100, y: 300, zoom: 0.8};
    
    useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    const measureAndApply = () => {
      const container = containerRef.current;
      const viewportWidth = container?.clientWidth ?? window.innerWidth;
      const viewportHeight = container?.clientHeight ?? window.innerHeight;

      const bbox = getBoundingBox(nodes, DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT);
      const { paddedWidth, paddedHeight } = computePaddedSize(bbox.width, bbox.height, PADDING);
      const fitZoom = computeFitZoom(viewportWidth, viewportHeight, paddedWidth, paddedHeight);

      const minZoomCandidate = Math.min(fitZoom, 1);
      const finalMinZoom = Number.isFinite(minZoomCandidate)
        ? Math.max(0.0001, minZoomCandidate)
        : 0.05;

      let currentViewportZoom = getViewport().zoom;

      const desiredMinZoom = computeDesiredMinZoom(
        finalMinZoom,
        computedMinZoom,
        currentViewportZoom
      );

      setComputedMinZoom(prev =>
        // Ensure that zooming only happens when the difference between computedMinZoom and the previous value is above 1e-6.
        // This prevents unnecessary zoom adjustments.
        Math.abs(prev - desiredMinZoom) > 1e-6 ? desiredMinZoom : prev // Checks if there was a large enough change
      );

      if (!hasAutoFitRunRef.current) {
        hasAutoFitRunRef.current = true;
        window.requestAnimationFrame(() => {
          fitView({ padding: PADDING, duration: 300 }); 
        });
      }
    };

    measureAndApply();

    let ro: ResizeObserver | null = null;
    try {
      if (containerRef.current && 'ResizeObserver' in window) {
        ro = new ResizeObserver(measureAndApply);
        ro.observe(containerRef.current);
      } else {
        window.addEventListener('resize', measureAndApply);
      }
    } catch {
      window.addEventListener('resize', measureAndApply);
    }

    return () => {
      if (ro && containerRef.current) {
        ro.unobserve(containerRef.current);
        ro.disconnect();
      } else {
        window.removeEventListener('resize', measureAndApply);
      }
    };
  }, [nodes, computedMinZoom]);

    return (
        <div className="relative flex flex-col h-full flex-grow">
            <ReactFlow style={{width: '100%', height: '100%'}}
                       nodes={nodes}
                       edges={edges}
                       nodeTypes={nodeTypes}
                       onNodesChange={onNodesChange}
                       onEdgesChange={onEdgesChange}
                       defaultViewport={defaultViewport}
                       onConnect={onConnect}
                       connectionLineStyle={{stroke: '#ddd', strokeWidth: 2}}
                       nodesConnectable={false}
                       minZoom={0.2}
                       maxZoom={2}
            >
                <Panel position="top-center" className="w-[31.25rem]">
                    <SearchBar />
                </Panel>
                <Panel position="top-right">
                    <div
                        className={'flex space-x-2'}>
                        <Button onClick={() => onLayout('LR')}>Reset Layout</Button>
                    </div>
                </Panel>
                <Background bgColor="#eeee"/>
                <MiniMap pannable={true} zoomable={false}/>
                <Controls/>
            </ReactFlow>
        </div>
    )
}