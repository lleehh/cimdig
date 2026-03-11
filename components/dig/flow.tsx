"use client";
import {
    ReactFlow,
    Viewport,
    Controls,
    MiniMap,
    Background,
    Panel,
    NodeTypes,
    useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import FlowComponent from "@/components/dig/flow-component";
import SubstationGroupNode from "@/components/dig/substation-group-node";
import SearchBar from "@/components/ui/search-bar";
import useFlowStore, { selector } from "@/lib/store/store-flow";
import { useShallow } from "zustand/react/shallow";
import { CIM } from "@/lib/cim";
import { useCallback, useEffect, useRef, useState } from "react";
import { createNodesAndEdges, getLayoutedElements, layoutSubstationGraph } from "@/lib/flow-utils";

import {
    getBoundingBox,
    computePaddedSize,
    computeFitZoom,
    computeDesiredMinZoom,
} from "@/lib/zoom-utils";

const nodeTypes = {
    flowComponent: FlowComponent,
    substationGroup: SubstationGroupNode,
} as NodeTypes;
const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 40;
const PADDING = 0.2;

interface DigProps {
    equipment?: CIM | null;
}

export default function Dig({ equipment }: DigProps) {
    const { fitView, setCenter, getViewport } = useReactFlow();

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

    const containerRef = useRef<HTMLDivElement | null>(null);
    const hasAutoFitRunRef = useRef<boolean>(false);
    const [computedMinZoom, setComputedMinZoom] = useState<number>(0.05);
    const [layoutDirection, setLayoutDirection] = useState<"LR" | "TB">("LR");

    useEffect(() => {
        if (equipment) {
            const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(equipment);
            setNodes(newNodes);
            setEdges(newEdges);
        }
    }, [equipment]);

    useEffect(() => {
        if (focusNodeId) {
            focusNodeHandle(focusNodeId);
        }
    }, [focusNodeId]);

    /** Check if the current graph is a substation (has a group node) */
    const hasSubstationGroup = nodes.some((n) => n.type === "substationGroup");

    const onLayout = useCallback(
        (direction: "LR" | "TB") => {
            setLayoutDirection(direction);

            if (hasSubstationGroup) {
                // For substation graphs: re-layout only the child nodes,
                // then recompute the group bounding box
                const groupNode = nodes.find((n) => n.type === "substationGroup");
                const childNodes = nodes.filter((n) => n.type !== "substationGroup");

                // Convert child positions back to absolute for re-layout
                const absoluteChildren = childNodes.map((n) => ({
                    ...n,
                    position: groupNode
                        ? {
                              x: n.position.x + (groupNode.position?.x ?? 0),
                              y: n.position.y + (groupNode.position?.y ?? 0),
                          }
                        : n.position,
                    parentId: undefined,
                    extent: undefined,
                }));

                const layouted = layoutSubstationGraph(absoluteChildren, edges, direction);

                // Recompute group bounding box
                const GROUP_PADDING = 60;
                const LABEL_HEIGHT = 40;
                let minX = Infinity,
                    minY = Infinity,
                    maxX = -Infinity,
                    maxY = -Infinity;
                for (const node of layouted.nodes) {
                    const x = node.position.x;
                    const y = node.position.y;
                    const w = node.measured?.width ?? 180;
                    const h = node.measured?.height ?? 40;
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x + w);
                    maxY = Math.max(maxY, y + h);
                }

                if (groupNode && isFinite(minX)) {
                    const gx = minX - GROUP_PADDING;
                    const gy = minY - GROUP_PADDING - LABEL_HEIGHT;
                    const gw = maxX - minX + GROUP_PADDING * 2;
                    const gh = maxY - minY + GROUP_PADDING * 2 + LABEL_HEIGHT;

                    const updatedGroup = {
                        ...groupNode,
                        position: { x: gx, y: gy },
                        style: { ...groupNode.style, width: gw, height: gh },
                    };

                    const adjustedChildren = layouted.nodes.map((n) => ({
                        ...n,
                        position: {
                            x: n.position.x - gx,
                            y: n.position.y - gy,
                        },
                        parentId: groupNode.id,
                        extent: "parent" as const,
                    }));

                    setNodes([updatedGroup, ...adjustedChildren]);
                    setEdges([...layouted.edges]);
                }
            } else {
                const layouted = getLayoutedElements(nodes, edges, { direction });
                setNodes([...layouted.nodes]);
                setEdges([...layouted.edges]);
            }

            window.requestAnimationFrame(() => {
                fitView({ duration: 500, padding: 0.2 });
            });
        },
        [nodes, edges, hasSubstationGroup]
    );

    const focusNodeHandle = (nodeId: string) => {
        const layouted = getLayoutedElements(
            nodes.filter((n) => n.type !== "substationGroup"),
            edges,
            { direction: layoutDirection }
        );
        setNodes([...layouted.nodes]);
        setEdges([...layouted.edges]);

        const node = layouted.nodes.find((node) => node.id === nodeId);
        if (node) {
            setCenter(node.position.x, node.position.y, {
                zoom: 1.0,
                duration: 500,
            });
        }
    };

    useEffect(() => {
        if (!nodes || nodes.length === 0) return;

        const measureAndApply = () => {
            const container = containerRef.current;
            const viewportWidth = container?.clientWidth ?? window.innerWidth;
            const viewportHeight = container?.clientHeight ?? window.innerHeight;

            const bbox = getBoundingBox(nodes, DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT);
            const { paddedWidth, paddedHeight } = computePaddedSize(
                bbox.width,
                bbox.height,
                PADDING
            );
            const fitZoom = computeFitZoom(
                viewportWidth,
                viewportHeight,
                paddedWidth,
                paddedHeight
            );

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

            setComputedMinZoom((prev) =>
                Math.abs(prev - desiredMinZoom) > 1e-6 ? desiredMinZoom : prev
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
            if (containerRef.current && "ResizeObserver" in window) {
                ro = new ResizeObserver(measureAndApply);
                ro.observe(containerRef.current);
            } else {
                window.addEventListener("resize", measureAndApply);
            }
        } catch {
            window.addEventListener("resize", measureAndApply);
        }

        return () => {
            if (ro && containerRef.current) {
                ro.unobserve(containerRef.current);
                ro.disconnect();
            } else {
                window.removeEventListener("resize", measureAndApply);
            }
        };
    }, [nodes, computedMinZoom]);

    return (
        <div ref={containerRef} className="relative flex flex-col h-full flex-grow">
            <ReactFlow
                style={{ width: "100%", height: "100%" }}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodesConnectable={false}
                nodes={nodes}
                edges={edges}
                fitView
                fitViewOptions={{ padding: PADDING }}
                minZoom={computedMinZoom}
                maxZoom={2}
            >
                <Panel position="top-center" className="w-[40rem]">
                    <SearchBar />
                </Panel>

                <Panel position="top-right">
                    <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                            <Button
                                variant={layoutDirection === "LR" ? "default" : "outline"}
                                onClick={() => onLayout("LR")}
                                size="sm"
                            >
                                Horizontal
                            </Button>
                            <Button
                                variant={layoutDirection === "TB" ? "default" : "outline"}
                                onClick={() => onLayout("TB")}
                                size="sm"
                                title="Single-line diagram style (top to bottom)"
                            >
                                Single-Line
                            </Button>
                        </div>
                    </div>
                </Panel>

                <Background bgColor="#eeee" />
                <MiniMap pannable zoomable={false} />
                <Controls />
            </ReactFlow>
        </div>
    );
}
