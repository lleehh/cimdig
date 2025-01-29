"use client"
import {addEdge, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import {useCallback, useState} from "react";

export default function Page() {

    const [x, setX] = useState(100)
    const [y, setY] = useState(100)

    const initialNodes = [
        { id: '1', position: { x: x, y: y }, data: { label: '1' }},
        { id: '2', position: { x: 200, y: 200 }, data: {label: '2' }}
    ]
    const initialEdges = [{ id: 'e1-2', source: '1', target: '2'}]

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );
    function moveNode() {
        setX(300)
        setY(400)
    }
    return (
        <div className="h-screen w-screen">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
            >
                <Controls />
                <MiniMap />
            </ReactFlow>
            <button className="h-10 w-30 bg-amber-700 text-xs cursor-copy" onClick={moveNode}>Move node</button>
        </div>
    )
}