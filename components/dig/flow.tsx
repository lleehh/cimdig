"use client";
import {
    ReactFlow,
    Viewport,
    Controls,
    MiniMap,
    Background,
    Panel,
    NodeTypes,
    Edge,
    useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import FlowComponent from "@/components/dig/flow-component";
import SubstationGroupNode from "@/components/dig/substation-group-node";
import SearchBar from "@/components/ui/search-bar";
import useFlowStore, { CimNode, selector } from "@/lib/store/store-flow";
import { useShallow } from "zustand/react/shallow";
import { CIM } from "@/lib/cim";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    createNodesAndEdges,
    getLayoutedElements,
    layoutSubstationGraph,
    relayoutWithElk,
    collapseTerminals,
    LayoutEngine,
} from "@/lib/flow-utils";

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
        terminalsHidden,
        fullGraph,
        setTerminalsHidden,
        setFullGraph,
    } = useFlowStore(useShallow(selector));

    const containerRef = useRef<HTMLDivElement | null>(null);
    const hasAutoFitRunRef = useRef<boolean>(false);
    const [computedMinZoom, setComputedMinZoom] = useState<number>(0.05);
    const [layoutDirection, setLayoutDirection] = useState<"LR" | "TB">("LR");
    const [layoutEngine, setLayoutEngine] = useState<LayoutEngine>("dagre");

    useEffect(() => {
        if (equipment) {
            const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(equipment);
            setNodes(newNodes);
            setEdges(newEdges);
            // Reset view options when a new component is loaded
            setTerminalsHidden(false);
            setFullGraph(null);
        }
    }, [equipment]);

    useEffect(() => {
        if (focusNodeId) {
            focusNodeHandle(focusNodeId);
        }
    }, [focusNodeId]);

    /** Check if the current graph is a substation (has a group node) */
    const hasSubstationGroup = nodes.some((n) => n.type === "substationGroup");
    /** Check if any terminal nodes exist in the graph */
    const hasTerminals =
        terminalsHidden || nodes.some((n) => n.data?.cimData?.rdfType === "cim:Terminal");
    const substationGroupId = nodes.find(
        (n) => n.type === "substationGroup" && n.data?.groupType === "substation"
    )?.id;
    const prevSubstationIdRef = useRef<string | undefined>(undefined);

    // Reset terminal visibility when a different substation is loaded
    useEffect(() => {
        if (substationGroupId !== prevSubstationIdRef.current) {
            prevSubstationIdRef.current = substationGroupId;
            setTerminalsHidden(false);
            setFullGraph(null);
        }
    }, [substationGroupId]);

    const onLayout = useCallback(
        async (direction: "LR" | "TB", engine?: LayoutEngine) => {
            const activeEngine = engine ?? layoutEngine;
            setLayoutDirection(direction);
            if (engine) setLayoutEngine(engine);

            // When terminals are hidden, operate on the stored full graph
            const workingNodes = terminalsHidden && fullGraph ? fullGraph.nodes : nodes;
            const workingEdges = terminalsHidden && fullGraph ? fullGraph.edges : edges;

            // Check substation group in the working set (full graph always has it if visible does)
            const workingHasSubstationGroup = workingNodes.some(
                (n) => n.type === "substationGroup"
            );

            let resultNodes: CimNode[] = [];
            let resultEdges: Edge[] = [];

            if (workingHasSubstationGroup && activeEngine === "elk") {
                // Use ELK for hierarchical re-layout
                const result = await relayoutWithElk(workingNodes, workingEdges, direction);
                resultNodes = result.nodes;
                resultEdges = result.edges;
            } else if (workingHasSubstationGroup) {
                // For substation graphs with nested VL groups:
                // 1. Extract leaf nodes (not group nodes)
                // 2. Convert their positions back to absolute
                // 3. Re-layout with Dagre
                // 4. Recompute VL group bounding boxes, then substation group bounding box
                const substationGroup = workingNodes.find(
                    (n) => n.type === "substationGroup" && n.data?.groupType === "substation"
                );
                const vlGroups = workingNodes.filter(
                    (n) => n.type === "substationGroup" && n.data?.groupType === "voltageLevel"
                );
                const leafNodes = workingNodes.filter((n) => n.type !== "substationGroup");

                // Convert leaf node positions back to absolute
                const absoluteLeaves = leafNodes.map((n) => {
                    let absX = n.position.x;
                    let absY = n.position.y;

                    // If this leaf is in a VL group, add VL group position
                    const vlParent = vlGroups.find((vl) => vl.id === n.parentId);
                    if (vlParent && substationGroup) {
                        absX += vlParent.position.x + substationGroup.position.x;
                        absY += vlParent.position.y + substationGroup.position.y;
                    } else if (substationGroup && n.parentId === substationGroup.id) {
                        absX += substationGroup.position.x;
                        absY += substationGroup.position.y;
                    }

                    return {
                        ...n,
                        position: { x: absX, y: absY },
                        parentId: undefined,
                        extent: undefined,
                    };
                });

                const layouted = layoutSubstationGraph(absoluteLeaves, workingEdges, direction);

                // Build VL membership map from original parentId relationships
                const nodeVlMap: Record<string, string> = {};
                for (const leaf of leafNodes) {
                    const vlParent = vlGroups.find((vl) => vl.id === leaf.parentId);
                    if (vlParent) {
                        nodeVlMap[leaf.id] = vlParent.id;
                    }
                }

                // Recompute VL group bounding boxes
                const VL_PADDING = 30;
                const VL_LABEL_HEIGHT = 30;
                const GROUP_PADDING = 60;
                const LABEL_HEIGHT = 40;

                const updatedVlGroups: typeof vlGroups = [];
                const vlChildMap: Record<string, typeof layouted.nodes> = {};
                const noVlLeaves: typeof layouted.nodes = [];

                for (const node of layouted.nodes) {
                    const vlGroupId = nodeVlMap[node.id];
                    if (vlGroupId) {
                        if (!vlChildMap[vlGroupId]) vlChildMap[vlGroupId] = [];
                        vlChildMap[vlGroupId].push(node);
                    } else {
                        noVlLeaves.push(node);
                    }
                }

                const dagreResultNodes: CimNode[] = [];

                for (const vlg of vlGroups) {
                    const children = vlChildMap[vlg.id] || [];
                    if (children.length === 0) continue;

                    let minX = Infinity,
                        minY = Infinity,
                        maxX = -Infinity,
                        maxY = -Infinity;
                    for (const c of children) {
                        minX = Math.min(minX, c.position.x);
                        minY = Math.min(minY, c.position.y);
                        maxX = Math.max(maxX, c.position.x + (c.measured?.width ?? 180));
                        maxY = Math.max(maxY, c.position.y + (c.measured?.height ?? 40));
                    }

                    const vlGx = minX - VL_PADDING;
                    const vlGy = minY - VL_PADDING - VL_LABEL_HEIGHT;
                    const vlGw = maxX - minX + VL_PADDING * 2;
                    const vlGh = maxY - minY + VL_PADDING * 2 + VL_LABEL_HEIGHT;

                    updatedVlGroups.push({
                        ...vlg,
                        position: { x: vlGx, y: vlGy },
                        style: { ...vlg.style, width: vlGw, height: vlGh },
                    });

                    for (const c of children) {
                        dagreResultNodes.push({
                            ...c,
                            position: { x: c.position.x - vlGx, y: c.position.y - vlGy },
                            parentId: vlg.id,
                            extent: "parent" as const,
                        });
                    }
                }

                // Compute substation group bounding box from VL groups + unparented leaves
                const topLevel = [...updatedVlGroups, ...noVlLeaves];
                let minX = Infinity,
                    minY = Infinity,
                    maxX = -Infinity,
                    maxY = -Infinity;
                for (const t of topLevel) {
                    const w = (t.style as any)?.width ?? t.measured?.width ?? 180;
                    const h = (t.style as any)?.height ?? t.measured?.height ?? 40;
                    minX = Math.min(minX, t.position.x);
                    minY = Math.min(minY, t.position.y);
                    maxX = Math.max(maxX, t.position.x + w);
                    maxY = Math.max(maxY, t.position.y + h);
                }

                if (substationGroup && isFinite(minX)) {
                    const gx = minX - GROUP_PADDING;
                    const gy = minY - GROUP_PADDING - LABEL_HEIGHT;
                    const gw = maxX - minX + GROUP_PADDING * 2;
                    const gh = maxY - minY + GROUP_PADDING * 2 + LABEL_HEIGHT;

                    const updatedGroup = {
                        ...substationGroup,
                        position: { x: gx, y: gy },
                        style: { ...substationGroup.style, width: gw, height: gh },
                    };

                    const adjustedVlGroups = updatedVlGroups.map((vlg) => ({
                        ...vlg,
                        position: { x: vlg.position.x - gx, y: vlg.position.y - gy },
                        parentId: updatedGroup.id,
                        extent: "parent" as const,
                    }));

                    const adjustedNoVlLeaves = noVlLeaves.map((n) => ({
                        ...n,
                        position: { x: n.position.x - gx, y: n.position.y - gy },
                        parentId: updatedGroup.id,
                        extent: "parent" as const,
                    }));

                    resultNodes = [
                        updatedGroup,
                        ...adjustedVlGroups,
                        ...dagreResultNodes,
                        ...adjustedNoVlLeaves,
                    ];
                    resultEdges = [...layouted.edges];
                }
            } else {
                const layouted = getLayoutedElements(workingNodes, workingEdges, { direction });
                resultNodes = [...layouted.nodes];
                resultEdges = [...layouted.edges];
            }

            // Apply results: if terminals are hidden, save the full graph and collapse
            if (terminalsHidden && resultNodes.length > 0) {
                setFullGraph({ nodes: resultNodes, edges: resultEdges });
                const collapsed = collapseTerminals(resultNodes, resultEdges);
                setNodes(collapsed.nodes);
                setEdges(collapsed.edges);
            } else if (resultNodes.length > 0) {
                setNodes(resultNodes);
                setEdges(resultEdges);
            }

            window.requestAnimationFrame(() => {
                fitView({ duration: 500, padding: 0.2 });
            });
        },
        [nodes, edges, hasSubstationGroup, terminalsHidden, layoutEngine]
    );

    const onToggleTerminals = useCallback(() => {
        if (!terminalsHidden) {
            // Hiding terminals: save current full graph, then collapse
            setFullGraph({ nodes: [...nodes], edges: [...edges] });
            const collapsed = collapseTerminals(nodes, edges);
            setNodes(collapsed.nodes);
            setEdges(collapsed.edges);
            setTerminalsHidden(true);
        } else {
            // Showing terminals: restore from saved full graph
            if (fullGraph) {
                setNodes(fullGraph.nodes);
                setEdges(fullGraph.edges);
                setFullGraph(null);
            }
            setTerminalsHidden(false);
        }

        window.requestAnimationFrame(() => {
            fitView({ duration: 500, padding: 0.2 });
        });
    }, [nodes, edges, terminalsHidden, setNodes, setEdges, fitView]);

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
                        {hasSubstationGroup && (
                            <div className="flex space-x-2">
                                <Button
                                    variant={layoutEngine === "dagre" ? "default" : "outline"}
                                    onClick={() => onLayout(layoutDirection, "dagre")}
                                    size="sm"
                                    title="Dagre layout engine"
                                >
                                    Dagre
                                </Button>
                                <Button
                                    variant={layoutEngine === "elk" ? "default" : "outline"}
                                    onClick={() => onLayout(layoutDirection, "elk")}
                                    size="sm"
                                    title="ELK layout engine (better for hierarchical diagrams)"
                                >
                                    ELK
                                </Button>
                            </div>
                        )}
                        {hasTerminals && (
                            <Button
                                variant={terminalsHidden ? "default" : "outline"}
                                onClick={onToggleTerminals}
                                size="sm"
                                title={
                                    terminalsHidden
                                        ? "Show terminal nodes"
                                        : "Hide terminals and connect equipment directly to connectivity nodes"
                                }
                            >
                                {terminalsHidden ? "Show Terminals" : "Hide Terminals"}
                            </Button>
                        )}
                    </div>
                </Panel>

                <Background bgColor="#eeee" />
                <MiniMap pannable zoomable={false} />
                <Controls />
            </ReactFlow>
        </div>
    );
}
