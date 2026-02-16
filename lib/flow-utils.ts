import { CimNode } from "@/lib/store/store-flow";
import { Edge, MarkerType, Position } from "@xyflow/react";
import {
    ACLineSegment,
    CIM,
    ConnectivityNode,
    Equipment,
    EquipmentContainer,
    IdentifiedObject,
    isComponentOfType,
    isConductingEquipment,
    isConnectivityNode,
    isOfType,
    isPowerTransformer,
    isSubstation,
    isTerminal,
    PowerTransformer,
    PowerTransformerEnd,
    Substation,
    Terminal,
    VoltageLevel,
} from "@/lib/cim";
import Dagre from "@dagrejs/dagre";
import { componentRefs } from "@/lib/services/cim-service";
import { getComponentById } from "./store/model-repository";
import { subscribe } from "diagnostics_channel";

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

export function createNode(
    id: string,
    data: CIM,
    x: number,
    y: number,
    parentId?: string,
    color?: string,
    extent?: string
): CimNode {
    return {
        id: id,
        type: "flowComponent",
        position: { x: x, y: y },
        parentId: parentId,
        extent: extent,
        data: { cimData: { ...data }, otherData: { color: color || "gray", expanded: false } },
    } as CimNode;
}

export function createGroupNode(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number
): CimNode {
    return {
        id,
        position: { x, y },
        data: {
            cimData: { rdfId: "", rdfType: "" },
            otherData: { color: undefined, expanded: undefined },
        },
        style: {
            width,
            height,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
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

export const createNodesAndEdges = async (
    component: CIM
): Promise<{ nodes: CimNode[]; edges: Edge[] }> => {
    console.log(component.rdfId, component.rdfType);

    const nodes: CimNode[] = [createNode(component.rdfId, component, 350, 0, undefined, "#ff9e9e")];
    const edges: Edge[] = [];

    if (isConductingEquipment(component) && component.terminals?.length) {
        let firstTerminal = true;
        const terminals = (component.terminals ?? []).sort(
            (a, b) => (a.sequenceNumber ?? 0) - (b.sequenceNumber ?? 0)
        );

        for (const terminal of terminals) {
            const substation = await findClosestSubstation(terminal);
            if (substation != null) {
                const groupId = `group-${substation.rdfId}`;
                const componentsInSubStation = await collectSubstation(substation);

                nodes.push(createGroupNode(groupId, 0, 0, 600, 300));
                let offsetY = 40;

                componentsInSubStation.forEach((subStationComp) => {
                    nodes.push(
                        createNode(
                            subStationComp.rdfId,

                            subStationComp,
                            20,
                            offsetY,
                            groupId,
                            undefined,
                            "parent"
                        )
                    );
                    offsetY += 80;
                });

                for (const substationComp of componentsInSubStation) {
                    const { newEdges } = createConnectingNodes(nodes, substationComp);
                    newEdges.forEach((edge) => {
                        // Only add edge if both nodes exist in this group
                        const sourceExists = nodes.find((n) => n.id === edge.source);

                        const targetExists = nodes.find((n) => n.id === edge.target);

                        if (sourceExists && targetExists) {
                            edges.push(edge);
                        }
                    });
                }
                firstTerminal = false;
            }
        }
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
        refs.filter((ref) => nodes.find((node) => node?.data.cimData.rdfId === ref.rdfId)) || [];

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

async function collectSubstation(substation: IdentifiedObject): Promise<CIM[]> {
    const result: CIM[] = [];

    async function traverse(component: IdentifiedObject | null) {
        if (!component) return;

        result.push(component);

        switch (component.rdfType) {
            case "cim:Substation":
                for (const vl of component.voltageLevels ?? []) {
                    await traverse(await getComponentById(vl.mRID));
                }
                break;

            case "cim:VoltageLevel":
                for (const bay of component.bays ?? []) {
                    await traverse(await getComponentById(bay.mRID));
                }
                break;

            case "cim:Bay":
                for (const eq of component.equipments ?? []) {
                    await traverse(await getComponentById(eq.mRID));
                }
                break;

            case "cim:Equipment":
                for (const t of component.terminals ?? []) {
                    await traverse(await getComponentById(t.mRID));
                }
                break;

            case "cim:Terminal":
                break;
        }
    }

    await traverse(substation);

    return result;
}

async function findClosestSubstation(component: CIM): Promise<Substation | null> {
    let terminal: Terminal | null = await getComponentById(component.rdfId);
    let fullSubstation: object[] = [];
    if (terminal != null) {
        const cn: ConnectivityNode | null = await getComponentById(terminal.connectivityNode.mRID);
        if (cn != null) {
            const cnContainer: EquipmentContainer | null = await getComponentById(
                cn.connectivityNodeContainer.mRID
            );
            if (cnContainer != null) {
                const voltageLevel: VoltageLevel | null = await getComponentById(cnContainer?.mRID);
                if (voltageLevel != null) {
                    const subStation: Substation | null = await getComponentById(
                        voltageLevel.substation.mRID
                    );
                    if (subStation != null) {
                        let subStationMrid = subStation.mRID;
                        let stationName = subStation.name;

                        console.log("Closest substation is: " + stationName + subStationMrid);
                        return subStation;
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    } else {
        return null;
    }
}

// switch (component.rdfType) {
//     case "cim:ACLineSegment":
//         let acLineSegment: ACLineSegment | null = await getComponentById(component.rdfId)
//         if (acLineSegment != null) {
//             for (const e of acLineSegment.terminals) {
//                 let terminal: Terminal | null = await getComponentById(e.mRID)
//                 if (terminal != null) {
//                     findClosestSubstation(terminal)
//                 }
//             }
//         }
//         break;
//     case "cim:Terminal":
//         let terminal: Terminal | null = await getComponentById(component.rdfId)
//         let fullSubstation: object[] = []
//         if (terminal != null) {
//             const cn: ConnectivityNode | null = await getComponentById(terminal.connectivityNode.mRID)
//             if (cn != null) {
//                 const cnContainer: EquipmentContainer | null = await getComponentById(cn.connectivityNodeContainer.mRID)
//                 if (cnContainer != null) {
//                     const voltageLevel: VoltageLevel | null = await getComponentById(cnContainer?.mRID)
//                     if (voltageLevel != null) {
//                         const subStation: Substation | null = await getComponentById(voltageLevel.substation.mRID)
//                         if (subStation != null) {
//                             let subStationMrid = subStation.mRID
//                             let stationName = subStation.name

//                             console.log("Closest substation is: " + stationName + subStationMrid)
//                             return subStation
//                         }
//                     }
//                 }
//             }
//         }
//     default:
//         return null
//         break;
// }

// export async function getCompAndCheckIfStation(id: string): CIM {

//     const component = await getComponentById(id)
//     if (component != null) {
//         const thing = findClosestSubstation(component)
//     }

// }
