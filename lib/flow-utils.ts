import {CimNode} from "@/lib/store/store-flow";
import {Edge, MarkerType} from "@xyflow/react";
import {ACLineSegment, CIM, ConnectivityNode, EquipmentContainer, IdentifiedObject, isConductingEquipment, Substation, Terminal, VoltageLevel} from "@/lib/cim";
import Dagre from '@dagrejs/dagre';
import {componentRefs} from "@/lib/services/cim-service";
import { getComponentById } from "./store/model-repository";
import { subscribe } from "diagnostics_channel";


export function doesEquipmentExistsInFlow(rdfId: string, nodes: CimNode[]): boolean {
    return nodes.some(node => node.data.cimData.rdfId === rdfId);
}

export const edgeTemplate = {
    //type: 'cimEdge',
    markerStart: {
        type: MarkerType.ArrowClosed,
        width: 10,
        height: 10,
        color: '#07964a',
    },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 10,
        height: 10,
        color: '#07964a',
    },
    // label: 'T',
    style: {
        strokeWidth: 3,
        stroke: '#07964a',
    }
}

export function createNode(id: string, data: CIM, x: number, y: number, color?: string): CimNode {
    return {
        id: id,
        type: 'flowComponent',
        position: {x: x, y: y},
        data: {cimData: {...data}, otherData: {color}}
    } as CimNode
}

export function createEdge(sourceId: string, targetId: string, fromSource: boolean, sourceHandle?: string, targetHandle?: string): Edge {
    return {
        id: `e${sourceId}-${targetId}`,
        source: fromSource ? sourceId : targetId,
        target: fromSource ? targetId : sourceId,
        sourceHandle: sourceHandle,
        targetHandle: targetHandle,
        ...edgeTemplate,
    } as Edge
}

export const createNodesAndEdges = async (component: CIM): Promise<{ nodes: CimNode[]; edges: Edge[]; }> => {

    console.log(component.rdfId, component.rdfType)

    const nodes: CimNode[] = [createNode(component.rdfId, component, 350, 0, "#a6a6a6")]
    const edges: Edge[] = [];
    if (isConductingEquipment(component) && component.terminals?.length) {
        let firstTerminal = true;
        const terminals = (component.terminals ?? []).sort((a, b) => (a.sequenceNumber ?? 0) - (b.sequenceNumber ?? 0))
        
        for (const terminal of terminals) {
            const substation = await findClosestSubstation(terminal)
            if (substation != null) {
                nodes.push(createNode(substation.rdfId, substation, firstTerminal ? 100 : 800, 0, "#c8ff9e"));
                edges.push(createEdge(substation.rdfId, component.rdfId, firstTerminal));
                firstTerminal = false;
            }
        }
    }
    return {nodes: nodes, edges: edges}
}


/*

    The Layout manger

 */

export const getLayoutedElements = (nodes, edges, options) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    // The space between nodes is set by ranksep (vertical) and nodesep (horizontal)
    g.setGraph({rankdir: options.direction, ranksep: 200, nodesep: 100, ranker: "tight-tree"});

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
        g.setNode(node.id, {
            ...node,
            width: node.measured?.width ?? 0,
            height: node.measured?.height ?? 0,
        }),
    );

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const position = g.node(node.id);
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            const x = position.x //- (node.measured?.width ?? 0) / 2;
            const y = position.y //- (node.measured?.height ?? 0) / 2;
            return {...node, position: {x, y}};
        }),
        edges,
    };
};


/*
   Check if component is allready in the flow
 */


export type ComponentStatus = {
    exists: boolean
    connected: boolean
    equipment: CIM
}

export function componentStatus(equipment: CIM, nodes: CimNode[], edges: Edge[]): ComponentStatus[] {

    const refs = componentRefs(equipment)

    const equipmentInFlow = refs.filter(ref =>
        nodes.find(node => node.data.cimData.rdfId === ref.rdfId)
    ) || []

    const idsInFlow = equipmentInFlow.map(ref => ref.rdfId)

    const missingConnections: string[] = []

    edges.forEach(edge => {
        if (edge.source === equipment.rdfId || edge.target === equipment.rdfId) {
            if (idsInFlow.includes(edge.source) || idsInFlow.includes(edge.target)) {
                if (edge.source === equipment.rdfId)
                    missingConnections.push(edge.target)
                else
                    missingConnections.push(edge.source)
            }
        }
    })
    const filteredComponentRefs = refs.map(ref => {
        const exists = nodes.find(node => node.data.cimData.rdfId === ref.rdfId) !== undefined
        return {exists: exists, connected: missingConnections.includes(ref.rdfId), equipment: ref}
    }) || []

    return filteredComponentRefs
}

// async function checkSaveAndContinue(component, fullSubstation) {
//     if (!fullSubstation.some(x => x.mRID === component.mRID)) {
//         fullSubstation.push(component)
//         await compFinder(component, fullSubstation)
//         console.log(fullSubstation)
//     }
// }

// async function compFinder(component: IdentifiedObject, fullSubstation) {
//         // console.log("finding components under: ")
//         switch (component["rdfType"]) {
//             case "cim:Substation":
//                 fullSubstation.push(component["cim:IdentifiedObject.name"])
//                 for (const e of component["cim:EquipmentContainer.Equipments"] ?? []) {
//                     let substationEquipment = await findById(e["mRID"])
//                     checkSaveAndContinue(substationEquipment, fullSubstation)
//                 }
//             case "cim:PowerTransformer":
//                 for (const e of component["cim:ConductingEquipment.Terminals"] ?? []) {
//                     let terminal = await findById(e["mRID"])
//                     checkSaveAndContinue(terminal, fullSubstation)
//                 }
//             case "cim:Terminal":
//                 const mRID = component["cim:Terminal.ConnectivityNode"]?.mRID;
//                 if (mRID) {
//                     const connectivityNode = await findById(mRID);
//                     checkSaveAndContinue(connectivityNode, fullSubstation)
//                 }
//             case "cim:ConnectivityNode":
//                 for (const e of component["cim:ConnectivityNode.Terminals"] ?? []) {
//                     let terminal = await findById(e["mRID"])
//                     checkSaveAndContinue(terminal, fullSubstation)
//                 }
//             default:
//                 break;
//         }
//     }

async function findClosestSubstation(component: CIM): Promise<Substation | null> {
    let terminal: Terminal | null = await getComponentById(component.rdfId)
    let fullSubstation: object[] = []
    if (terminal != null) {
        const cn: ConnectivityNode | null = await getComponentById(terminal.connectivityNode.mRID)
        if (cn != null) {
            const cnContainer: EquipmentContainer | null = await getComponentById(cn.connectivityNodeContainer.mRID)
            if (cnContainer != null) {                            
                const voltageLevel: VoltageLevel | null = await getComponentById(cnContainer?.mRID)
                if (voltageLevel != null) {
                    const subStation: Substation | null = await getComponentById(voltageLevel.substation.mRID)
                    if (subStation != null) {
                        let subStationMrid = subStation.mRID
                        let stationName = subStation.name
                        
                        console.log("Closest substation is: " + stationName + subStationMrid)
                        return subStation
                    } else {
                    return null
                }
                } else {
                    return null
                }
            } else {
                return null
            }
        } else {
        return null
        }
    } else {
        return null
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
