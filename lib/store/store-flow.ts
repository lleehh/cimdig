import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Edge, MarkerType,
    Node,
    OnConnect,
    OnEdgesChange,
    OnNodesChange
} from "@xyflow/react";
import {create} from "zustand";
import {CIM, isConductingEquipment} from "@/lib/cim";
import {edgeTemplate} from "@/lib/flow-utils";

export type CimNode = Node<CIM, 'flowComponent'>

export type FlowState = {
    nodes: CimNode[];
    edges: Edge[];
    onNodesChange: OnNodesChange<CimNode>;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: CimNode[]) => void;
    setEdges: (edges: Edge[]) => void;
    getNodeData: (id: string) => CIM | undefined;
    addNode: (node: CimNode) => void;
};

/*
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
    useShallow(selector),
  );

 */

export const selector = (state: FlowState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    getNodeData: state.getNodeData,
    addNode: state.addNode,
});


const useFlowStore = create<FlowState>((set, get) => ({
    nodes: [],
    edges: [],
    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection) => {
        const edge = {...connection, ...edgeTemplate};
        //@ts-ignore
        set({
            edges: addEdge(edge, get().edges),
        });
    },
    setNodes: (nodes) => {
        set({nodes});
    },
    setEdges: (edges) => {
        set({edges});
    },
    getNodeData: (nodeId) => {
        console.log("get node data", nodeId, get().nodes)
        return get().nodes.find((node) => node.id === nodeId)?.data;
    },
    addNode: (node) => {
        console.log("add node", node)
        set((state) => {
            return ({
                nodes: [...state.nodes, node]
            })
        })

    }
}));

export default useFlowStore;