import {addEdge, applyEdgeChanges, applyNodeChanges, Edge, Node, OnConnect, OnEdgesChange, OnNodesChange} from "@xyflow/react";
import {create} from "zustand";
import {CIM} from "@/lib/cim";
import {edgeTemplate} from "@/lib/flow-utils";

export type CimNode = Node<CIM, 'flowComponent'>

export type FlowState = {
    nodes: CimNode[];
    edges: Edge[];
    focusNodeId: string | null;
    onNodesChange: OnNodesChange<CimNode>;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: CimNode[]) => void;
    setEdges: (edges: Edge[]) => void;
    getNodeData: (id: string) => CIM | undefined;
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