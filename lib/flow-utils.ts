import { CimNode } from "@/lib/store/store-flow";
import { Edge, MarkerType } from "@xyflow/react";
import {
    CIM,
    IdentifiedObject,
    isConductingEquipment,
    isConnectivityNode,
    isTerminal,
    PowerTransformerEnd,
} from "@/lib/cim";
import Dagre from "@dagrejs/dagre";
import { componentRefs } from "@/lib/services/cim-service";
import type { SubstationComponents } from "@/lib/store/model-repository";

export function doesEquipmentExistsInFlow(rdfId: string, nodes: CimNode[]): boolean {
    return nodes.some((node) => node.data.cimData.rdfId === rdfId);
}

export const edgeTemplate = {
    //type: 'cimEdge',
    markerStart: {
        type: MarkerType.ArrowClosed,
        width: 10,
        height: 10,
        color: "#07964a",
    },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 10,
        height: 10,
        color: "#07964a",
    },
    // label: 'T',
    style: {
        strokeWidth: 3,
        stroke: "#07964a",
    },
};

interface NodeInfo {
    id: string;
    data: CIM;
}

interface EdgeInfo {
    sourceId: string;
    targetId: string;
    fromSource: boolean;
}

export function checkNodesForConnections(nodes: CimNode[], component: CIM) {
    const newNodesInfo: NodeInfo[] = [];
    const newEdgesInfo: EdgeInfo[] = [];

    if (isTerminal(component)) {
        if (!doesEquipmentExistsInFlow(component.connectivityNode.rdfId, nodes)) {
            newNodesInfo.push({
                id: component.connectivityNode.rdfId,
                data: component.connectivityNode,
            });
            newEdgesInfo.push({
                sourceId: component.rdfId,
                targetId: component.connectivityNode.rdfId,
                fromSource: true,
            });
        }

        if (!doesEquipmentExistsInFlow(component.conductingEquipment.rdfId, nodes)) {
            newNodesInfo.push({
                id: component.conductingEquipment.rdfId,
                data: component.conductingEquipment,
            });
            newEdgesInfo.push({
                sourceId: component.rdfId,
                targetId: component.conductingEquipment.rdfId,
                fromSource: true,
            });
        }
    }

    if (isConnectivityNode(component) || isConductingEquipment(component)) {
        const rdfId = component.rdfId;
        let terminals = component.terminals || [];
        if (terminals.length == 0 && (component as PowerTransformerEnd).terminal != undefined)
            terminals = [(component as PowerTransformerEnd).terminal];
        terminals.forEach((terminal) => {
            if (!doesEquipmentExistsInFlow(terminal.rdfId, nodes)) {
                newNodesInfo.push({ id: terminal.rdfId, data: terminal });
                newEdgesInfo.push({ sourceId: terminal.rdfId, targetId: rdfId, fromSource: false });
            }
        });
    }

    return { newNodesInfo, newEdgesInfo };
}

export function createConnectingNodes(nodes: CimNode[], component: CIM) {
    const newNodes: CimNode[] = [];
    const newEdges: Edge[] = [];

    const { newNodesInfo, newEdgesInfo } = checkNodesForConnections(nodes, component);

    newNodesInfo.forEach((info) => {
        newNodes.push(createNode(info.id, info.data, 0, 0));
    });

    newEdgesInfo.forEach((info) => {
        newEdges.push(createEdge(info.sourceId, info.targetId, info.fromSource));
    });

    return { newNodes, newEdges };
}

export function createNode(id: string, data: CIM, x: number, y: number, color?: string): CimNode {
    return {
        id: id,
        type: "flowComponent",
        position: { x: x, y: y },
        data: { cimData: { ...data }, otherData: { color: color || "gray", expanded: false } },
    } as CimNode;
}

export function createEdge(
    sourceId: string,
    targetId: string,
    fromSource: boolean,
    sourceHandle?: string,
    targetHandle?: string
): Edge {
    return {
        id: `e${sourceId}-${targetId}`,
        source: fromSource ? sourceId : targetId,
        target: fromSource ? targetId : sourceId,
        sourceHandle: sourceHandle,
        targetHandle: targetHandle,
        ...edgeTemplate,
    } as Edge;
}

export const createNodesAndEdges = (component: CIM): { nodes: CimNode[]; edges: Edge[] } => {
    console.log(component.rdfId, component.rdfType);

    const nodes: CimNode[] = [createNode(component.rdfId, component, 350, 0, "#ff9e9e")];
    const edges: Edge[] = [];

    if (isConductingEquipment(component) && component.terminals?.length) {
        let firstTerminal = true;
        (component.terminals ?? [])
            .sort((a, b) => (a.sequenceNumber ?? 0) - (b.sequenceNumber ?? 0))
            .forEach((terminal) => {
                nodes.push(
                    createNode(terminal.rdfId, terminal, firstTerminal ? 100 : 800, 0, "#c8ff9e")
                );
                edges.push(createEdge(terminal.rdfId, component.rdfId, firstTerminal));
                firstTerminal = false;
            });
    }
    return { nodes: nodes, edges: edges };
};

/*

    The Layout manger

 */

export const getLayoutedElements = (nodes, edges, options) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    // The space between nodes is set by ranksep (vertical) and nodesep (horizontal)
    g.setGraph({ rankdir: options.direction, ranksep: 200, nodesep: 100, ranker: "tight-tree" });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
        g.setNode(node.id, {
            ...node,
            width: node.measured?.width ?? 0,
            height: node.measured?.height ?? 0,
        })
    );

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const position = g.node(node.id);
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            const x = position.x; //- (node.measured?.width ?? 0) / 2;
            const y = position.y; //- (node.measured?.height ?? 0) / 2;
            return { ...node, position: { x, y } };
        }),
        edges,
    };
};

/*
   Check if component is allready in the flow
 */

export type ComponentStatus = {
    exists: boolean;
    connected: boolean;
    equipment: CIM;
};

/**
 * @param equipment The actual CIM component checked
 * @param nodes List of all nodes in the current canvas
 * @param edges List of all edges in the current canvas
 *
 * @returns An array of objects with these three properties:
 * - exists: boolean - if component exists in the flow
 * - connected: boolean - If any edges are connected to the component
 * - equipment: CIM - reference to the "equipment" parameter
 */
export function componentStatus(
    equipment: CIM,
    nodes: CimNode[],
    edges: Edge[]
): ComponentStatus[] {
    const refs = componentRefs(equipment);

    const equipmentInFlow =
        refs.filter((ref) => nodes.find((node) => node.data.cimData.rdfId === ref.rdfId)) || [];

    const idsInFlow = equipmentInFlow.map((ref) => ref.rdfId);

    const missingConnections: string[] = [];

    edges.forEach((edge) => {
        if (edge.source === equipment.rdfId || edge.target === equipment.rdfId) {
            if (idsInFlow.includes(edge.source) || idsInFlow.includes(edge.target)) {
                if (edge.source === equipment.rdfId) missingConnections.push(edge.target);
                else missingConnections.push(edge.source);
            }
        }
    });
    const filteredComponentRefs =
        refs.map((ref) => {
            const exists =
                nodes.find((node) => node.data.cimData.rdfId === ref.rdfId) !== undefined;
            return {
                exists: exists,
                connected: missingConnections.includes(ref.rdfId),
                equipment: ref,
            };
        }) || [];

    return filteredComponentRefs;
}

/*
    Voltage level color palette for visual distinction
 */
const vlColorPalette = [
    "#b3d4fc", // blue
    "#d4b3fc", // purple
    "#b3fcd4", // green
    "#fcd4b3", // orange
    "#fcb3d4", // pink
    "#d4fcb3", // lime
];

const cnColor = "#fff9c4"; // yellow for connectivity nodes
const terminalColor = "#e0e0e0"; // gray for terminals

/**
 * Creates the full node/edge graph for a substation, including all internal
 * equipment, terminals, and connectivity nodes. Stops at the substation boundary
 * (does not follow connections to other substations).
 *
 * After building the flat graph, wraps everything in a substation group node.
 */
export function createSubstationNodesAndEdges(
    data: SubstationComponents,
    direction: "TB" | "LR" = "TB"
): { nodes: CimNode[]; edges: Edge[] } {
    const nodes: CimNode[] = [];
    const edges: Edge[] = [];
    const nodeIds = new Set<string>();
    const internalCNSet = new Set(data.internalCNIds);

    // Map VL names to colors
    const vlNames = data.voltageLevels.map((v) => v.vl.name);
    const vlColorMap: Record<string, string> = {};
    vlNames.forEach((name, i) => {
        vlColorMap[name] = vlColorPalette[i % vlColorPalette.length];
    });

    const addNode = (id: string, cimData: CIM, color: string) => {
        if (nodeIds.has(id)) return;
        nodeIds.add(id);
        nodes.push(createNode(id, cimData, 0, 0, color));
    };

    const addEdge = (sourceId: string, targetId: string, fromSource: boolean) => {
        const edgeId = `e${sourceId}-${targetId}`;
        if (!edges.find((e) => e.id === edgeId)) {
            edges.push(createEdge(sourceId, targetId, fromSource));
        }
    };

    // Process all components (equipment + connectivity nodes)
    for (const component of data.components) {
        const cim = component as CIM;
        const info = data.containerInfo[component.mRID];
        const vlName = info?.vlName || "";
        const baseColor = vlColorMap[vlName] || "#e0e0e0";

        if (cim.rdfType === "cim:ConnectivityNode") {
            // Add CN node
            addNode(cim.rdfId, cim, cnColor);
            continue;
        }

        // Skip terminals as standalone components -- they are created from equipment
        if (cim.rdfType === "cim:Terminal") continue;

        // This is equipment -- add it
        addNode(cim.rdfId, cim, baseColor);

        // Process its terminals
        const terminals: CIM[] = (cim as any).terminals || [];
        const singleTerminal = (cim as any).terminal;
        const terminalList: CIM[] = singleTerminal ? [singleTerminal, ...terminals] : terminals;

        for (const terminal of terminalList) {
            if (!terminal.rdfId) continue;

            // Add terminal node
            addNode(terminal.rdfId, terminal, terminalColor);

            // Edge: equipment <-> terminal
            addEdge(terminal.rdfId, cim.rdfId, false);

            // Connect terminal to its connectivity node (if internal)
            const cn = (terminal as any).connectivityNode;
            if (cn) {
                const cnId = cn.mRID || cn.rdfId;
                if (cnId && internalCNSet.has(cnId)) {
                    // Ensure CN node exists (might already from the components list)
                    addNode(cn.rdfId || cnId, cn, cnColor);
                    // Edge: terminal -> CN
                    addEdge(terminal.rdfId, cn.rdfId || cnId, true);
                }
            }
        }
    }

    // Layout the flat graph with Dagre first
    const layouted = layoutSubstationGraph(nodes, edges, direction);

    // Create the substation group node wrapping all children
    return wrapInSubstationGroup(layouted.nodes, layouted.edges, data.substation as CIM);
}

/**
 * Layout specifically tuned for substation diagrams.
 * TB (top-bottom) approximates a single-line diagram; LR is the standard horizontal layout.
 */
export function layoutSubstationGraph(
    nodes: CimNode[],
    edges: Edge[],
    direction: "TB" | "LR" = "TB"
): { nodes: CimNode[]; edges: Edge[] } {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

    // Tighter spacing for substation diagrams
    const ranksep = direction === "TB" ? 120 : 160;
    const nodesep = direction === "TB" ? 80 : 80;

    g.setGraph({
        rankdir: direction,
        ranksep,
        nodesep,
        ranker: "network-simplex", // better for hierarchical/single-line-like layouts
    });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
        g.setNode(node.id, {
            ...node,
            width: node.measured?.width ?? 180,
            height: node.measured?.height ?? 40,
        })
    );

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const position = g.node(node.id);
            return { ...node, position: { x: position.x, y: position.y } };
        }),
        edges,
    };
}

/**
 * Takes a flat set of layouted nodes and wraps them inside a substation group node.
 * The group node is sized to encompass all children with padding,
 * and child positions are converted to be relative to the group.
 */
function wrapInSubstationGroup(
    nodes: CimNode[],
    edges: Edge[],
    substation: CIM
): { nodes: CimNode[]; edges: Edge[] } {
    if (nodes.length === 0) return { nodes, edges };

    const GROUP_PADDING = 60;
    const LABEL_HEIGHT = 40; // space for the substation label at the top

    // Compute bounding box of all child nodes
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
    for (const node of nodes) {
        const x = node.position.x;
        const y = node.position.y;
        const w = node.measured?.width ?? 180;
        const h = node.measured?.height ?? 40;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
    }

    const groupX = minX - GROUP_PADDING;
    const groupY = minY - GROUP_PADDING - LABEL_HEIGHT;
    const groupW = maxX - minX + GROUP_PADDING * 2;
    const groupH = maxY - minY + GROUP_PADDING * 2 + LABEL_HEIGHT;

    const groupId = `group-${substation.rdfId}`;

    // Create the group node
    const groupNode: CimNode = {
        id: groupId,
        type: "substationGroup",
        position: { x: groupX, y: groupY },
        style: { width: groupW, height: groupH },
        data: {
            cimData: { ...substation },
            otherData: {
                color: undefined,
                expanded: undefined,
                isGroup: true,
                groupType: "substation",
            },
            label: (substation as IdentifiedObject).name || substation.rdfId,
            substationName: (substation as IdentifiedObject).name || "",
            groupType: "substation",
        },
        selectable: true,
        draggable: true,
        zIndex: -1,
    } as CimNode;

    // Convert child positions to be relative to the group
    const adjustedNodes = nodes.map((node) => ({
        ...node,
        position: {
            x: node.position.x - groupX,
            y: node.position.y - groupY,
        },
        parentId: groupId,
        extent: "parent" as const,
    }));

    return {
        nodes: [groupNode, ...adjustedNodes],
        edges,
    };
}
