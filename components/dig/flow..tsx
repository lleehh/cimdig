'use client';
import {
    ReactFlowProvider, useReactFlow,
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge, Viewport, Controls, MiniMap, Background, Panel
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import {useCallback} from "react";
import {Button} from "@/components/ui/button";

const initialNodes = [
    {id: '1', position: {x: 0, y: 0}, data: {label: '1'}},
    {id: '2', position: {x: 0, y: 100}, data: {label: '2'}},
];
const initialEdges = [{id: 'e1-2', source: '1', target: '2'}];

export default function Dig() {

    const {fitView} = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onLayout = (layout: string) => {
        console.log('layout', layout)
    }

    const defaultViewport: Viewport = {x: 100, y: 300, zoom: 0.8};

    return (
        <div className="relative flex flex-col h-full flex-grow">
            <ReactFlow style={{width: '100%', height: '100%'}}
                       nodes={nodes}
                       edges={edges}
                       onNodesChange={onNodesChange}
                       onEdgesChange={onEdgesChange}
                       onConnect={onConnect}
                       defaultViewport={defaultViewport}
            >
                <Panel position="top-right">
                    <div
                        className={'flex space-x-2'}>
                        <Button variant="secondary" onClick={() => onLayout('TB')}>vertical layout</Button>
                        <Button variant="secondary" onClick={() => onLayout('LR')}>horizontal layout</Button>
                    </div>
                </Panel>
                <Background/>
                <MiniMap/>
                <Controls/>
            </ReactFlow>
        </div>
    )
}