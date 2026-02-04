 import {addEdge, applyEdgeChanges, applyNodeChanges, Edge, Node, OnConnect, OnEdgesChange, OnNodesChange} from "@xyflow/react";
import {create} from "zustand";
import {CIM, RdfValue} from "@/lib/cim";
import {edgeTemplate} from "@/lib/flow-utils";

export interface OtherData {
    color: string | undefined
    expanded: boolean | undefined

    [key: string]: any;
}

export interface NodeData {
    cimData: CIM  // - Data related to the CIM component that the node is representing. Should NOT be altered.
    otherData: OtherData // - Data related to the node that is not stored in CIM, such as colors, whether or not it can be expanded, etc... Can be altered.

    [key: string]: any;
}

export type CimNode = Node<NodeData, 'flowComponent'>

export type FlowState = {
    nodes: CimNode[];
    edges: Edge[];
    focusNodeId: string | null;
    onNodesChange: OnNodesChange<CimNode>;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: CimNode[]) => void;
    setEdges: (edges: Edge[]) => void;
    getNodeData: (id: string) => NodeData | undefined;
    addNode: (node: CimNode) => void;
    setFocusNode: (id: string) => void;
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
    focusNodeId: state.focusNodeId,
    setFocusNode: state.setFocusNode,
});


const useFlowStore = create<FlowState>((set, get) => ({
    nodes: [],
    edges: [],
    focusNodeId: null, // Add this line to initialize focusNodeId
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
    },
    setFocusNode: (id) => {
        console.log("focus node", id)
        set((state) => {
            return ({
                focusNodeId: id
            })
        })
    }
}));

export default useFlowStore;