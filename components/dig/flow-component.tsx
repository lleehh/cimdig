"use client";
import CimComponent from "@/components/dig/cim-component";
import { CIM, IdentifiedObject } from "@/lib/cim";
import {
    createConnectingNodes,
    checkNodesForConnections,
    createNodesAndEdges,
    collapseTerminals,
} from "@/lib/flow-utils";
import { getComponentById } from "@/lib/store/model-repository";
import useFlowStore, { CimNode, selector } from "@/lib/store/store-flow";
import { Handle, NodeProps, Position, useStore } from "@xyflow/react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

const zoomSelector = (s: { transform: number[] }) => s.transform[2] >= 0.6;

export function CollapsedStyling() {
    return "w-44 border border-gray-400 p-3 bg-white";
}

export function colorStyling(color: string) {
    return <div style={{ backgroundColor: color ?? "black", height: "10px" }}> </div>;
}

export function smallComponentStyling() {
    return "w-[135px]";
}

export function mediumComponentStyling() {
    return "w-[180px]";
}

export function largeComponentStyling() {
    return "w-[270px]";
}

export default function FlowComponent({ data }: NodeProps<CimNode>) {
    // The fully loaded component from the database
    const [component, setComponent] = useState<CIM | null>(null);
    const showContent = useStore(zoomSelector);

    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        setFocusNode,
        terminalsHidden,
        fullGraph,
        setFullGraph,
        setTerminalsHidden,
    } = useFlowStore(useShallow(selector));

    const createComponentData = (componentData: IdentifiedObject | null) => {
        if (componentData) {
            // When terminals are hidden, check against the full (uncollapsed) graph
            // so we correctly detect existing terminals/connections
            const checkNodes = terminalsHidden && fullGraph ? fullGraph.nodes : nodes;
            if (checkNodesForConnections(checkNodes, componentData).newNodesInfo.length == 0) {
                data.otherData.expanded = true;
            }
        }
        setComponent(componentData);
    };

    useEffect(() => {
        if (!component) {
            const loadComponent = async () => {
                createComponentData(await getComponentById(data.cimData.rdfId));
            };
            loadComponent();
        }
    }, []);

    const handleExpand = async () => {
        // If this is an outgoing line stub, navigate to the ACLineSegment view
        // instead of expanding in place. This exits the substation view.
        if (data.otherData.isOutgoingLine && data.otherData.lineId) {
            const lineEquipment = await getComponentById(data.otherData.lineId);
            if (lineEquipment) {
                const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(lineEquipment);
                setNodes(newNodes);
                setEdges(newEdges);
                // Clear terminal state since we're leaving the substation view
                setTerminalsHidden(false);
                setFullGraph(null);
            }
            return;
        }

        console.log("Nodes:", nodes);

        // We need to load the full component from the database to get all the properties

        if (terminalsHidden && fullGraph && component) {
            // When terminals are hidden, expand against the full (uncollapsed) graph
            // so that new terminals are added there, then re-collapse for display.
            const fullNode = fullGraph.nodes.find((n) => n.id === component.rdfId);

            if (fullNode) {
                const { newNodes, newEdges } = createConnectingNodes(fullGraph.nodes, component);

                if (newNodes.length > 0) {
                    // Apply colors
                    let colors: string[] = [
                        "#ff9e9e",
                        "#9eadff",
                        "#ea9eff",
                        "#c8ff9e",
                        "#ffe380",
                        "#9effdd",
                    ];
                    newNodes[0].data.otherData.color = data.otherData.color;
                    if (newNodes.length > 1) {
                        newNodes.forEach((element, i) => {
                            element.data.otherData.color = colors[i % colors.length];
                        });
                    }

                    // Update the full graph with the new nodes/edges
                    const updatedFullNodes = [...fullGraph.nodes, ...newNodes];
                    const updatedFullEdges = [...fullGraph.edges, ...newEdges];
                    setFullGraph({ nodes: updatedFullNodes, edges: updatedFullEdges });

                    // Re-collapse terminals and set as the displayed graph
                    const collapsed = collapseTerminals(updatedFullNodes, updatedFullEdges);
                    setNodes(collapsed.nodes);
                    setEdges(collapsed.edges);

                    // Focus on a non-terminal node from the new additions
                    const focusNode = newNodes.find(
                        (n) => n.data?.cimData?.rdfType !== "cim:Terminal"
                    );
                    if (focusNode) {
                        setFocusNode(focusNode.id);
                    } else {
                        // All new nodes are terminals; after collapse they're gone,
                        // so focus on the first CN/equipment bridged through them
                        const terminalIds = new Set(
                            newNodes
                                .filter((n) => n.data?.cimData?.rdfType === "cim:Terminal")
                                .map((n) => n.id)
                        );
                        // Find nodes connected through new terminal edges
                        for (const edge of newEdges) {
                            const otherId = terminalIds.has(edge.source)
                                ? edge.target
                                : edge.source;
                            if (!terminalIds.has(otherId) && otherId !== component.rdfId) {
                                // This is a non-terminal node that's reachable through the new terminals
                                if (collapsed.nodes.find((n) => n.id === otherId)) {
                                    setFocusNode(otherId);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        } else {
            // Normal expansion (terminals visible or no full graph)
            const node = nodes.find((node) => node.id === component?.rdfId);
            const edge = edges.filter(
                (edge) => edge.source === component?.rdfId || edge.target === component?.rdfId
            );

            let colors: string[] = [
                "#ff9e9e",
                "#9eadff",
                "#ea9eff",
                "#c8ff9e",
                "#ffe380",
                "#9effdd",
            ];

            if (node && component) {
                const { newNodes, newEdges } = createConnectingNodes(nodes, component);

                if (newNodes.length > 0) {
                    newNodes[0].data.otherData.color = data.otherData.color;
                    if (newNodes.length > 1) {
                        newNodes.forEach((element, i) => {
                            element.data.otherData.color = colors[i % colors.length];
                        });
                    }

                    setNodes([...nodes, ...newNodes]);
                    setEdges([...edges, ...newEdges]);
                    setFocusNode(newNodes[newNodes.length - 1].id);
                }
            }
        }
        // Will disable expand button in btn-group-component if all nodes connected to current CIM component already exists in flow.
        data.otherData.expanded = true;
    };

    return (
        <div>
            <Handle
                type="target"
                isConnectable={false}
                position={Position.Left}
                className="!w-3 !h-3 !rounded-none !bg-stone-400"
            />
            <Handle
                type="target"
                isConnectable={false}
                position={Position.Left}
                className="!w-3 !h-3 !rounded-none !bg-stone-400"
                id="bottomHandle"
            />
            <div>
                <CimComponent
                    equipment={component || data.cimData}
                    otherData={data.otherData}
                    collapsed={!showContent}
                    handleExpand={handleExpand}
                />
            </div>
            <Handle
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !rounded-none !bg-stone-400"
                id=""
            />
            <Handle
                type="source"
                isConnectable={false}
                position={Position.Right}
                className="!w-3 !h-3 !rounded-none !bg-stone-400"
                id="topHandle"
            />
        </div>
    );
}
