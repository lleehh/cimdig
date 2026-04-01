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
import ELK, { type ElkNode, type ElkExtendedEdge } from "elkjs/lib/elk.bundled";
import { componentRefs } from "@/lib/services/cim-service";
import type { SubstationComponents } from "@/lib/store/model-repository";
import { sldLayoutSubstationGraph } from "@/lib/sld-layout";

export type LayoutEngine = "dagre" | "elk" | "sld";

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
const externalStubColor = "#ffcdd2"; // light red for external connection stubs
const outgoingLineColor = "#ffcc80"; // orange for outgoing line stubs

/**
 * Collapses terminal nodes from the graph, bridging edges so that
 * equipment connects directly to connectivity nodes / stubs.
 *
 * Original: Equipment -> Terminal -> CN/Stub
 * Collapsed: Equipment -> CN/Stub
 *
 * Group nodes (substationGroup) are preserved as-is. Only leaf-level
 * terminal nodes (rdfType === "cim:Terminal") are removed.
 */
export function collapseTerminals(
    nodes: CimNode[],
    edges: Edge[]
): { nodes: CimNode[]; edges: Edge[] } {
    // Identify terminal node IDs
    const terminalIds = new Set<string>();
    for (const node of nodes) {
        if (node.data?.cimData?.rdfType === "cim:Terminal") {
            terminalIds.add(node.id);
        }
    }

    if (terminalIds.size === 0) return { nodes, edges };

    // For each terminal, find what it connects:
    //   - one edge to equipment (terminal is target, equipment is source)
    //   - one edge to CN/stub (terminal is source, CN/stub is target)
    // Then create a direct edge from equipment to CN/stub.

    // Build adjacency from terminal perspective
    const terminalToEquipment: Record<string, string> = {};
    const terminalToCN: Record<string, string> = {};

    for (const edge of edges) {
        if (terminalIds.has(edge.target) && !terminalIds.has(edge.source)) {
            // Equipment -> Terminal
            terminalToEquipment[edge.target] = edge.source;
        }
        if (terminalIds.has(edge.source) && !terminalIds.has(edge.target)) {
            // Terminal -> CN/Stub
            terminalToCN[edge.source] = edge.target;
        }
    }

    // Build bridged edges: Equipment -> CN/Stub
    const bridgedEdges: Edge[] = [];
    const seenBridgeIds = new Set<string>();

    // Build edge lookup for preserving edge properties (e.g. type: "smoothstep")
    const edgeByKey: Record<string, Edge> = {};
    for (const edge of edges) {
        edgeByKey[`${edge.source}->${edge.target}`] = edge;
    }

    for (const termId of terminalIds) {
        const eqId = terminalToEquipment[termId];
        const cnId = terminalToCN[termId];
        if (eqId && cnId) {
            const bridgeId = `e${eqId}-${cnId}`;
            if (!seenBridgeIds.has(bridgeId)) {
                seenBridgeIds.add(bridgeId);
                // Inherit edge type and handle assignments from the original edges being bridged
                const eqToTermEdge = edgeByKey[`${eqId}->${termId}`];
                const termToCnEdge = edgeByKey[`${termId}->${cnId}`];
                const origEdge = eqToTermEdge ?? termToCnEdge;
                bridgedEdges.push({
                    id: bridgeId,
                    source: eqId,
                    target: cnId,
                    ...edgeTemplate,
                    ...(origEdge?.type ? { type: origEdge.type } : {}),
                    // Preserve source handle from eq→term edge, target handle from term→cn edge
                    ...(eqToTermEdge?.sourceHandle
                        ? { sourceHandle: eqToTermEdge.sourceHandle }
                        : {}),
                    ...(termToCnEdge?.targetHandle
                        ? { targetHandle: termToCnEdge.targetHandle }
                        : {}),
                } as Edge);
            }
        }
    }

    // Keep non-terminal edges that don't involve terminals
    const keptEdges = edges.filter((e) => !terminalIds.has(e.source) && !terminalIds.has(e.target));

    // Remove terminal nodes
    const keptNodes = nodes.filter((n) => !terminalIds.has(n.id));

    return {
        nodes: keptNodes,
        edges: [...keptEdges, ...bridgedEdges],
    };
}

/**
 * Creates the full node/edge graph for a substation, including all internal
 * equipment, terminals, and connectivity nodes. Stops at the substation boundary
 * (does not follow connections to other substations).
 *
 * After building the flat graph, wraps everything in a substation group node
 * with nested VoltageLevel sub-groups.
 */
export async function createSubstationNodesAndEdges(
    data: SubstationComponents,
    direction: "TB" | "LR" = "TB",
    engine: LayoutEngine = "sld",
    showTerminals: boolean = true
): Promise<{ nodes: CimNode[]; edges: Edge[] }> {
    const nodes: CimNode[] = [];
    const edges: Edge[] = [];
    const nodeIds = new Set<string>();
    const internalCNSet = new Set(data.internalCNIds);

    // Track which rdfId belongs to which VL (by vlId)
    // We need to map rdfId -> vlId for graph nodes (which use rdfId as key)
    const rdfIdToVlId: Record<string, string> = {};

    // Build mRID -> rdfId reverse lookup and vlMembership by rdfId
    const mridToRdfId: Record<string, string> = {};
    for (const component of data.components) {
        mridToRdfId[component.mRID] = (component as CIM).rdfId;
    }
    for (const [vlId, mridList] of Object.entries(data.vlMembership)) {
        for (const mrid of mridList) {
            const rdfId = mridToRdfId[mrid];
            if (rdfId) rdfIdToVlId[rdfId] = vlId;
        }
    }

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

    // Track terminals that connect to external CNs (these will be connected
    // to outgoing line nodes instead of stub nodes)
    const externalTerminalCNs: { terminalId: string; cnMRID: string }[] = [];

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
            // Terminal inherits VL from its equipment
            if (rdfIdToVlId[cim.rdfId]) {
                rdfIdToVlId[terminal.rdfId] = rdfIdToVlId[cim.rdfId];
            }

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
                } else if (cnId) {
                    // External connection — record for later (no stub; outgoing lines handle this)
                    externalTerminalCNs.push({
                        terminalId: terminal.rdfId,
                        cnMRID: cnId,
                    });
                }
            }
        }
    }

    // Create outgoing line stubs from the discovered outgoing lines.
    // Each stub represents an ACLineSegment leaving the station, shown as a
    // lightweight node connected to the internal CN. Clicking the stub navigates
    // to the ACLineSegment view (handled by FlowComponent).
    // Build a lookup: internalCNId -> list of outgoing lines
    const cnToOutgoingLines: Record<string, typeof data.outgoingLines> = {};
    for (const ol of data.outgoingLines) {
        if (!cnToOutgoingLines[ol.internalCNId]) cnToOutgoingLines[ol.internalCNId] = [];
        cnToOutgoingLines[ol.internalCNId].push(ol);
    }

    for (const ol of data.outgoingLines) {
        const lineMRID = (ol.line as IdentifiedObject).mRID || ol.line.rdfId;
        const lineName = (ol.line as IdentifiedObject).name || ol.line.rdfId;
        const destLabel = ol.destinationSubstationName
            ? `${lineName} → ${ol.destinationSubstationName}`
            : lineName;

        const stubId = `line-stub-${lineMRID}`;
        if (nodeIds.has(stubId)) continue;
        nodeIds.add(stubId);

        const stubNode: CimNode = {
            id: stubId,
            type: "flowComponent",
            position: { x: 0, y: 0 },
            data: {
                cimData: {
                    rdfId: stubId,
                    rdfType: "cim:ACLineSegment",
                    name: destLabel,
                } as CIM,
                otherData: {
                    color: outgoingLineColor,
                    expanded: false,
                    isOutgoingLine: true,
                    lineId: lineMRID,
                    destinationSubstation: ol.destinationSubstationName,
                },
            },
        } as CimNode;
        nodes.push(stubNode);

        // Inherit VL from the internal CN for layout grouping
        if (ol.vlId) {
            rdfIdToVlId[stubId] = ol.vlId;
        }

        // Connect stub to the internal CN
        const internalCNNode = nodes.find(
            (n) => n.data?.cimData?.mRID === ol.internalCNId || n.id === ol.internalCNId
        );
        if (internalCNNode) {
            addEdge(stubId, internalCNNode.id, false);
        }
    }

    // For external terminals that don't have a corresponding outgoing line,
    // create a minimal stub so the graph stays connected.
    const outgoingLineCNs = new Set(data.outgoingLines.map((ol) => ol.internalCNId));
    for (const ext of externalTerminalCNs) {
        // If an outgoing line already covers the CN this terminal connects to,
        // the terminal is already wired to the CN via equipment edges — skip.
        if (outgoingLineCNs.has(ext.cnMRID)) continue;

        // Fallback: create a lightweight stub for truly unresolved external connections
        const stubId = `stub-${ext.terminalId}`;
        if (nodeIds.has(stubId)) continue;
        nodeIds.add(stubId);

        const stubNode: CimNode = {
            id: stubId,
            type: "flowComponent",
            position: { x: 0, y: 0 },
            data: {
                cimData: {
                    rdfId: stubId,
                    rdfType: "cim:ExternalConnection",
                    name: "External",
                } as CIM,
                otherData: {
                    color: externalStubColor,
                    expanded: false,
                    isExternalStub: true,
                },
            },
        } as CimNode;
        nodes.push(stubNode);
        addEdge(ext.terminalId, stubId, true);
    }

    if (engine === "sld") {
        // SLD handles its own hierarchical layout with busbar-oriented placement.
        // It also handles terminal collapsing internally when showTerminals=false.
        return sldLayoutSubstationGraph(
            nodes,
            edges,
            data.substation as CIM,
            data.voltageLevels,
            rdfIdToVlId,
            data,
            showTerminals
        );
    }

    if (engine === "elk") {
        // ELK handles hierarchical layout natively
        return elkLayoutSubstationGraph(
            nodes,
            edges,
            data.substation as CIM,
            data.voltageLevels,
            rdfIdToVlId,
            direction
        );
    }

    // Layout the flat graph with Dagre first
    const layouted = layoutSubstationGraph(nodes, edges, direction);

    // Create the substation group node wrapping all children, with VL sub-groups
    return wrapInSubstationGroup(
        layouted.nodes,
        layouted.edges,
        data.substation as CIM,
        data.voltageLevels,
        rdfIdToVlId
    );
}

/**
 * Re-layout an existing substation graph using ELK.
 * Extracts the hierarchy from existing parentId relationships,
 * rebuilds the ELK graph model, and returns updated nodes.
 */
export async function relayoutWithElk(
    nodes: CimNode[],
    edges: Edge[],
    direction: "TB" | "LR"
): Promise<{ nodes: CimNode[]; edges: Edge[] }> {
    const elk = new ELK();

    const GROUP_PADDING = 60;
    const LABEL_HEIGHT = 40;
    const VL_PADDING = 30;
    const VL_LABEL_HEIGHT = 30;
    const NODE_WIDTH = 180;
    const NODE_HEIGHT = 40;

    const substationGroup = nodes.find(
        (n) => n.type === "substationGroup" && n.data?.groupType === "substation"
    );
    const vlGroups = nodes.filter(
        (n) => n.type === "substationGroup" && n.data?.groupType === "voltageLevel"
    );
    const leafNodes = nodes.filter((n) => n.type !== "substationGroup");

    if (!substationGroup) {
        // Fallback to dagre if no substation group
        return layoutSubstationGraph(leafNodes, edges, direction);
    }

    // Build VL membership from parentId
    const vlGroupIds = new Set(vlGroups.map((v) => v.id));
    const nodeToVlGroup: Record<string, string> = {};
    for (const leaf of leafNodes) {
        if (leaf.parentId && vlGroupIds.has(leaf.parentId)) {
            nodeToVlGroup[leaf.id] = leaf.parentId;
        }
    }

    // Build ELK VL children
    const vlElkChildren: ElkNode[] = [];
    for (const vlg of vlGroups) {
        const vlChildren = leafNodes.filter((n) => n.parentId === vlg.id);

        // Internal VL edges
        const vlNodeIdSet = new Set(vlChildren.map((n) => n.id));
        const vlEdges: ElkExtendedEdge[] = [];
        for (const edge of edges) {
            if (vlNodeIdSet.has(edge.source) && vlNodeIdSet.has(edge.target)) {
                vlEdges.push({
                    id: edge.id,
                    sources: [edge.source],
                    targets: [edge.target],
                });
            }
        }

        vlElkChildren.push({
            id: vlg.id,
            layoutOptions: {
                "elk.algorithm": "layered",
                "elk.direction": direction === "TB" ? "DOWN" : "RIGHT",
                "elk.spacing.nodeNode": "60",
                "elk.layered.spacing.nodeNodeBetweenLayers": direction === "TB" ? "100" : "120",
                "elk.padding": `[top=${VL_LABEL_HEIGHT + VL_PADDING},left=${VL_PADDING},bottom=${VL_PADDING},right=${VL_PADDING}]`,
                "elk.hierarchyHandling": "INCLUDE_CHILDREN",
            },
            children: vlChildren.map((n) => ({
                id: n.id,
                width: n.measured?.width ?? NODE_WIDTH,
                height: n.measured?.height ?? NODE_HEIGHT,
            })),
            edges: vlEdges,
        });
    }

    // Unparented leaf nodes
    const noVlLeaves = leafNodes.filter((n) => n.parentId === substationGroup.id);
    const noVlElkNodes: ElkNode[] = noVlLeaves.map((n) => ({
        id: n.id,
        width: n.measured?.width ?? NODE_WIDTH,
        height: n.measured?.height ?? NODE_HEIGHT,
    }));

    // Cross-group edges
    const crossEdges: ElkExtendedEdge[] = [];
    for (const edge of edges) {
        const srcVl = nodeToVlGroup[edge.source];
        const tgtVl = nodeToVlGroup[edge.target];
        if (srcVl && tgtVl && srcVl === tgtVl) continue;
        crossEdges.push({
            id: edge.id,
            sources: [srcVl || edge.source],
            targets: [tgtVl || edge.target],
        });
    }

    const elkGraph: ElkNode = {
        id: "root",
        layoutOptions: {
            "elk.algorithm": "layered",
            "elk.direction": direction === "TB" ? "DOWN" : "RIGHT",
            "elk.spacing.nodeNode": "80",
            "elk.layered.spacing.nodeNodeBetweenLayers": direction === "TB" ? "120" : "160",
            "elk.padding": `[top=${LABEL_HEIGHT + GROUP_PADDING},left=${GROUP_PADDING},bottom=${GROUP_PADDING},right=${GROUP_PADDING}]`,
            "elk.hierarchyHandling": "INCLUDE_CHILDREN",
        },
        children: [...vlElkChildren, ...noVlElkNodes],
        edges: crossEdges,
    };

    const layoutResult = await elk.layout(elkGraph);

    // Build node lookup
    const nodeMap: Record<string, CimNode> = {};
    for (const node of nodes) nodeMap[node.id] = node;

    const resultNodes: CimNode[] = [];
    const updatedVlGroups: CimNode[] = [];
    const groupId = substationGroup.id;

    for (const elkChild of layoutResult.children || []) {
        if (vlGroupIds.has(elkChild.id)) {
            const origVlg = nodeMap[elkChild.id];
            if (origVlg) {
                updatedVlGroups.push({
                    ...origVlg,
                    position: { x: elkChild.x ?? 0, y: elkChild.y ?? 0 },
                    style: { ...origVlg.style, width: elkChild.width, height: elkChild.height },
                    parentId: groupId,
                    extent: "parent" as const,
                });
            }

            for (const elkLeaf of elkChild.children || []) {
                const origNode = nodeMap[elkLeaf.id];
                if (origNode) {
                    resultNodes.push({
                        ...origNode,
                        position: { x: elkLeaf.x ?? 0, y: elkLeaf.y ?? 0 },
                        parentId: elkChild.id,
                        extent: "parent" as const,
                    });
                }
            }
        } else {
            const origNode = nodeMap[elkChild.id];
            if (origNode) {
                resultNodes.push({
                    ...origNode,
                    position: { x: elkChild.x ?? 0, y: elkChild.y ?? 0 },
                    parentId: groupId,
                    extent: "parent" as const,
                });
            }
        }
    }

    const updatedGroup: CimNode = {
        ...substationGroup,
        position: { x: 0, y: 0 },
        style: {
            ...substationGroup.style,
            width: layoutResult.width ?? 800,
            height: layoutResult.height ?? 600,
        },
    };

    return {
        nodes: [updatedGroup, ...updatedVlGroups, ...resultNodes],
        edges,
    };
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
 * Uses ELK (Eclipse Layout Kernel) for hierarchical substation layout.
 * ELK natively supports compound/hierarchical graphs, so we build the
 * substation -> VL -> equipment hierarchy directly in the ELK graph model.
 */
async function elkLayoutSubstationGraph(
    nodes: CimNode[],
    edges: Edge[],
    substation: CIM,
    voltageLevels: { vl: IdentifiedObject; bayIds: string[] }[],
    rdfIdToVlId: Record<string, string>,
    direction: "TB" | "LR"
): Promise<{ nodes: CimNode[]; edges: Edge[] }> {
    const elk = new ELK();

    const GROUP_PADDING = 60;
    const LABEL_HEIGHT = 40;
    const VL_PADDING = 30;
    const VL_LABEL_HEIGHT = 30;
    const NODE_WIDTH = 180;
    const NODE_HEIGHT = 40;

    // Build node lookup
    const nodeMap: Record<string, CimNode> = {};
    for (const node of nodes) {
        nodeMap[node.id] = node;
    }

    // Build VL id -> name map
    const vlNameMap: Record<string, string> = {};
    for (const { vl } of voltageLevels) {
        vlNameMap[vl.mRID] = vl.name;
    }

    // Partition nodes by VL
    const vlNodeMap: Record<string, CimNode[]> = {};
    const noVlNodes: CimNode[] = [];
    for (const node of nodes) {
        const vlId = rdfIdToVlId[node.id];
        if (vlId) {
            if (!vlNodeMap[vlId]) vlNodeMap[vlId] = [];
            vlNodeMap[vlId].push(node);
        } else {
            noVlNodes.push(node);
        }
    }

    // Collect all node IDs in each VL for edge routing
    const allVlNodeIds = new Set<string>();
    for (const nodeList of Object.values(vlNodeMap)) {
        for (const n of nodeList) allVlNodeIds.add(n.id);
    }

    // Build ELK children for each VL group
    const vlElkChildren: ElkNode[] = [];
    const vlGroupIds: string[] = [];

    for (const vlId of Object.keys(vlNodeMap)) {
        const vlNodes = vlNodeMap[vlId];
        if (vlNodes.length === 0) continue;

        const vlGroupId = `vl-group-${vlId}`;
        vlGroupIds.push(vlGroupId);

        // ELK edges that are internal to this VL
        const vlEdges: ElkExtendedEdge[] = [];
        const vlNodeIdSet = new Set(vlNodes.map((n) => n.id));

        for (const edge of edges) {
            if (vlNodeIdSet.has(edge.source) && vlNodeIdSet.has(edge.target)) {
                vlEdges.push({
                    id: edge.id,
                    sources: [edge.source],
                    targets: [edge.target],
                });
            }
        }

        vlElkChildren.push({
            id: vlGroupId,
            layoutOptions: {
                "elk.algorithm": "layered",
                "elk.direction": direction === "TB" ? "DOWN" : "RIGHT",
                "elk.spacing.nodeNode": "60",
                "elk.layered.spacing.nodeNodeBetweenLayers": direction === "TB" ? "100" : "120",
                "elk.padding": `[top=${VL_LABEL_HEIGHT + VL_PADDING},left=${VL_PADDING},bottom=${VL_PADDING},right=${VL_PADDING}]`,
                "elk.hierarchyHandling": "INCLUDE_CHILDREN",
            },
            children: vlNodes.map((n) => ({
                id: n.id,
                width: n.measured?.width ?? NODE_WIDTH,
                height: n.measured?.height ?? NODE_HEIGHT,
            })),
            edges: vlEdges,
        });
    }

    // Unparented nodes (substation-level equipment)
    const noVlElkNodes: ElkNode[] = noVlNodes.map((n) => ({
        id: n.id,
        width: n.measured?.width ?? NODE_WIDTH,
        height: n.measured?.height ?? NODE_HEIGHT,
    }));

    // Cross-VL and cross-boundary edges (between different VLs or between VL and non-VL nodes)
    const crossEdges: ElkExtendedEdge[] = [];
    for (const edge of edges) {
        const srcVl = rdfIdToVlId[edge.source];
        const tgtVl = rdfIdToVlId[edge.target];
        // Skip edges that are internal to a single VL (already handled above)
        if (srcVl && tgtVl && srcVl === tgtVl) continue;
        crossEdges.push({
            id: edge.id,
            sources: [srcVl ? `vl-group-${srcVl}` : edge.source],
            targets: [tgtVl ? `vl-group-${tgtVl}` : edge.target],
        });
    }

    const elkGraph: ElkNode = {
        id: "root",
        layoutOptions: {
            "elk.algorithm": "layered",
            "elk.direction": direction === "TB" ? "DOWN" : "RIGHT",
            "elk.spacing.nodeNode": "80",
            "elk.layered.spacing.nodeNodeBetweenLayers": direction === "TB" ? "120" : "160",
            "elk.padding": `[top=${LABEL_HEIGHT + GROUP_PADDING},left=${GROUP_PADDING},bottom=${GROUP_PADDING},right=${GROUP_PADDING}]`,
            "elk.hierarchyHandling": "INCLUDE_CHILDREN",
        },
        children: [...vlElkChildren, ...noVlElkNodes],
        edges: crossEdges,
    };

    const layoutResult = await elk.layout(elkGraph);

    // Convert ELK result back to React Flow nodes
    const resultNodes: CimNode[] = [];
    const groupId = `group-${substation.rdfId}`;

    // Process VL groups
    const vlGroupNodesResult: CimNode[] = [];
    for (const elkChild of layoutResult.children || []) {
        if (vlGroupIds.includes(elkChild.id)) {
            // This is a VL group
            const vlId = elkChild.id.replace("vl-group-", "");

            const vlGroupNode: CimNode = {
                id: elkChild.id,
                type: "substationGroup",
                position: { x: elkChild.x ?? 0, y: elkChild.y ?? 0 },
                style: { width: elkChild.width ?? 200, height: elkChild.height ?? 100 },
                data: {
                    cimData: { rdfId: vlId, rdfType: "cim:VoltageLevel" } as CIM,
                    otherData: {
                        color: undefined,
                        expanded: undefined,
                        isGroup: true,
                        groupType: "voltageLevel",
                    },
                    label: vlNameMap[vlId] || vlId,
                    substationName: vlNameMap[vlId] || "",
                    groupType: "voltageLevel",
                },
                selectable: true,
                draggable: true,
                parentId: groupId,
                extent: "parent" as const,
                zIndex: 0,
            } as CimNode;

            vlGroupNodesResult.push(vlGroupNode);

            // Process children of this VL group
            for (const elkLeaf of elkChild.children || []) {
                const origNode = nodeMap[elkLeaf.id];
                if (origNode) {
                    resultNodes.push({
                        ...origNode,
                        position: { x: elkLeaf.x ?? 0, y: elkLeaf.y ?? 0 },
                        parentId: elkChild.id,
                        extent: "parent" as const,
                    });
                }
            }
        } else {
            // This is an unparented node (substation-level equipment)
            const origNode = nodeMap[elkChild.id];
            if (origNode) {
                resultNodes.push({
                    ...origNode,
                    position: { x: elkChild.x ?? 0, y: elkChild.y ?? 0 },
                    parentId: groupId,
                    extent: "parent" as const,
                });
            }
        }
    }

    // Create the substation group node
    const groupNode: CimNode = {
        id: groupId,
        type: "substationGroup",
        position: { x: 0, y: 0 },
        style: {
            width: layoutResult.width ?? 800,
            height: layoutResult.height ?? 600,
        },
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

    return {
        nodes: [groupNode, ...vlGroupNodesResult, ...resultNodes],
        edges,
    };
}

/**
 * Takes a flat set of layouted nodes and wraps them inside a substation group node
 * with nested VoltageLevel sub-groups.
 *
 * Hierarchy:  Substation group -> VL groups -> equipment/terminal/CN nodes
 * Nodes not belonging to any VL stay directly under the substation group.
 */
function wrapInSubstationGroup(
    nodes: CimNode[],
    edges: Edge[],
    substation: CIM,
    voltageLevels: { vl: IdentifiedObject; bayIds: string[] }[],
    rdfIdToVlId: Record<string, string>
): { nodes: CimNode[]; edges: Edge[] } {
    if (nodes.length === 0) return { nodes, edges };

    const GROUP_PADDING = 60;
    const LABEL_HEIGHT = 40;
    const VL_PADDING = 30;
    const VL_LABEL_HEIGHT = 30;

    // Partition nodes by VL
    const vlNodeMap: Record<string, CimNode[]> = {};
    const noVlNodes: CimNode[] = [];

    for (const node of nodes) {
        const vlId = rdfIdToVlId[node.id];
        if (vlId) {
            if (!vlNodeMap[vlId]) vlNodeMap[vlId] = [];
            vlNodeMap[vlId].push(node);
        } else {
            noVlNodes.push(node);
        }
    }

    // Build VL id -> name map
    const vlNameMap: Record<string, string> = {};
    for (const { vl } of voltageLevels) {
        vlNameMap[vl.mRID] = vl.name;
    }

    const resultNodes: CimNode[] = [];

    // Create VL group nodes and adjust children
    const vlGroupNodes: CimNode[] = [];

    for (const vlId of Object.keys(vlNodeMap)) {
        const vlNodes = vlNodeMap[vlId];
        if (vlNodes.length === 0) continue;

        // Compute VL bounding box
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        for (const node of vlNodes) {
            const x = node.position.x;
            const y = node.position.y;
            const w = node.measured?.width ?? 180;
            const h = node.measured?.height ?? 40;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + w);
            maxY = Math.max(maxY, y + h);
        }

        const vlGroupId = `vl-group-${vlId}`;
        const vlGx = minX - VL_PADDING;
        const vlGy = minY - VL_PADDING - VL_LABEL_HEIGHT;
        const vlGw = maxX - minX + VL_PADDING * 2;
        const vlGh = maxY - minY + VL_PADDING * 2 + VL_LABEL_HEIGHT;

        const vlGroupNode: CimNode = {
            id: vlGroupId,
            type: "substationGroup",
            position: { x: vlGx, y: vlGy },
            style: { width: vlGw, height: vlGh },
            data: {
                cimData: { rdfId: vlId, rdfType: "cim:VoltageLevel" } as CIM,
                otherData: {
                    color: undefined,
                    expanded: undefined,
                    isGroup: true,
                    groupType: "voltageLevel",
                },
                label: vlNameMap[vlId] || vlId,
                substationName: vlNameMap[vlId] || "",
                groupType: "voltageLevel",
            },
            selectable: true,
            draggable: true,
            zIndex: 0,
        } as CimNode;

        vlGroupNodes.push(vlGroupNode);

        // Convert VL children to be relative to VL group
        for (const node of vlNodes) {
            resultNodes.push({
                ...node,
                position: {
                    x: node.position.x - vlGx,
                    y: node.position.y - vlGy,
                },
                parentId: vlGroupId,
                extent: "parent" as const,
            });
        }
    }

    // Now compute bounding box of ALL top-level elements (VL groups + unparented nodes)
    const topLevelElements = [...vlGroupNodes, ...noVlNodes];
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
    for (const node of topLevelElements) {
        const x = node.position.x;
        const y = node.position.y;
        const w = (node.style as any)?.width ?? node.measured?.width ?? 180;
        const h = (node.style as any)?.height ?? node.measured?.height ?? 40;
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

    // Create the substation group node
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

    // Adjust VL groups to be relative to the substation group
    const adjustedVlGroups = vlGroupNodes.map((vlg) => ({
        ...vlg,
        position: {
            x: vlg.position.x - groupX,
            y: vlg.position.y - groupY,
        },
        parentId: groupId,
        extent: "parent" as const,
    }));

    // Adjust unparented nodes to be relative to the substation group
    const adjustedNoVlNodes = noVlNodes.map((node) => ({
        ...node,
        position: {
            x: node.position.x - groupX,
            y: node.position.y - groupY,
        },
        parentId: groupId,
        extent: "parent" as const,
    }));

    return {
        nodes: [groupNode, ...adjustedVlGroups, ...resultNodes, ...adjustedNoVlNodes],
        edges,
    };
}
