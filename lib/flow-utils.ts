import {CimNode} from "@/lib/store/store-flow";
import {Edge, MarkerType} from "@xyflow/react";
import {CIM, IdentifiedObject, isConductingEquipment} from "@/lib/cim";
import Dagre from '@dagrejs/dagre';
import {JsonData} from "@/lib/store/model-repository";


export function doesEquipmentExistsInFlow(rdfId: string, nodes: CimNode[]): boolean {
    return nodes.some(node => node.data.rdfId === rdfId);
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

export function createNode(id: string, data: CIM, x: number, y: number): CimNode {
    return {
        id: id,
        type: 'flowComponent',
        position: {x: x, y: y},
        data: data
    } as CimNode
}

export function createEdge(sourceId: string, targetId: string, fromSource: boolean): Edge {
    return {
        id: `e${sourceId}-${targetId}`,
        source: fromSource ? sourceId : targetId,
        target: fromSource ? targetId : sourceId,
        ...edgeTemplate,
    } as Edge
}

export const createNodesAndEdges = (component: CIM): { nodes: CimNode[], edges: Edge[] } => {

    console.log(component.rdfId, component.rdfType)
    const nodes: CimNode[] = [createNode(component.mRID, component, 350, 0)]
    const edges: Edge[] = [];
    if (isConductingEquipment(component)) {
        let firstTerminal = true
        component.terminals
            .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
            .forEach((terminal) => {
                nodes.push(createNode(terminal.rdfId, terminal, firstTerminal ? 100 : 800, 0))
                edges.push(createEdge(terminal.rdfId, component.rdfId, firstTerminal))
                firstTerminal = false
            })
    }
    return {nodes: nodes, edges: edges}
}


/*

    The Layout manger

 */

export const getLayoutedElements = (nodes, edges, options) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    // The space between nodes is set by ranksep (vertical) and nodesep (horizontal)
    g.setGraph({rankdir: options.direction, ranksep: 100, nodesep: 100});

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
            const x = position.x - (node.measured?.width ?? 0) / 2;
            const y = position.y - (node.measured?.height ?? 0) / 2;
            return {...node, position: {x, y}};
        }),
        edges,
    };
};
