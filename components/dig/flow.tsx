'use client';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge, Viewport, Controls, MiniMap, Background, Panel, Node
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import {useCallback} from "react";
import {Button} from "@/components/ui/button";
import BreakerComponent, { FlowBreakerComponent } from '../equipment/breaker';
import { Breaker } from '@/models/cim';

export type BreakerNode = Node<Breaker, 'breaker'>;

const initialNodes = [
    {id: '1', position: {x: 0, y: 0}, data: {label: '1'}},
    {id: '2', position: {x: 0, y: 100}, data: {label: '2'}, type: 'breaker'},
];
const initialEdges = [{id: 'e1-2', source: '1', target: '2'}];

export default function Dig() {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [nodes, _, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        // eslint-disable-next-line
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onLayout = (layout: string) => {
        console.log('layout', layout)
    }

    const defaultViewport: Viewport = {x: 100, y: 300, zoom: 0.8};

    const nodeTypes = { breaker: FlowBreakerComponent};

    return (
        <div className="relative flex flex-col h-full flex-grow">
            <ReactFlow style={{width: '100%', height: '100%'}}
                       nodes={nodes}
                       edges={edges}
                       onNodesChange={onNodesChange}
                       onEdgesChange={onEdgesChange}
                       onConnect={onConnect}
                       defaultViewport={defaultViewport}
                       nodeTypes={nodeTypes}
            >
                <Panel position="top-right">
                    <div
                        className={'flex space-x-2'}>
                        <Button  onClick={() => onLayout('TB')}>vertical layout</Button>
                        <Button  onClick={() => onLayout('LR')}>horizontal layout</Button>
                    </div>
                </Panel>
                <Background/>
                <MiniMap/>
                <Controls/>
            </ReactFlow>
        </div>
    )
}