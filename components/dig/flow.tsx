'use client';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge, Viewport, Controls, MiniMap, Background, Panel, NodeTypes
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import {useCallback} from "react";
import {Button} from "@/components/ui/button";
import FlowComponent from "@/components/dig/flow-component";

const nodeTypes: NodeTypes = {flowContainer: FlowComponent}

const testACLineSegment = {
    rdfId: 'f1769b90-9aeb-11e5-91da-b8763fd99c5f',
    rdfType: 'cim:ACLineSegment',
    mRID: 'f1769b90-9aeb-11e5-91da-b8763fd99c5f',
    bch: 0.0003333333,
    r: 22.5,
    x: 180,
    length: 0,
    baseVoltage: {
        rdfId: '2dd90169-bdfb-11e5-94fa-c8f73332c8f4',
        rdfType: 'cim:BaseVoltage',
        mRID: '2dd90169-bdfb-11e5-94fa-c8f73332c8f4',
        nominalVoltage: 300,
        name: '300kV'
    },
    aggregate: false,
    normallyInService: true,
    description: "3701 6700 '1 '",
    name: '300AJAURE-MO',
    equipmentContainer: {
        rdfId: '5e7d0b4c-fa65-1d40-aef6-779298018c7e',
        rdfType: 'cim:Line',
        mRID: '5e7d0b4c-fa65-1d40-aef6-779298018c7e',
        region: {
            rdfId: 'f17695c3-9aeb-11e5-91da-b8763fd99c5f',
            rdfType: undefined,
            mRID: 'f17695c3-9aeb-11e5-91da-b8763fd99c5f'
        },
        name: 'LC 300AJAURE-MO'
    },
    items: [
        {
            rdfId: '2dd903ad-bdfb-11e5-94fa-c8f73332c8f4',
            rdfType: 'cim:OperatingShare',
            mRID: '2dd903ad-bdfb-11e5-94fa-c8f73332c8f4',
            operatingParticipant: [Object],
            powerSystemResource: [Object],
            percentage: '100'
        }
    ],
    terminals: [
        {
            rdfId: '2dd903ab-bdfb-11e5-94fa-c8f73332c8f4',
            rdfType: 'cim:Terminal',
            mRID: '2dd903ab-bdfb-11e5-94fa-c8f73332c8f4',
            conductingEquipment: [Object],
            connectivityNode: [Object],
            name: 'T1',
            description: "3701 6700 '1 '",
            sequenceNumber: 1
        },
        {
            rdfId: '2dd903ac-bdfb-11e5-94fa-c8f73332c8f4',
            rdfType: 'cim:Terminal',
            mRID: '2dd903ac-bdfb-11e5-94fa-c8f73332c8f4',
            conductingEquipment: [Object],
            connectivityNode: [Object],
            name: 'T2',
            description: "3701 6700 '1 '",
            sequenceNumber: 2
        }
    ]
}

const initialNodes = [
    {id: '1', type: 'flowContainer', position: {x: 0, y: 0}, data: testACLineSegment},
    {id: '2', type: 'flowContainer', position: {x: 0, y: 100}, data: {rdfType: 'HeiHopp', name: 'HeiHopp'}},
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
                        <Button onClick={() => onLayout('TB')}>vertical layout</Button>
                        <Button onClick={() => onLayout('LR')}>horizontal layout</Button>
                    </div>
                </Panel>
                <Background/>
                <MiniMap/>
                <Controls/>
            </ReactFlow>
        </div>
    )
}